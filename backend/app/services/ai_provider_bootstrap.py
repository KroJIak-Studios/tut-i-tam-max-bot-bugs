from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.settings import Settings
from app.models.ai import AiProvider
from app.schemas.ai import AiProviderWrite
from app.services.ai_provider_service import AiProviderService


async def bootstrap_ai_providers(session: AsyncSession, settings: Settings) -> None:
    service = AiProviderService(session, settings)
    await _ensure(service, session, "chat", settings.chat_provider_base_url, settings.chat_provider_api_key, settings.chat_provider_model)
    await _ensure(service, session, "embedding", settings.embedding_provider_base_url, settings.embedding_provider_api_key, settings.embedding_provider_model)


async def _ensure(service: AiProviderService, session: AsyncSession, purpose: str, base_url: str, api_key: str, model: str) -> None:
    if not base_url.strip() or not api_key.strip() or not model.strip():
        return
    existing = await session.scalar(select(AiProvider).where(AiProvider.purpose == purpose, AiProvider.enabled.is_(True)))
    if existing is not None:
        return
    await service.create(AiProviderWrite(
        purpose=purpose,
        protocol="chat_completions",
        base_url=base_url.strip(),
        api_key=api_key.strip(),
        model=model.strip(),
        enabled=True,
    ))
