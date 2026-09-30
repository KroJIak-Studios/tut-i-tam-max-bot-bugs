import secrets

from fastapi import APIRouter, BackgroundTasks, Depends, File, HTTPException, Query, UploadFile
from fastapi.security import HTTPAuthorizationCredentials
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.admin_tokens import bearer, require_admin
from app.core.settings import Settings, get_settings
from app.db import get_session
from app.models.event import City, CityName, Event, MapArea, UserEvent
from app.models.profile import Interest, InterestName, Locale, UserInterest
from app.models.user import MaxUser
from app.schemas.admin_auth import AdminLogin, AdminRefresh, AdminSession, AdminStats, AdminTokens
from app.schemas.admin_events import (
    AdminChatCheck,
    AdminEventPatch,
    AdminEventWrite,
    AdminModerationComment,
    AdminModerationReason,
)
from app.schemas.profile import CityCreate, InterestCreate, InterestPatch
from app.services.admin_auth_service import AdminAuthService
from app.services.admin_stats_service import AdminStatsService
from app.services.events_service import EventsService

router = APIRouter(prefix="/admin", tags=["admin"])


def auth_service(settings: Settings = Depends(get_settings)) -> AdminAuthService:
    return AdminAuthService(settings)


@router.post("/login", response_model=AdminTokens)
async def login(data: AdminLogin, service: AdminAuthService = Depends(auth_service)) -> AdminTokens:
    return service.login(data.password)


@router.post("/refresh", response_model=AdminTokens)
async def refresh(data: AdminRefresh, service: AdminAuthService = Depends(auth_service)) -> AdminTokens:
    return service.refresh(data.refresh_token)


@router.get("/me", response_model=AdminSession)
async def me(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer),
    service: AdminAuthService = Depends(auth_service),
) -> AdminSession:
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise HTTPException(status_code=401, detail="admin_unauthorized")
    return service.session(credentials.credentials)


@router.get("/stats", response_model=AdminStats, dependencies=[Depends(require_admin)])
async def stats(session: AsyncSession = Depends(get_session)) -> AdminStats:
    return await AdminStatsService(session).stats()


def names_payload(names: list[CityName | InterestName]) -> list[dict[str, str]]:
    return [{"locale_code": item.locale_code, "text": item.text} for item in names]


def city_payload(city: City) -> dict[str, object]:
    return {
        "id": city.id,
        "latitude": city.latitude,
        "longitude": city.longitude,
        "names": names_payload(city.names),
    }


async def locale_names(session: AsyncSession, values: list[dict[str, str]]) -> list[Locale]:
    codes = {item["locale_code"] for item in values}
    locales = (await session.scalars(select(Locale).where(Locale.code.in_(codes)))).all()
    if len(locales) != len(codes):
        raise HTTPException(status_code=422, detail="invalid_locale")
    if len(values) != len(codes):
        raise HTTPException(status_code=422, detail="duplicate_locale")
    return locales


async def save_city_names(session: AsyncSession, city: City, values: list[dict[str, str]]) -> None:
    await locale_names(session, values)
    city.names.clear()
    city.names.extend(CityName(locale_code=item["locale_code"], text=item["text"]) for item in values)


async def save_interest_names(session: AsyncSession, interest: Interest, values: list[dict[str, str]]) -> None:
    await locale_names(session, values)
    interest.names.clear()
    interest.names.extend(InterestName(locale_code=item["locale_code"], text=item["text"]) for item in values)


@router.get("/moderation/events", dependencies=[Depends(require_admin)])
async def moderation_events(
    status: str | None = Query(default=None, pattern="^(pending|changes_requested|approved|rejected)$"),
    city_id: int | None = None,
    category_id: int | None = None,
    q: str | None = None,
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    session: AsyncSession = Depends(get_session),
):
    return await EventsService(session).moderation_queue(
        status=status, city_id=city_id, category_id=category_id, query=q, limit=limit, offset=offset,
    )


