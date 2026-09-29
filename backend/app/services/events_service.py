from datetime import datetime, timezone

from fastapi import HTTPException
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.max_init_data import MaxInitUser
from app.models.event import (
    City,
    Event,
    EventArea,
    EventAttendance,
    EventReview,
    OfficialEvent,
    UserEvent,
)
from app.models.user import MaxUser
from app.schemas.events import EventCreate, ReviewCreate


class EventsService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def identity(self, init_user: MaxInitUser) -> MaxUser:
        user = await self.session.scalar(select(MaxUser).where(MaxUser.max_user_id == init_user.id))
        now = datetime.now(timezone.utc)
        if user is None:
            user = MaxUser(
                max_user_id=init_user.id,
                first_name=init_user.first_name,
                last_name=init_user.last_name,
                username=init_user.username,
                avatar_url=init_user.photo_url,
                full_avatar_url=init_user.photo_url,
                city_id=1,
                access_granted_at=now if init_user.id == 99999999 else None,
            )
            self.session.add(user)
        else:
            user.first_name = init_user.first_name
            user.last_name = init_user.last_name
            user.username = init_user.username
            user.avatar_url = init_user.photo_url
            user.full_avatar_url = init_user.photo_url
            if user.city_id is None:
                user.city_id = 1
            if init_user.id == 99999999 and user.access_granted_at is None:
                user.access_granted_at = now
        await self.session.commit()
        await self.session.refresh(user)
        return user

    async def create_user_event(self, user: MaxUser, data: EventCreate) -> Event:
        city_exists = await self.session.scalar(select(City.id).where(City.id == data.city_id))
        if city_exists is None:
            raise HTTPException(status_code=422, detail="invalid_city")
        event = Event(**data.model_dump(exclude={"area"}))
        self.session.add(event)
        await self.session.flush()
        self.session.add(UserEvent(event_id=event.id, author_user_id=user.id))
        self.session.add(EventAttendance(user_id=user.id, event_id=event.id))
        if data.area is not None:
            self.session.add(EventArea(event_id=event.id, path=data.area))
        await self.session.commit()
        await self.session.refresh(event)
        return event

    async def visible_event(self, event_id: int) -> Event:
        event = await self.session.scalar(
            select(Event).where(Event.id == event_id, Event.visible.is_(True))
        )
        if event is None:
            raise HTTPException(status_code=404, detail="event_not_found")
        return event

    async def attend(self, user: MaxUser, event_id: int) -> None:
        await self.visible_event(event_id)
        existing = await self.session.scalar(
            select(EventAttendance).where(
                EventAttendance.user_id == user.id,
                EventAttendance.event_id == event_id,
            )
        )
        if existing is None:
            self.session.add(EventAttendance(user_id=user.id, event_id=event_id))
            await self.session.commit()

    async def review(self, user: MaxUser, event_id: int, data: ReviewCreate) -> None:
        event = await self.visible_event(event_id)
        if event.starts_at > datetime.now(timezone.utc):
            raise HTTPException(status_code=409, detail="event_not_started")
        current = await self.session.scalar(
            select(EventReview).where(EventReview.event_id == event_id, EventReview.user_id == user.id)
        )
        if current is None:
            self.session.add(EventReview(event_id=event_id, user_id=user.id, **data.model_dump()))
        else:
            current.rating = data.rating
            current.text = data.text
            current.anonymous = data.anonymous
        await self.session.commit()

    async def card(self, user: MaxUser, event: Event) -> dict:
        official = await self.session.scalar(
            select(OfficialEvent).where(OfficialEvent.event_id == event.id)
        )
        user_event = await self.session.scalar(select(UserEvent).where(UserEvent.event_id == event.id))
        area = await self.session.scalar(select(EventArea).where(EventArea.event_id == event.id))
        going = await self.session.scalar(
            select(EventAttendance.user_id).where(
                EventAttendance.user_id == user.id,
                EventAttendance.event_id == event.id,
            )
        )
        attendees_count = await self.session.scalar(
            select(func.count()).select_from(EventAttendance).where(EventAttendance.event_id == event.id)
        )
        reviews = list(await self.session.scalars(select(EventReview).where(EventReview.event_id == event.id)))
        reviews.sort(key=lambda review: (review.user_id is not None, review.created_at))
        now = datetime.now(timezone.utc)
        if event.starts_at > now:
            phase = "scheduled"
        elif event.ends_at is not None and event.ends_at > now:
            phase = "ongoing"
        else:
            phase = "finished"
        author = None
        if user_event is not None:
            first_name = await self.session.scalar(
                select(MaxUser.first_name).where(MaxUser.id == user_event.author_user_id)
            )
            author = {"id": user_event.author_user_id, "first_name": first_name}
        return {
            "id": event.id,
            "title": event.title,
            "description": event.description,
            "category": event.category,
            "city_id": event.city_id,
            "address": event.address,
            "latitude": event.latitude,
            "longitude": event.longitude,
            "starts_at": event.starts_at,
            "ends_at": event.ends_at,
            "phase": phase,
            "origin": "official" if official is not None else "user",
            "author": author,
            "price_rub": official.price_rub if official is not None else None,
            "pushkin_card": official.pushkin_card if official is not None else None,
            "chat_connected": event.chat_max_id is not None,
            "area": area.path if area is not None else None,
            "images": [],
            "going": going is not None,
            "attendees_count": attendees_count or 0,
            "reviews": [await self._review_payload(review) for review in reviews],
        }

    async def _review_payload(self, review: EventReview) -> dict:
        author_name = None
        if review.user_id is not None and not review.anonymous:
            author_name = await self.session.scalar(
                select(MaxUser.first_name).where(MaxUser.id == review.user_id)
            )
        return {
            "id": review.id,
            "rating": review.rating,
            "text": review.text,
            "anonymous": review.anonymous,
            "author_name": author_name,
            "is_bot": review.user_id is None,
            "created_at": review.created_at,
        }