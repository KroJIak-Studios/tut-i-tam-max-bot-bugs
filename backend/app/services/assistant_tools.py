import math
from collections.abc import Awaitable, Callable
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo
from typing import Any

from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.event import Event, EventAttendance, EventPhoto, OfficialEvent
from app.models.profile import InterestName, UserInterest
from app.models.user import MaxUser
from app.models.user import MaxUser
from app.services.media_storage import MediaStorage

ToolHandler = Callable[[AsyncSession, MaxUser, dict[str, Any]], Awaitable[dict[str, Any]]]


@dataclass(frozen=True)
class AssistantTool:
    name: str
    description: str
    parameters: dict[str, Any]
    handler: ToolHandler


def _schema(properties: dict[str, Any], required: list[str]) -> dict[str, Any]:
    return {"type": "object", "properties": properties, "required": required, "additionalProperties": False}


async def profile_tool(session: AsyncSession, user: MaxUser, arguments: dict[str, Any]) -> dict[str, Any]:
    rows = list(await session.execute(
        select(InterestName.text, UserInterest.weight)
        .join(UserInterest, UserInterest.interest_id == InterestName.interest_id)
        .where(UserInterest.user_id == user.id, InterestName.locale_code == user.locale)
        .order_by(UserInterest.weight.desc())
    ))
    if not rows:
        rows = list(await session.execute(
            select(InterestName.text, UserInterest.weight)
            .join(UserInterest, UserInterest.interest_id == InterestName.interest_id)
            .where(UserInterest.user_id == user.id)
            .order_by(UserInterest.weight.desc())
        ))
    now = datetime.now(timezone.utc)
    meetings = list(await session.scalars(
        select(Event)
        .join(EventAttendance, EventAttendance.event_id == Event.id)
        .where(
            EventAttendance.user_id == user.id,
            Event.visible.is_(True),
            or_(Event.ends_at.is_(None), Event.ends_at >= now),
            Event.starts_at >= now - timedelta(hours=12),
        )
        .order_by(Event.starts_at)
        .limit(5)
    ))
    payloads = [await _event_payload(session, event) for event in meetings]
    return {
        "name": user.first_name,
        "last_name": user.last_name,
        "username": user.username,
        "locale": user.locale,
        "city_id": user.city_id,
        "notifications": user.notification_preference,
        "interests": [{"name": name, "taste": _taste(weight)} for name, weight in rows[:8]],
        "upcoming_meetings": payloads,
        "first_meeting": payloads[0] if payloads else None,
        "has_precise_location": False,
    }


async def search_events_tool(session: AsyncSession, user: MaxUser, arguments: dict[str, Any]) -> dict[str, Any]:
    query = arguments.get("query", "").strip().lower()
    limit = min(max(int(arguments.get("limit", 3)), 1), 3)
    events = await _upcoming(session)
    words = [word for word in query.split() if len(word) > 2]
    asked_day = next((_day_word(word) for word in words if _day_word(word)), None)
    content_words = [word for word in words if _day_word(word) is None]
    if words:
        matched = []
        for event in events:
            payload = await _event_payload(session, event)
            if asked_day and payload["day"] != asked_day:
                continue
            haystack = f"{payload['title']} {payload['summary']} {payload['price']} {payload['address']}".lower()
            if content_words and not any(_matches(word, haystack, payload["time_of_day"]) for word in content_words):
                continue
            matched.append(payload)
        if matched:
            return {"events": matched[:limit]}
        nearest = [await _event_payload(session, event) for event in events[:limit]]
        return {"events": [], "nearest": nearest}
    return {"events": [await _event_payload(session, event) for event in events[:limit]]}


def _day_word(word: str) -> str | None:
    if word.startswith("сегодн"):
        return "сегодня"
    if word.startswith("завтра"):
        return "завтра"
    if word.startswith("послезавтра"):
        return "послезавтра"
    return None


def _matches(word: str, haystack: str, time_of_day: str) -> bool:
    asked = _time_of_day_word(word)
    if asked:
        return asked == time_of_day
    return _word_in(word, haystack)


def _time_of_day_word(word: str) -> str | None:
    if word.startswith(("вечер",)):
        return "вечер"
    if word.startswith(("ноч",)):
        return "ночь"
    if word.startswith(("утр",)):
        return "утро"
    if word.startswith(("дн",)) and word[:3] in {"дн", "днём", "днем"}:
        return "день"
    return None


def _word_in(word: str, haystack: str) -> bool:
    if word in haystack:
        return True
    stem = word[:5]
    return len(stem) == 5 and stem in haystack


async def nearby_events_tool(session: AsyncSession, user: MaxUser, arguments: dict[str, Any]) -> dict[str, Any]:
    latitude = arguments.get("latitude")
    longitude = arguments.get("longitude")
    if latitude is None or longitude is None:
        return {"status": "location_required"}
    events = await _upcoming(session)
    ranked = sorted(events, key=lambda event: _distance(latitude, longitude, event.latitude, event.longitude))
    return {"events": [await _event_payload(session, event) for event in ranked[:3]]}