@router.get("/moderation/events/{event_id}", dependencies=[Depends(require_admin)])
async def moderation_event(event_id: int, session: AsyncSession = Depends(get_session)):
    record = await session.scalar(select(UserEvent).where(UserEvent.event_id == event_id))
    if record is None:
        raise HTTPException(status_code=404, detail="event_not_found")
    event = await session.get(Event, event_id)
    return await EventsService(session).admin_card(event)


@router.post("/moderation/events/{event_id}/approve", dependencies=[Depends(require_admin)])
async def approve_event(event_id: int, session: AsyncSession = Depends(get_session)):
    return await EventsService(session).moderate(event_id, "approved", None)


@router.post("/moderation/events/{event_id}/reject", dependencies=[Depends(require_admin)])
async def reject_event(event_id: int, data: AdminModerationReason, session: AsyncSession = Depends(get_session)):
    return await EventsService(session).moderate(event_id, "rejected", data.reason)


@router.post("/moderation/events/{event_id}/request-changes", dependencies=[Depends(require_admin)])
async def request_event_changes(event_id: int, data: AdminModerationComment, session: AsyncSession = Depends(get_session)):
    return await EventsService(session).moderate(event_id, "changes_requested", data.comment)


@router.get("/events", dependencies=[Depends(require_admin)])
async def list_admin_events(
    city_id: int | None = None,
    category_id: int | None = None,
    source: str | None = Query(default=None, pattern="^(official|user)$"),
    visible: bool | None = None,
    free: bool | None = None,
    pushkin: bool | None = None,
    q: str | None = None,
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    session: AsyncSession = Depends(get_session),
):
    return await EventsService(session).admin_list(
        city_id=city_id, category_id=category_id, source=source, visible=visible,
        free=free, pushkin=pushkin, query=q, limit=limit, offset=offset,
    )


@router.post("/events", status_code=201, dependencies=[Depends(require_admin)])
async def create_admin_event(data: AdminEventWrite, session: AsyncSession = Depends(get_session)):
    return await EventsService(session).create_official_event(data)


@router.get("/events/{event_id}", dependencies=[Depends(require_admin)])
async def get_admin_event(event_id: int, session: AsyncSession = Depends(get_session)):
    event = await session.get(Event, event_id)
    if event is None:
        raise HTTPException(status_code=404, detail="event_not_found")
    return await EventsService(session).admin_card(event)


@router.patch("/events/{event_id}", dependencies=[Depends(require_admin)])
async def update_admin_event(
    event_id: int,
    data: AdminEventPatch,
    background: BackgroundTasks,
    session: AsyncSession = Depends(get_session),
):
    return await EventsService(session).update_event(event_id, data, background)


@router.delete("/events/{event_id}", status_code=204, dependencies=[Depends(require_admin)])
async def delete_admin_event(event_id: int, session: AsyncSession = Depends(get_session)):
    await EventsService(session).delete_event(event_id)


@router.post("/events/{event_id}/chat", dependencies=[Depends(require_admin)])
async def check_event_chat(event_id: int, data: AdminChatCheck, session: AsyncSession = Depends(get_session)):
    return await EventsService(session).connect_chat(event_id, data.chat_invite_url)


@router.post("/events/{event_id}/photos", status_code=201, dependencies=[Depends(require_admin)])
async def upload_event_photo(
    event_id: int,
    file: UploadFile = File(...),
    session: AsyncSession = Depends(get_session),
):
    return await EventsService(session).add_photo(event_id, file)


@router.delete("/events/{event_id}/photos/{photo_id}", status_code=204, dependencies=[Depends(require_admin)])
async def delete_event_photo(
    event_id: int,
    photo_id: int,
    session: AsyncSession = Depends(get_session),
):
    await EventsService(session).delete_photo(event_id, photo_id)


@router.get("/locales", dependencies=[Depends(require_admin)])
async def list_locales(session: AsyncSession = Depends(get_session)):
    return (await session.scalars(select(Locale).order_by(Locale.code))).all()


