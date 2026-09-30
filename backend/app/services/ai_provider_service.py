from datetime import datetime, timezone

import httpx
from fastapi import HTTPException
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.secret_box import SecretBox
from app.core.settings import Settings
from app.models.ai import AiProvider
from app.schemas.ai import AiProviderCheck, AiProviderPatch, AiProviderProbe, AiProviderView, AiProviderWrite


class AiProviderService:
    def __init__(self, session: AsyncSession, settings: Settings) -> None:
        self._session = session
        self._secrets = SecretBox(settings)

    async def list_providers(self) -> list[AiProviderView]:
        rows = list(await self._session.scalars(select(AiProvider).order_by(AiProvider.purpose, AiProvider.id)))
        return [self._view(row) for row in rows]

    async def create(self, data: AiProviderWrite) -> AiProviderView:
        if data.enabled:
            await self._disable_purpose(data.purpose)
        row = AiProvider(
            purpose=data.purpose,
            protocol=data.protocol,
            base_url=str(data.base_url).rstrip("/"),
            encrypted_api_key=self._secrets.encrypt(data.api_key),
            model=data.model,
            enabled=data.enabled,
        )
        self._session.add(row)
        await self._session.commit()
        await self._session.refresh(row)
        return self._view(row)

    async def update(self, provider_id: int, data: AiProviderPatch) -> AiProviderView:
        row = await self._get(provider_id)
        changes = data.model_dump(exclude_unset=True)
        if changes.get("enabled") is True:
            await self._disable_purpose(row.purpose, except_id=row.id)
        if "base_url" in changes and changes["base_url"] is not None:
            changes["base_url"] = str(changes["base_url"]).rstrip("/")
        if "api_key" in changes:
            changes["encrypted_api_key"] = self._secrets.encrypt(changes.pop("api_key"))
        for name, value in changes.items():
            setattr(row, name, value)
        row.updated_at = datetime.now(timezone.utc)
        await self._session.commit()
        await self._session.refresh(row)
        return self._view(row)

    async def delete(self, provider_id: int) -> None:
        row = await self._get(provider_id)
        await self._session.delete(row)
        await self._session.commit()

    async def check(self, provider_id: int) -> AiProviderCheck:
        row = await self._get(provider_id)
        try:
            key = self._secrets.decrypt(row.encrypted_api_key)
        except ValueError:
            return AiProviderCheck(ok=False, detail="provider_key_unreadable")
        return await self._probe(row.base_url, key)

    async def probe(self, data: AiProviderProbe) -> AiProviderCheck:
        return await self._probe(str(data.base_url), data.api_key)

    async def _probe(self, base_url: str, key: str) -> AiProviderCheck:
        url = f"{base_url.rstrip('/')}/models"
        try:
            async with httpx.AsyncClient(timeout=15) as client:
                response = await client.get(url, headers={"Authorization": f"Bearer {key}"})
        except httpx.HTTPError:
            return AiProviderCheck(ok=False, detail="provider_unreachable")
        if response.status_code >= 400:
            return AiProviderCheck(ok=False, detail="provider_rejected")
        payload = response.json()
        names = [item.get("id", "") for item in payload.get("data", []) if isinstance(item, dict)]
        return AiProviderCheck(ok=True, models=[name for name in names if name])

    async def enabled(self, purpose: str) -> tuple[AiProvider, str]:
        row = await self._session.scalar(
            select(AiProvider).where(AiProvider.purpose == purpose, AiProvider.enabled.is_(True))
        )
        if row is None:
            raise HTTPException(status_code=409, detail="ai_provider_missing")
        try:
            return row, self._secrets.decrypt(row.encrypted_api_key)
        except ValueError as error:
            raise HTTPException(status_code=409, detail="provider_key_unreadable") from error

    async def _disable_purpose(self, purpose: str, except_id: int | None = None) -> None:
        statement = update(AiProvider).where(AiProvider.purpose == purpose, AiProvider.enabled.is_(True))
        if except_id is not None:
            statement = statement.where(AiProvider.id != except_id)
        await self._session.execute(statement.values(enabled=False))

    async def _get(self, provider_id: int) -> AiProvider:
        row = await self._session.get(AiProvider, provider_id)
        if row is None:
            raise HTTPException(status_code=404, detail="provider_not_found")
        return row

    def _view(self, row: AiProvider) -> AiProviderView:
        try:
            key = self._secrets.decrypt(row.encrypted_api_key)
        except ValueError:
            key = ""
        return AiProviderView(
            id=row.id,
            purpose=row.purpose,
            protocol=row.protocol,
            base_url=row.base_url,
            api_key=key,
            model=row.model,
            enabled=row.enabled,
            created_at=row.created_at,
            updated_at=row.updated_at,
        )
