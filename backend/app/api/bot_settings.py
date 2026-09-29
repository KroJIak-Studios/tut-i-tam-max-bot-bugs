from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.settings import get_settings
from app.db import get_session
from app.schemas.bot_access import MaxIdentityRequest
from app.schemas.bot_settings import (
    LocalePreferenceRequest,
    LocalePreferenceResponse,
    NotificationPreferenceRequest,
    NotificationPreferenceResponse,
)
from app.services.settings_service import SettingsService

router = APIRouter(prefix="/bot/settings", tags=["bot-settings"])


def get_settings_service(session: AsyncSession = Depends(get_session)) -> SettingsService:
    return SettingsService(session, get_settings())


@router.post("/notifications", response_model=NotificationPreferenceResponse)
async def get_notification_preference(
    request: MaxIdentityRequest,
    service: SettingsService = Depends(get_settings_service),
) -> NotificationPreferenceResponse:
    return await service.notification_preference(request)


@router.put("/notifications", response_model=NotificationPreferenceResponse)
async def update_notification_preference(
    request: NotificationPreferenceRequest,
    service: SettingsService = Depends(get_settings_service),
) -> NotificationPreferenceResponse:
    return await service.update_notification_preference(request)


@router.put("/locale", response_model=LocalePreferenceResponse)
async def update_locale(
    request: LocalePreferenceRequest,
    service: SettingsService = Depends(get_settings_service),
) -> LocalePreferenceResponse:
    return await service.update_locale(request)


@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user_data(
    request: MaxIdentityRequest,
    service: SettingsService = Depends(get_settings_service),
) -> Response:
    await service.delete_user_data(request)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
