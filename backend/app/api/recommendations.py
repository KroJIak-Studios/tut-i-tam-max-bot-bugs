from fastapi import APIRouter, Depends, Request, Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.events import current_user
from app.core.settings import get_settings
from app.db import get_session
from app.models.user import MaxUser
from app.schemas.recommendations import NearbyEvent, NearbyPoint, NearbyRequest
from app.services.access_service import AccessService
from app.services.events_service import EventsService
from app.services.recommendations import RecommendationService

router = APIRouter(prefix="/recommendations", tags=["recommendations"])


async def found_event(session: AsyncSession, user: MaxUser, latitude: float, longitude: float) -> NearbyEvent | None:
    return await RecommendationService(session).found(user, latitude, longitude)


def request_ip(request: Request) -> str | None:
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip() or None
    return request.client.host if request.client else None


@router.post("/app/nearby", response_model=NearbyEvent | None)
async def app_nearby(
    body: NearbyPoint,
    request: Request,
    response: Response,
    current: tuple[AsyncSession, MaxUser] = Depends(current_user),
) -> NearbyEvent | None:
    session, user = current
    latitude, longitude = body.latitude, body.longitude
    if latitude is None or longitude is None:
        point = await EventsService(session).place_point(user, request_ip(request))
        if point is None:
            response.status_code = 204
            return None
        latitude, longitude = point
    found = await found_event(session, user, latitude, longitude)
    if found is None:
        response.status_code = 204
    return found


@router.post("/nearby", response_model=NearbyEvent | None)
async def nearby(request: NearbyRequest, session: AsyncSession = Depends(get_session)) -> NearbyEvent | None:
    user = await AccessService(session, get_settings()).ensure_user(request)
    return await found_event(session, user, request.latitude, request.longitude)