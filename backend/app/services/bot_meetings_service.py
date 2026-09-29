from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.settings import Settings
from app.models.event import Event, EventAttendance, OfficialEvent, UserEvent
from app.schemas.bot_access import MaxIdentityRequest
from app.schemas.bot_meetings import BotMeetingCard, BotMeetingItem, BotMeetingsResponse
from app.services.access_service import AccessService


class BotMeetingsService:
    def __init__(self, session: AsyncSession, settings: Settings) -> None:
        self._session = session
        self._access = AccessService(session, settings)

    async def list_meetings(self, request: MaxIdentityRequest) -> BotMeetingsResponse:
        user = await self._access.ensure_user(request)
        now = datetime.now(timezone.utc)
        upcoming = (
            select(Event)
            .join(EventAttendance, EventAttendance.event_id == Event.id)
            .where(EventAttendance.user_id == user.id, Event.starts_at >= now)
            .order_by(Event.starts_at)
        )
        events = list(await self._session.scalars(upcoming))
        return BotMeetingsResponse(
            total=len(events),
            meetings=[self._item(event) for event in events],
        )

    async def card(self, request: MaxIdentityRequest, event_id: int) -> BotMeetingCard | None:
        user = await self._access.ensure_user(request)
        event = await self._visible_event(event_id)
        if event is None:
            return None
        return await self._card(user.id, event)

    async def set_attendance(self, request: MaxIdentityRequest, event_id: int, going: bool) -> BotMeetingCard | None:
        user = await self._access.ensure_user(request)
        event = await self._visible_event(event_id)
        if event is None:
            return None
        current = await self._session.scalar(
            select(EventAttendance).where(
                EventAttendance.user_id == user.id,
                EventAttendance.event_id == event.id,
            )
        )
        if going and current is None:
            self._session.add(EventAttendance(user_id=user.id, event_id=event.id))
        elif not going and current is not None:
            await self._session.delete(current)
        await self._session.commit()
        return await self._card(user.id, event)

    async def _visible_event(self, event_id: int) -> Event | None:
        event = await self._session.get(Event, event_id)
        if event is None or not event.visible:
            return None
        return event

    async def _card(self, user_id: int, event: Event) -> BotMeetingCard:
        official = await self._session.scalar(select(OfficialEvent).where(OfficialEvent.event_id == event.id))
        author_id = await self._session.scalar(select(UserEvent.author_user_id).where(UserEvent.event_id == event.id))
        attendee_ids = list(await self._session.scalars(
            select(EventAttendance.user_id).where(EventAttendance.event_id == event.id)
        ))
        return BotMeetingCard(
            id=event.id,
            title=event.title,
            description=event.description,
            address=event.address,
            latitude=event.latitude,
            longitude=event.longitude,
            starts_at=event.starts_at,
            ends_at=event.ends_at,
            chat_invite_url=event.chat_invite_url if event.chat_max_id is not None else None,
            price_rub=official.price_rub if official is not None else None,
            pushkin_card=official.pushkin_card if official is not None else False,
            images=[],
            attendees_count=sum(attendee_id != author_id for attendee_id in attendee_ids),
            going=user_id in attendee_ids,
        )

    def _item(self, event: Event) -> BotMeetingItem:
        return BotMeetingItem(
            id=event.id,
            title=event.title,
            description=event.description,
            address=event.address,
            starts_at=event.starts_at,
            ends_at=event.ends_at,
            chat_invite_url=event.chat_invite_url,
        )
