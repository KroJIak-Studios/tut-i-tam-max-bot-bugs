import httpx
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.settings import Settings
from app.services.ai_provider_service import AiProviderService


class EmbeddingClient:
    def __init__(self, session: AsyncSession, settings: Settings) -> None:
        self._providers = AiProviderService(session, settings)

    async def embed(self, text: str) -> tuple[list[float], str]:
        provider, key = await self._providers.enabled("embedding")
        payload = {"model": provider.model, "input": text}
        try:
            async with httpx.AsyncClient(timeout=90) as client:
                response = await client.post(
                    f"{provider.base_url.rstrip('/')}/embeddings",
                    headers={"Authorization": f"Bearer {key}"},
                    json=payload,
                )
        except httpx.HTTPError as error:
            raise HTTPException(status_code=502, detail="embedding_unreachable") from error
        if response.status_code >= 400:
            raise HTTPException(status_code=502, detail="embedding_rejected")
        vector = response.json()["data"][0]["embedding"]
        return vector, provider.model