async def app_links_tool(session: AsyncSession, user: MaxUser, arguments: dict[str, Any]) -> dict[str, Any]:
    return {
        "links": [
            {"id": "home", "title": "Главная", "path": "/"},
            {"id": "catalog", "title": "Каталог", "path": "/catalog"},
            {"id": "map", "title": "Карта", "path": "/map"},
            {"id": "plans", "title": "Планы", "path": "/plans"},
        ]
    }


def registry() -> dict[str, AssistantTool]:
    tools = [
        AssistantTool(
            "user_profile",
            "Всё известное о текущем пользователе: имя, язык, город, уведомления, интересы и его будущие встречи.",
            _schema({}, []),
            profile_tool,
        ),
        AssistantTool(
            "search_events",
            "Найти до трёх будущих событий по короткому запросу.",
            _schema({"query": {"type": "string"}, "limit": {"type": "integer"}}, ["query"]),
            search_events_tool,
        ),
        AssistantTool(
            "nearby_events",
            "Найти до трёх будущих событий рядом с точкой. Если точки нет, вернёт location_required.",
            _schema({"latitude": {"type": "number"}, "longitude": {"type": "number"}}, []),
            nearby_events_tool,
        ),
        AssistantTool(
            "app_links",
            "Разрешённые экраны мини-приложения.",
            _schema({}, []),
            app_links_tool,
        ),
    ]
    return {tool.name: tool for tool in tools}


def specifications() -> list[dict[str, Any]]:
    return [
        {"type": "function", "function": {"name": tool.name, "description": tool.description, "parameters": tool.parameters}}
        for tool in registry().values()
    ]


async def call_tool(session: AsyncSession, user: MaxUser, name: str, arguments: dict[str, Any]) -> dict[str, Any]:
    tool = registry().get(name)
    if tool is None:
        return {"error": "unknown_tool"}
    return await tool.handler(session, user, arguments)


def _taste(weight: float) -> str:
    if weight >= 1.5:
        return "сильно нравится"
    if weight >= 0.7:
        return "нравится"
    return "слабо"


KAZAN = ZoneInfo("Europe/Moscow")


def _kazan(moment: datetime | None) -> datetime | None:
    if moment is None:
        return None
    if moment.tzinfo is None:
        moment = moment.replace(tzinfo=timezone.utc)
    return moment.astimezone(KAZAN)


def today_kazan() -> datetime:
    return datetime.now(KAZAN)


def _day_relation(moment: datetime, today: datetime) -> str:
    delta = (moment.date() - today.date()).days
    if delta == 0:
        return "сегодня"
    if delta == 1:
        return "завтра"
    if delta == 2:
        return "послезавтра"
    return "позже"


def _local_date(moment: datetime) -> str:
    months = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"]
    weekdays = ["понедельник", "вторник", "среда", "четверг", "пятница", "суббота", "воскресенье"]
    return f"{moment.day} {months[moment.month - 1]}, {weekdays[moment.weekday()]}"


def _time_of_day(moment: datetime) -> str:
    hour = moment.hour
    if hour < 5:
        return "ночь"
    if hour < 12:
        return "утро"
    if hour < 17:
        return "день"
    if hour < 23:
        return "вечер"
    return "ночь"


def _distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    radius = 6371
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    return 2 * radius * math.asin(math.sqrt(a))


async def _upcoming(session: AsyncSession) -> list[Event]:
    now = datetime.now(timezone.utc)
    return list(await session.scalars(
        select(Event).where(
            Event.visible.is_(True),
            or_(Event.ends_at.is_(None), Event.ends_at >= now),
        ).order_by(Event.starts_at)
    ))


async def _event_payload(session: AsyncSession, event: Event) -> dict[str, Any]:
    official = await session.scalar(select(OfficialEvent).where(OfficialEvent.event_id == event.id))
    price = "бесплатно" if official is None or official.price_rub <= 0 else f"{official.price_rub} ₽"
    photos = list(await session.scalars(
        select(EventPhoto).where(EventPhoto.event_id == event.id).order_by(EventPhoto.position).limit(3)
    ))
    today = today_kazan()
    local_start = _kazan(event.starts_at)
    local_end = _kazan(event.ends_at)
    return {
        "id": event.id,
        "title": event.title,
        "local_date": _local_date(local_start),
        "day": _day_relation(local_start, today),
        "local_start": local_start.strftime("%H:%M"),
        "local_end": local_end.strftime("%H:%M") if local_end else None,
        "time_of_day": _time_of_day(local_start),
        "address": event.address,
        "price": price,
        "summary": event.description[:280],
        "path": f"/events/{event.id}",
        "photos": [MediaStorage().public_url(photo.storage_key) for photo in photos],
        "chat": bool(event.chat_invite_url),
    }
