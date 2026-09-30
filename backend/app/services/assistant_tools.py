import math
from collections.abc import Awaitable, Callable
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from typing import Any

from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.event import Event, EventAttendance, OfficialEvent
from app.models.profile import InterestName, UserInterest
from app.models.user import MaxUser

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
    now = datetime.now(timezone.utc)
    events = list(await session.scalars(
        select(Event).where(Event.visible.is_(True), Event.starts_at >= now).order_by(Event.starts_at).limit(30)
    ))
    if query:
        events = [event for event in events if query in f"{event.title} {event.description}".lower()]
    return {"events": [await _event_payload(session, event) for event in events[:limit]]}


async def nearby_events_tool(session: AsyncSession, user: MaxUser, arguments: dict[str, Any]) -> dict[str, Any]:
    latitude = arguments.get("latitude")
    longitude = arguments.get("longitude")
    if latitude is None or longitude is None:
        return {"status": "location_required"}
    now = datetime.now(timezone.utc)
    events = list(await session.scalars(
        select(Event).where(Event.visible.is_(True), Event.starts_at >= now).order_by(Event.starts_at).limit(40)
    ))
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


def _distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    radius = 6371
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    return 2 * radius * math.asin(math.sqrt(a))


async def _event_payload(session: AsyncSession, event: Event) -> dict[str, Any]:
    official = await session.scalar(select(OfficialEvent).where(OfficialEvent.event_id == event.id))
    price = "бесплатно" if official is None or official.price_rub <= 0 else f"{official.price_rub} ₽"
    return {
        "id": event.id,
        "title": event.title,
        "when": event.starts_at.isoformat(),
        "address": event.address,
        "price": price,
        "summary": event.description[:280],
        "path": f"/events/{event.id}",
        "chat": bool(event.chat_max_id and event.chat_invite_url),
    }
