from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.admin_tokens import require_admin
from app.core.settings import get_settings
from app.db import get_session
from app.schemas.ai import AiProviderCheck, AiProviderPatch, AiProviderProbe, AiProviderView, AiProviderWrite
from app.services.ai_provider_service import AiProviderService

router = APIRouter(prefix="/admin/ai-providers", tags=["admin-ai"], dependencies=[Depends(require_admin)])


def service(session: AsyncSession = Depends(get_session)) -> AiProviderService:
    return AiProviderService(session, get_settings())


@router.get("", response_model=list[AiProviderView])
async def list_providers(providers: AiProviderService = Depends(service)) -> list[AiProviderView]:
    return await providers.list_providers()


@router.post("", response_model=AiProviderView, status_code=201)
async def create_provider(data: AiProviderWrite, providers: AiProviderService = Depends(service)) -> AiProviderView:
    return await providers.create(data)


@router.patch("/{provider_id}", response_model=AiProviderView)
async def update_provider(
    provider_id: int,
    data: AiProviderPatch,
    providers: AiProviderService = Depends(service),
) -> AiProviderView:
    return await providers.update(provider_id, data)


@router.delete("/{provider_id}", status_code=204)
async def delete_provider(provider_id: int, providers: AiProviderService = Depends(service)) -> None:
    await providers.delete(provider_id)


@router.post("/probe", response_model=AiProviderCheck)
async def probe_provider(data: AiProviderProbe, providers: AiProviderService = Depends(service)) -> AiProviderCheck:
    return await providers.probe(data)


@router.post("/{provider_id}/check", response_model=AiProviderCheck)
async def check_provider(provider_id: int, providers: AiProviderService = Depends(service)) -> AiProviderCheck:
    return await providers.check(provider_id)
