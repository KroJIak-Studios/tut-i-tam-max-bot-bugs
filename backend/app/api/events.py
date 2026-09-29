from datetime import datetime, timezone

from fastapi import APIRouter, Depends, Header, HTTPException, Query
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.max_init_data import validate_init_data
from app.core.settings import get_settings
from app.db import get_session
from app.models.event import City, Event, EventAttendance, EventView, MapArea, OfficialEvent
from app.models.user import MaxUser
from app.schemas.events import EventCreate, MePatch, ReviewCreate
from app.services.events_service import EventsService

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
    if settings.access_code_enabled and user.access_granted_at is None:
        raise HTTPException(status_code=403, detail="access_code_required")
    return session, user


def visible_events(
    city_id: int | None,
    category: str | None,
    starts_after: datetime | None,
    starts_before: datetime | None,
    free: bool | None,
    pushkin: bool | None,
    query: str | None,
):
    statement = select(Event).where(Event.visible.is_(True))
    if city_id is not None:
        statement = statement.where(Event.city_id == city_id)
    if category:
        statement = statement.where(Event.category == category)
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


@router.get("/cities")
async def list_cities(context: tuple[AsyncSession, MaxUser] = Depends(current_user)):
    session, _user = context
    return (await session.scalars(select(City).order_by(City.name))).all()


@router.get("/events")
async def list_events(
    city_id: int | None = None,
    category: str | None = None,
    starts_after: datetime | None = None,
    starts_before: datetime | None = None,
    free: bool | None = None,
    pushkin: bool | None = None,
    q: str | None = None,
    limit: int = Query(20, le=100),
    offset: int = 0,
    context: tuple[AsyncSession, MaxUser] = Depends(current_user),
):
    session, user = context
    rows = (
        await session.scalars(
            visible_events(city_id, category, starts_after, starts_before, free, pushkin, q)
            .order_by(Event.starts_at)
            .limit(limit)
            .offset(offset)
        )
    ).all()
    service = EventsService(session)
    return [await service.card(user, event) for event in rows]


@router.post("/events", status_code=201)
async def create_event(
    data: EventCreate,
    context: tuple[AsyncSession, MaxUser] = Depends(current_user),
):
    session, user = context
    service = EventsService(session)
    event = await service.create_user_event(user, data)
    return await service.card(user, event)


@router.get("/events/{event_id}")
async def get_event(
    event_id: int,
    context: tuple[AsyncSession, MaxUser] = Depends(current_user),
):
    session, user = context
    service = EventsService(session)
    event = await service.visible_event(event_id)
    viewed = await session.scalar(
        select(EventView).where(EventView.user_id == user.id, EventView.event_id == event_id)
    )
    if viewed is None:
        session.add(EventView(user_id=user.id, event_id=event_id))
        await session.commit()
    return await service.card(user, event)


@router.post("/events/{event_id}/attendance")
async def attend_event(
    event_id: int,
    context: tuple[AsyncSession, MaxUser] = Depends(current_user),
):
    session, user = context
    await EventsService(session).attend(user, event_id)
    return {"going": True}


@router.delete("/events/{event_id}/attendance")
async def cancel_attendance(
    event_id: int,
    context: tuple[AsyncSession, MaxUser] = Depends(current_user),
):
    session, user = context
    await session.execute(
        delete(EventAttendance).where(
            EventAttendance.user_id == user.id,
            EventAttendance.event_id == event_id,
        )
    )
    await session.commit()
    return {"going": False}


@router.get("/me/attendances")
async def list_attendances(
    when: str = Query(pattern="^(upcoming|past)$"),
    context: tuple[AsyncSession, MaxUser] = Depends(current_user),
):
    session, user = context
    now = datetime.now(timezone.utc)
    statement = select(Event).join(EventAttendance).where(EventAttendance.user_id == user.id)
    statement = statement.where(Event.starts_at >= now if when == "upcoming" else Event.starts_at < now)
    rows = (await session.scalars(statement.order_by(Event.starts_at))).all()
    service = EventsService(session)
    return [await service.card(user, event) for event in rows]


@router.post("/events/{event_id}/reviews")
async def upsert_review(
    event_id: int,
    data: ReviewCreate,
    context: tuple[AsyncSession, MaxUser] = Depends(current_user),
):
    session, user = context
    service = EventsService(session)
    await service.review(user, event_id, data)
    return await service.card(user, await service.visible_event(event_id))


@router.get("/me")
async def read_me(context: tuple[AsyncSession, MaxUser] = Depends(current_user)):
    _session, user = context
    return {
        "id": user.id,
        "max_user_id": user.max_user_id,
        "first_name": user.first_name,
        "city_id": user.city_id,
        "smart_interest_rotation": user.smart_interest_rotation,
        "notify_event_reminders": user.notify_event_reminders,
        "notify_schedule_changes": user.notify_schedule_changes,
    }


@router.patch("/me")
async def update_me(
    data: MePatch,
    context: tuple[AsyncSession, MaxUser] = Depends(current_user),
):
    session, user = context
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(user, field, value)
    await session.commit()
    return await read_me(context)


@router.get("/map/events")
async def map_events(
    min_lat: float,
    min_lng: float,
    max_lat: float,
    max_lng: float,
    city_id: int | None = None,
    category: str | None = None,
    starts_after: datetime | None = None,
    starts_before: datetime | None = None,
    free: bool | None = None,
    pushkin: bool | None = None,
    q: str | None = None,
    context: tuple[AsyncSession, MaxUser] = Depends(current_user),
):
    session, user = context
    statement = visible_events(city_id, category, starts_after, starts_before, free, pushkin, q).where(
        Event.latitude.between(min_lat, max_lat),
        Event.longitude.between(min_lng, max_lng),
    )
    rows = (await session.scalars(statement)).all()
    service = EventsService(session)
    return [await service.card(user, event) for event in rows]


@router.get("/map/areas")
async def map_areas(
    city_id: int,
    context: tuple[AsyncSession, MaxUser] = Depends(current_user),
):
    session, _user = context
    rows = (
        await session.scalars(select(MapArea).where(MapArea.city_id == city_id, MapArea.visible.is_(True)))
    ).all()
    return [{"id": area.id, "city_id": area.city_id, "kind": area.kind, "path": area.path} for area in rows]