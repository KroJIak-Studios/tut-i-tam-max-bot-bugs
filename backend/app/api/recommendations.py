from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.settings import get_settings
from app.db import get_session
from app.models.event import EventAttendance, EventPhoto, EventView
from app.schemas.recommendations import NearbyEvent, NearbyRequest
from app.services.access_service import AccessService
from app.services.media_storage import MediaStorage
from app.services.recommendations import RecommendationService

router = APIRouter(prefix="/recommendations", tags=["recommendations"])


@router.post("/nearby", response_model=NearbyEvent | None)
async def nearby(request: NearbyRequest, session: AsyncSession = Depends(get_session)) -> NearbyEvent | None:
    user = await AccessService(session, get_settings()).ensure_user(request)
    found = await RecommendationService(session).nearby(user, request.latitude, request.longitude, limit=1)
    if not found:
        return None
    event = found[0]
    session.add(EventView(user_id=user.id, event_id=event.id))
    await session.commit()
    photos = list(await session.scalars(
        select(EventPhoto.storage_key).where(EventPhoto.event_id == event.id).order_by(EventPhoto.position).limit(3)
    ))
    going = await session.scalar(
        select(EventAttendance.event_id).where(EventAttendance.user_id == user.id, EventAttendance.event_id == event.id)
    )
    storage = MediaStorage()
    return NearbyEvent(
        id=event.id,
        title=event.title,
        description=event.description,
        address=event.address,
        starts_at=event.starts_at.isoformat(),
        images=[storage.public_url(key) for key in photos],
        going=going is not None,
    )
