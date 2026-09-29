from datetime import datetime, timezone

from fastapi import APIRouter, Depends, Header, HTTPException, Query
from sqlalchemy import delete, exists, func, select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.max_init_data import validate_init_data
from app.core.settings import get_settings
from app.db import get_session
from app.models.event import City, CityName, Event, EventAttendance, EventView, MapArea, OfficialEvent, UserEvent
from app.models.event_category import EventCategory, EventCategoryName
from app.models.profile import Interest, InterestName, Locale, UserInterest
from app.models.user import MaxUser
from app.schemas.events import EventCreate, ReviewCreate
from app.schemas.profile import MePatch
from app.services.catalog_service import CatalogService
from app.services.events_service import EventsService
from app.services.user_data_service import UserDataService

router = APIRouter(prefix="/v1", tags=["events"])


async def current_user(
    authorization: str = Header(...),
    session: AsyncSession = Depends(get_session),
) -> tuple[AsyncSession, MaxUser]:
    scheme, _, init_data = authorization.partition(" ")
    if scheme != "tma" or not init_data:
        raise HTTPException(status_code=401, detail="init_data_required")
    settings = get_settings()
    try:
        init_user = validate_init_data(init_data, settings.bot_token, settings.allow_dev_auth)
    except ValueError:
        raise HTTPException(status_code=401, detail="init_data_invalid") from None
    service = EventsService(session)
    user = await service.identity(init_user)
    if settings.access_code_enabled and user.access_code_fingerprint != settings.access_code_fingerprint:
        raise HTTPException(status_code=403, detail="access_code_required")
    return session, user


def visible_events(
    city_id: int | None,
    category_id: int | None,
    starts_after: datetime | None,
    starts_before: datetime | None,
    free: bool | None,
    pushkin: bool | None,
    query: str | None,
    source: str | None = None,
):
    statement = select(Event).where(Event.visible.is_(True))
    if city_id is not None:
        statement = statement.where(Event.city_id == city_id)
    if category_id is not None:
        statement = statement.where(Event.category_id == category_id)
    if source == "user":
        statement = statement.where(exists(select(UserEvent.event_id).where(UserEvent.event_id == Event.id)))
    elif source == "external":
        statement = statement.where(~exists(select(UserEvent.event_id).where(UserEvent.event_id == Event.id)))
    if starts_after:
        statement = statement.where(Event.starts_at >= starts_after)
    if starts_before:
        statement = statement.where(Event.starts_at <= starts_before)
    if query:
        statement = statement.where(Event.title.ilike(f"%{query}%"))
    if free is not None or pushkin is not None:
        statement = statement.join(OfficialEvent)
        if free is True:
            statement = statement.where(OfficialEvent.price_rub == 0)
        elif free is False:
            statement = statement.where(OfficialEvent.price_rub > 0)
        if pushkin is not None:
            statement = statement.where(OfficialEvent.pushkin_card.is_(pushkin))
    return statement


async def names_payload(names: list[CityName | InterestName | EventCategoryName]) -> list[dict[str, str]]:
    return [{"locale_code": item.locale_code, "text": item.text} for item in names]


@router.get("/locales")
async def list_locales(context: tuple[AsyncSession, MaxUser] = Depends(current_user)):
    session, _user = context
    return (await session.scalars(select(Locale).order_by(Locale.code))).all()


@router.get("/cities")
async def list_cities(context: tuple[AsyncSession, MaxUser] = Depends(current_user)):
    session, _user = context
    cities = (await session.scalars(select(City).options(selectinload(City.names)).order_by(City.id))).all()
    return [{"id": city.id, "latitude": city.latitude, "longitude": city.longitude, "names": await names_payload(city.names)} for city in cities]


@router.get("/event-categories")
async def list_event_categories(context: tuple[AsyncSession, MaxUser] = Depends(current_user)):
    session, _user = context
    categories = (await session.scalars(select(EventCategory).options(selectinload(EventCategory.names)).order_by(EventCategory.id))).all()
    return [{"id": item.id, "names": await names_payload(item.names)} for item in categories]


