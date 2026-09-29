from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.settings import get_settings
from app.db import get_session
from app.schemas.bot_access import AccessStatusResponse, MaxIdentityRequest, PrimaryMessageRequest, PrimaryMessageResponse, UserAccessResponse, VerifyAccessCodeRequest
from app.services.access_service import AccessService

router = APIRouter(prefix="/bot/access", tags=["bot-access"])


def get_access_service(session: AsyncSession = Depends(get_session)) -> AccessService:
    return AccessService(session, get_settings())


@router.post("/status", response_model=AccessStatusResponse)
async def get_access_status(
    request: MaxIdentityRequest,
    service: AccessService = Depends(get_access_service),
) -> AccessStatusResponse:
    return await service.status(request)


@router.post("/verify", response_model=UserAccessResponse)
async def verify_access_code(
    request: VerifyAccessCodeRequest,
    service: AccessService = Depends(get_access_service),
) -> UserAccessResponse:
    return await service.verify(request)


@router.post("/primary-message", status_code=status.HTTP_204_NO_CONTENT)
async def save_primary_message(
    request: PrimaryMessageRequest,
    service: AccessService = Depends(get_access_service),
) -> Response:
    await service.save_primary_message(request, request.primary_message_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("/primary-message/current", response_model=PrimaryMessageResponse)
async def get_primary_message(
    request: MaxIdentityRequest,
    service: AccessService = Depends(get_access_service),
) -> PrimaryMessageResponse:
    return PrimaryMessageResponse(primary_message_id=await service.get_primary_message(request))
