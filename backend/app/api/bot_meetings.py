from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.settings import get_settings
from app.db import get_session
from app.schemas.bot_meetings import (
    BotMeetingAttendanceRequest,
    BotMeetingCard,
    BotMeetingsRequest,
    BotMeetingsResponse,
    BotPhotoTokenRequest,
)
from app.services.bot_meetings_service import BotMeetingsService

router = APIRouter(prefix="/bot/meetings", tags=["bot-meetings"])


def get_meetings_service(session: AsyncSession = Depends(get_session)) -> BotMeetingsService:
    return BotMeetingsService(session, get_settings())


@router.post("", response_model=BotMeetingsResponse)
async def list_meetings(
    request: BotMeetingsRequest,
    service: BotMeetingsService = Depends(get_meetings_service),
) -> BotMeetingsResponse:
    return await service.list_meetings(request)


@router.post("/photos/{photo_id}/token")
async def save_photo_token(
    photo_id: int,
    request: BotPhotoTokenRequest,
    service: BotMeetingsService = Depends(get_meetings_service),
) -> dict[str, str]:
    token = await service.save_image_token(request, photo_id, request.token)
    if token is None:
        raise HTTPException(status_code=404, detail="photo_not_found")
    return {"token": token}


@router.post("/{event_id}", response_model=BotMeetingCard)
async def meeting_card(
    event_id: int,
    request: BotMeetingsRequest,
    service: BotMeetingsService = Depends(get_meetings_service),
) -> BotMeetingCard:
    card = await service.card(request, event_id)
    if card is None:
        raise HTTPException(status_code=404, detail="event_not_found")
    return card


@router.post("/{event_id}/attendance", response_model=BotMeetingCard)
async def set_attendance(
    event_id: int,
    request: BotMeetingAttendanceRequest,
    service: BotMeetingsService = Depends(get_meetings_service),
) -> BotMeetingCard:
    card = await service.set_attendance(request, event_id, request.going)
    if card is None:
        raise HTTPException(status_code=404, detail="event_not_found")
    return card