@router.get("/interests")
async def list_interests(context: tuple[AsyncSession, MaxUser] = Depends(current_user)):
    session, _user = context
    interests = (await session.scalars(select(Interest).options(selectinload(Interest.names)).order_by(Interest.id))).all()
    return [{"id": item.id, "color": item.color, "names": await names_payload(item.names)} for item in interests]


@router.get("/events")
async def list_events(
    city_id: int | None = None,
    category_id: int | None = None,
    starts_after: datetime | None = None,
    starts_before: datetime | None = None,
    free: bool | None = None,
    pushkin: bool | None = None,
    q: str | None = None,
    source: str | None = Query(default=None, pattern="^(external|user)$"),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    context: tuple[AsyncSession, MaxUser] = Depends(current_user),
):
    session, user = context
    if user.city_id is None:
        raise HTTPException(status_code=409, detail="city_required")
    city_id = user.city_id
    catalog = CatalogService(session)
    if not await catalog.category_exists(category_id):
        raise HTTPException(status_code=422, detail="invalid_category")
    rows = await catalog.list_events(
        city_id=city_id,
        category_id=category_id,
        starts_after=starts_after,
        starts_before=starts_before,
        free=free,
        pushkin=pushkin,
        query=q,
        source=source,
        limit=limit,
        offset=offset,
    )
    service = EventsService(session)
    return [await service.card(user, event) for event in rows]


@router.post("/events", status_code=201)
async def create_event(data: EventCreate, context: tuple[AsyncSession, MaxUser] = Depends(current_user)):
    session, user = context
    service = EventsService(session)
    event = await service.create_user_event(user, data)
    return await service.card(user, event)


@router.get("/events/{event_id}")
async def get_event(event_id: int, context: tuple[AsyncSession, MaxUser] = Depends(current_user)):
    session, user = context
    service = EventsService(session)
    event = await service.visible_event(event_id)
    viewed = await session.scalar(select(EventView).where(EventView.user_id == user.id, EventView.event_id == event_id))
    if viewed is None:
        session.add(EventView(user_id=user.id, event_id=event_id))
        await session.commit()
    return await service.card(user, event)


@router.post("/events/{event_id}/attendance")
async def attend_event(event_id: int, context: tuple[AsyncSession, MaxUser] = Depends(current_user)):
    session, user = context
    await EventsService(session).attend(user, event_id)
    return {"going": True}


@router.delete("/events/{event_id}/attendance")
async def cancel_attendance(event_id: int, context: tuple[AsyncSession, MaxUser] = Depends(current_user)):
    session, user = context
    await session.execute(delete(EventAttendance).where(EventAttendance.user_id == user.id, EventAttendance.event_id == event_id))
    await session.commit()
    return {"going": False}


@router.get("/me/attendances")
async def list_attendances(when: str = Query(pattern="^(upcoming|past)$"), context: tuple[AsyncSession, MaxUser] = Depends(current_user)):
    session, user = context
    now = datetime.now(timezone.utc)
    statement = select(Event).join(EventAttendance).where(EventAttendance.user_id == user.id)
    statement = statement.where(Event.starts_at >= now if when == "upcoming" else Event.starts_at < now)
    rows = (await session.scalars(statement.order_by(Event.starts_at))).all()
    service = EventsService(session)
    return [await service.card(user, event) for event in rows]


@router.post("/events/{event_id}/reviews")
async def upsert_review(event_id: int, data: ReviewCreate, context: tuple[AsyncSession, MaxUser] = Depends(current_user)):
    session, user = context
    service = EventsService(session)
    await service.review(user, event_id, data)
    return await service.card(user, await service.visible_event(event_id))