@router.get("/cities", dependencies=[Depends(require_admin)])
async def list_cities(session: AsyncSession = Depends(get_session)):
    cities = (await session.scalars(
        select(City).options(selectinload(City.names)).order_by(City.id)
    )).all()
    return [city_payload(city) for city in cities]


@router.post("/cities", status_code=201, dependencies=[Depends(require_admin)])
async def create_city(data: CityCreate, session: AsyncSession = Depends(get_session)):
    city = City(latitude=data.latitude, longitude=data.longitude, names=[])
    session.add(city)
    await save_city_names(session, city, [item.model_dump() for item in data.names])
    await session.commit()
    await session.refresh(city, ["names"])
    return city_payload(city)


@router.patch("/cities/{city_id}", dependencies=[Depends(require_admin)])
async def update_city(city_id: int, data: CityCreate, session: AsyncSession = Depends(get_session)):
    city = await session.scalar(select(City).options(selectinload(City.names)).where(City.id == city_id))
    if city is None:
        raise HTTPException(status_code=404, detail="city_not_found")
    city.latitude = data.latitude
    city.longitude = data.longitude
    await save_city_names(session, city, [item.model_dump() for item in data.names])
    await session.commit()
    await session.refresh(city, ["names"])
    return city_payload(city)


@router.delete("/cities/{city_id}", status_code=204, dependencies=[Depends(require_admin)])
async def delete_city(city_id: int, session: AsyncSession = Depends(get_session)):
    city = await session.get(City, city_id)
    if city is None:
        raise HTTPException(status_code=404, detail="city_not_found")
    used_by_event = await session.scalar(select(Event.id).where(Event.city_id == city_id).limit(1))
    used_by_user = await session.scalar(select(MaxUser.id).where(MaxUser.city_id == city_id).limit(1))
    used_by_area = await session.scalar(select(MapArea.id).where(MapArea.city_id == city_id).limit(1))
    if used_by_event is not None or used_by_user is not None or used_by_area is not None:
        raise HTTPException(status_code=409, detail="city_in_use")
    await session.delete(city)
    await session.commit()


@router.get("/interests", dependencies=[Depends(require_admin)])
async def list_interests(session: AsyncSession = Depends(get_session)):
    interests = (await session.scalars(
        select(Interest).options(selectinload(Interest.names)).order_by(Interest.id)
    )).all()
    counts = dict((await session.execute(
        select(UserInterest.interest_id, func.count()).group_by(UserInterest.interest_id)
    )).all())
    return [
        {"id": interest.id, "names": names_payload(interest.names), "users_count": counts.get(interest.id, 0)}
        for interest in interests
    ]


@router.post("/interests", status_code=201, dependencies=[Depends(require_admin)])
async def create_interest(data: InterestCreate, session: AsyncSession = Depends(get_session)):
    interest = Interest(color=f"#{secrets.randbelow(0x1000000):06x}", names=[])
    session.add(interest)
    await save_interest_names(session, interest, [item.model_dump() for item in data.names])
    await session.commit()
    await session.refresh(interest, ["names"])
    return {"id": interest.id, "names": names_payload(interest.names)}


@router.patch("/interests/{interest_id}", dependencies=[Depends(require_admin)])
async def update_interest(interest_id: int, data: InterestPatch, session: AsyncSession = Depends(get_session)):
    interest = await session.scalar(
        select(Interest).options(selectinload(Interest.names)).where(Interest.id == interest_id)
    )
    if interest is None:
        raise HTTPException(status_code=404, detail="interest_not_found")
    await save_interest_names(session, interest, [item.model_dump() for item in data.names])
    await session.commit()
    await session.refresh(interest, ["names"])
    return {"id": interest.id, "names": names_payload(interest.names)}


@router.delete("/interests/{interest_id}", status_code=204, dependencies=[Depends(require_admin)])
async def delete_interest(interest_id: int, session: AsyncSession = Depends(get_session)):
    interest = await session.get(Interest, interest_id)
    if interest is None:
        raise HTTPException(status_code=404, detail="interest_not_found")
    await session.delete(interest)
    await session.commit()
