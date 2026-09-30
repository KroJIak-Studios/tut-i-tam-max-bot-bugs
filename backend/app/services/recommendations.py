import math
from datetime import datetime, timezone

from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.event import Event, EventAttendance, EventPhoto, EventView
from app.models.profile import Interest, UserInterest
from app.models.user import MaxUser
from app.schemas.recommendations import NearbyEvent
from app.services.media_storage import MediaStorage

WALK_METERS_PER_MINUTE = 80
MAX_WAIT_MINUTES = 90


class RecommendationService:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def nearby(self, user: MaxUser, latitude: float, longitude: float, limit: int = 1) -> list[Event]:
        now = datetime.now(timezone.utc)
        interest = await self._strongest_interest(user)
        viewed = select(EventView.event_id).where(EventView.user_id == user.id)
        attending = select(EventAttendance.event_id).where(EventAttendance.user_id == user.id)
        events = list(await self._session.scalars(
            select(Event).where(
                Event.visible.is_(True),
                Event.embedding.is_not(None),
                Event.starts_at >= now,
                Event.id.not_in(viewed),
                Event.id.not_in(attending),
            )
        ))
        ranked = []
        for event in events:
            distance = _distance_meters(latitude, longitude, event.latitude, event.longitude)
            minutes_until = (event.starts_at - now).total_seconds() / 60
            walk = distance / WALK_METERS_PER_MINUTE
            wait = minutes_until - walk
            fits = 0 <= wait <= MAX_WAIT_MINUTES
            similarity = await self._similarity(event.id, interest.id) if interest is not None else 0.5
            if fits:
                ranked.append((0, -similarity, distance, event))
            else:
                missed = max(0.0, -wait)
                extra_wait = max(0.0, wait - MAX_WAIT_MINUTES)
                ranked.append((1, distance, missed + extra_wait, -similarity, event))
        ranked.sort(key=lambda item: item[:-1])
        return [item[-1] for item in ranked[:limit]]

    async def found(self, user: MaxUser, latitude: float, longitude: float) -> NearbyEvent | None:
        found = await self.nearby(user, latitude, longitude, limit=1)
        if not found:
            return None
        event = found[0]
        self._session.add(EventView(user_id=user.id, event_id=event.id))
        await self._session.commit()
        photos = list(await self._session.scalars(
            select(EventPhoto.storage_key).where(EventPhoto.event_id == event.id).order_by(EventPhoto.position).limit(3)
        ))
        going = await self._session.scalar(
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

    async def _strongest_interest(self, user: MaxUser) -> Interest | None:
        row = await self._session.execute(
            select(Interest, UserInterest.weight)
            .join(UserInterest, UserInterest.interest_id == Interest.id)
            .where(UserInterest.user_id == user.id, Interest.embedding.is_not(None))
            .order_by(UserInterest.weight.desc())
        )
        first = row.first()
        return first[0] if first else None

    async def _similarity(self, event_id: int, interest_id: int) -> float:
        value = await self._session.scalar(text(
            """
            SELECT 1 - (event.embedding <=> interest.embedding)
            FROM events event, interests interest
            WHERE event.id = :event_id AND interest.id = :interest_id
            """
        ), {"event_id": event_id, "interest_id": interest_id})
        return float(value or 0)


def _distance_meters(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    radius = 6_371_000
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    return 2 * radius * math.asin(math.sqrt(a))