async def me_payload(session: AsyncSession, user: MaxUser) -> dict:
    city = None
    if user.city_id is not None:
        city = await session.scalar(select(City).options(selectinload(City.names)).where(City.id == user.city_id))
    selected = (await session.scalars(
        select(Interest).options(selectinload(Interest.names)).join(UserInterest, UserInterest.interest_id == Interest.id)
        .where(UserInterest.user_id == user.id).order_by(Interest.id)
    )).all()
    return {
        "id": user.id, "max_user_id": user.max_user_id, "first_name": user.first_name,
        "last_name": user.last_name, "username": user.username, "avatar_url": user.full_avatar_url or user.avatar_url,
        "locale": user.locale,
        "city": {"id": city.id, "names": await names_payload(city.names)} if city else None,
        "interests": [{"id": item.id, "color": item.color, "names": await names_payload(item.names)} for item in selected],
        "smart_interest_rotation": user.smart_interest_rotation,
        "notifications_enabled": user.notification_preference != "disabled",
        "notifications_silent": user.notification_preference == "silent",
        "notify_event_reminders": user.notify_event_reminders,
        "notify_schedule_changes": user.notify_schedule_changes,
    }


@router.get("/me")
async def read_me(context: tuple[AsyncSession, MaxUser] = Depends(current_user)):
    session, user = context
    return await me_payload(session, user)


@router.patch("/me")
async def update_me(data: MePatch, context: tuple[AsyncSession, MaxUser] = Depends(current_user)):
    session, user = context
    values = data.model_dump(exclude_unset=True)
    if "city_id" in values and values["city_id"] is not None and await session.get(City, values["city_id"]) is None:
        raise HTTPException(status_code=422, detail="invalid_city")
    if "interest_ids" in values:
        ids = values.pop("interest_ids")
        interests = (await session.scalars(select(Interest).where(Interest.id.in_(ids)))).all()
        if len(interests) != len(ids):
            raise HTTPException(status_code=422, detail="invalid_interest")
        await session.execute(delete(UserInterest).where(UserInterest.user_id == user.id))
        session.add_all(UserInterest(user_id=user.id, interest_id=interest.id) for interest in interests)
    enabled = values.pop("notifications_enabled", None)
    silent = values.pop("notifications_silent", None)
    for field, value in values.items():
        setattr(user, field, value)
    if enabled is not None or silent is not None:
        current_enabled = user.notification_preference != "disabled"
        current_silent = user.notification_preference == "silent"
        enabled = current_enabled if enabled is None else enabled
        silent = current_silent if silent is None else silent
        user.notification_preference = "disabled" if not enabled else ("silent" if silent else "enabled")
    await session.commit()
    return await me_payload(session, user)


@router.delete("/me", status_code=204)
async def delete_me(context: tuple[AsyncSession, MaxUser] = Depends(current_user)):
    session, user = context
    await UserDataService(session).delete(user)


@router.get("/map/events")
async def map_events(
    min_lat: float | None = None, min_lng: float | None = None, max_lat: float | None = None, max_lng: float | None = None,
    city_id: int | None = None, category_id: int | None = None,
    starts_after: datetime | None = None, starts_before: datetime | None = None,
    free: bool | None = None, pushkin: bool | None = None, q: str | None = None,
    source: str | None = Query(default=None, pattern="^(external|user)$"),
    limit: int = Query(500, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    context: tuple[AsyncSession, MaxUser] = Depends(current_user),
):
    session, user = context
    if user.city_id is None:
        raise HTTPException(status_code=409, detail="city_required")
    city_id = user.city_id
    catalog = CatalogService(session)
    if not await catalog.category_exists(category_id):
        raise HTTPException(status_code=422, detail="invalid_category")
    rows = await catalog.list_events(
        city_id=city_id, category_id=category_id, starts_after=starts_after, starts_before=starts_before,
        free=free, pushkin=pushkin, query=q, source=source, limit=limit, offset=offset,
    )
    if None not in (min_lat, min_lng, max_lat, max_lng):
        rows = [event for event in rows if min_lat <= event.latitude <= max_lat and min_lng <= event.longitude <= max_lng]
    service = EventsService(session)
    return [await service.card(user, event) for event in rows]


@router.get("/map/areas")
async def map_areas(city_id: int, context: tuple[AsyncSession, MaxUser] = Depends(current_user)):
    session, _user = context
    rows = (await session.scalars(select(MapArea).where(MapArea.city_id == city_id, MapArea.visible.is_(True)))).all()
    return [{"id": area.id, "city_id": area.city_id, "kind": area.kind, "path": area.path} for area in rows]
