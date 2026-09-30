from datetime import datetime, timezone

from fastapi import HTTPException
from sqlalchemy import delete, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.max_init_data import MaxInitUser
from app.models.event import (
    City,
    Event,
    EventArea,
    EventAttendance,
    EventPhoto,
    EventReview,
    OfficialEvent,
    UserEvent,
)
from app.models.event_category import EventCategory
from app.models.user import MaxUser
from app.schemas.admin_events import AdminEventPatch, AdminEventWrite
from app.schemas.events import EventCreate, ReviewCreate, UserEventUpdate
from app.core.settings import get_settings
from app.services.embedding_index import EmbeddingIndex
from app.services.media_storage import MediaStorage


class EventsService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def identity(self, init_user: MaxInitUser) -> MaxUser:
        user = await self.session.scalar(select(MaxUser).where(MaxUser.max_user_id == init_user.id))
        if user is None:
            user = MaxUser(
                max_user_id=init_user.id,
                first_name=init_user.first_name,
                last_name=init_user.last_name,
                username=init_user.username,
                avatar_url=init_user.photo_url,
                full_avatar_url=init_user.photo_url,
                smart_interest_rotation=True,
            )
            self.session.add(user)
            await self.session.flush()
            city_id = await self._nearest_city_id(init_user.ip)
            user.city_id = city_id
        else:
            if user.city_id is None:
                user.city_id = await self._nearest_city_id(init_user.ip)
            user.first_name = init_user.first_name
            user.last_name = init_user.last_name
            user.username = init_user.username
            if init_user.photo_url is not None:
                user.avatar_url = init_user.photo_url
                user.full_avatar_url = init_user.photo_url
        await self.session.commit()
        await self.session.refresh(user)
        return user

    async def _nearest_city_id(self, ip_address: str | None) -> int | None:
        cities = (await self.session.scalars(
            select(City).where(City.latitude.is_not(None), City.longitude.is_not(None)).order_by(City.id)
        )).all()
        point = await IpGeolocationService().lookup(ip_address)
        if not cities:
            return await self.session.scalar(select(City.id).order_by(City.id).limit(1))
        if point is None:
            return cities[0].id
        latitude, longitude = point
        nearest = min(
            cities,
            key=lambda city: (city.latitude - latitude) ** 2 + (city.longitude - longitude) ** 2,
        )
        return nearest.id

    async def create_user_event(self, user: MaxUser, data: EventCreate) -> Event:
        city_exists = await self.session.scalar(select(City.id).where(City.id == data.city_id))
        if city_exists is None:
            raise HTTPException(status_code=422, detail="invalid_city")
        if data.category_id is not None and await self.session.get(EventCategory, data.category_id) is None:
            raise HTTPException(status_code=422, detail="invalid_category")
        event = Event(**data.model_dump(exclude={"area"}), visible=False)
        self.session.add(event)
        await self.session.flush()
        self.session.add(UserEvent(
            event_id=event.id,
            author_user_id=user.id,
            moderation_status="pending",
            submitted_at=datetime.now(timezone.utc),
        ))
        self.session.add(EventAttendance(user_id=user.id, event_id=event.id))
        if data.area is not None:
            self.session.add(EventArea(event_id=event.id, path=data.area))
        await self.session.commit()
        await self.session.refresh(event)
        return event

    async def admin_list(
        self,
        *,
        city_id: int | None,
        category_id: int | None,
        source: str | None,
        visible: bool | None,
        free: bool | None,
        pushkin: bool | None,
        query: str | None,
        limit: int,
        offset: int,
    ) -> dict:
        statement = select(Event)
        count_statement = select(func.count()).select_from(Event)
        if city_id is not None:
            statement = statement.where(Event.city_id == city_id)
            count_statement = count_statement.where(Event.city_id == city_id)
        if category_id is not None:
            statement = statement.where(Event.category_id == category_id)
            count_statement = count_statement.where(Event.category_id == category_id)
        if visible is not None:
            statement = statement.where(Event.visible.is_(visible))
            count_statement = count_statement.where(Event.visible.is_(visible))
        if source == "user":
            condition = Event.id.in_(select(UserEvent.event_id))
            statement = statement.where(condition)
            count_statement = count_statement.where(condition)
        elif source == "official":
            condition = Event.id.in_(select(OfficialEvent.event_id))
            statement = statement.where(condition)
            count_statement = count_statement.where(condition)
        if query:
            pattern = f"%{query}%"
            condition = or_(Event.title.ilike(pattern), Event.description.ilike(pattern), Event.address.ilike(pattern))
            statement = statement.where(condition)
            count_statement = count_statement.where(condition)
        if free is not None or pushkin is not None:
            statement = statement.join(OfficialEvent)
            count_statement = count_statement.join(OfficialEvent)
            if free is True:
                statement = statement.where(OfficialEvent.price_rub == 0)
                count_statement = count_statement.where(OfficialEvent.price_rub == 0)
            elif free is False:
                statement = statement.where(OfficialEvent.price_rub > 0)
                count_statement = count_statement.where(OfficialEvent.price_rub > 0)
            if pushkin is not None:
                statement = statement.where(OfficialEvent.pushkin_card.is_(pushkin))
                count_statement = count_statement.where(OfficialEvent.pushkin_card.is_(pushkin))
        total = await self.session.scalar(count_statement) or 0
        rows = (await self.session.scalars(statement.order_by(Event.starts_at.desc(), Event.id.desc()).limit(limit).offset(offset))).all()
        return {"total": total, "limit": limit, "offset": offset, "items": [await self.admin_card(event) for event in rows]}

    async def admin_card(self, event: Event) -> dict:
        official = await self.session.scalar(select(OfficialEvent).where(OfficialEvent.event_id == event.id))
        user_event = await self.session.scalar(select(UserEvent).where(UserEvent.event_id == event.id))
        area = await self.session.scalar(select(EventArea).where(EventArea.event_id == event.id))
        photos = list(await self.session.scalars(
            select(EventPhoto).where(EventPhoto.event_id == event.id).order_by(EventPhoto.position, EventPhoto.id)
        ))
        attendees_count = await self.session.scalar(
            select(func.count()).select_from(EventAttendance).where(EventAttendance.event_id == event.id)
        )
        author = None
        if user_event is not None:
            user = await self.session.get(MaxUser, user_event.author_user_id)
            author = None if user is None else {"id": user.id, "first_name": user.first_name, "last_name": user.last_name}
        now = datetime.now(timezone.utc)
        if event.starts_at > now:
            phase = "scheduled"
        elif event.ends_at is not None and event.ends_at > now:
            phase = "ongoing"
        else:
            phase = "finished"
        return {
            "id": event.id,
            "title": event.title,
            "description": event.description,
            "city_id": event.city_id,
            "category_id": event.category_id,
            "visible": event.visible,
            "address": event.address,
            "latitude": event.latitude,
            "longitude": event.longitude,
            "starts_at": event.starts_at,
            "ends_at": event.ends_at,
            "phase": phase,
            "origin": "official" if official is not None else "user",
            "price_rub": official.price_rub if official is not None else None,
            "pushkin_card": official.pushkin_card if official is not None else None,
            "chat_invite_url": event.chat_invite_url,
            "chat_connected": event.chat_max_id is not None,
            "chat_id": event.chat_max_id,
            "area": area.path if area is not None else None,
            "images": [
                {"id": photo.id, "url": MediaStorage().public_url(photo.storage_key), "position": photo.position}
                for photo in photos
            ],
            "attendees_count": attendees_count or 0,
            "author": author,
            "moderation": self._moderation(user_event),
        }

    async def create_official_event(self, data: AdminEventWrite) -> dict:
        await self._require_place(data.city_id, data.category_id)
        event = Event(**data.model_dump(exclude={"price_rub", "pushkin_card", "area"}))
        self.session.add(event)
        await self.session.flush()
        self.session.add(OfficialEvent(event_id=event.id, price_rub=data.price_rub, pushkin_card=data.pushkin_card))
        if data.area is not None:
            self.session.add(EventArea(event_id=event.id, path=data.area))
        await EmbeddingIndex(self.session, get_settings()).index_event(event)
        await self.session.commit()
        await self.session.refresh(event)
        return await self.admin_card(event)

    async def update_event(self, event_id: int, data: AdminEventPatch) -> dict:
        event = await self.session.get(Event, event_id)
        if event is None:
            raise HTTPException(status_code=404, detail="event_not_found")
        changes = data.model_dump(exclude_unset=True)
        city_id = changes.get("city_id", event.city_id)
        category_id = changes.get("category_id", event.category_id)
        await self._require_place(city_id, category_id)
        official = await self.session.scalar(select(OfficialEvent).where(OfficialEvent.event_id == event.id))
        if official is None and ("price_rub" in changes or "pushkin_card" in changes):
            raise HTTPException(status_code=422, detail="user_event_has_no_price")
        for field in ("title", "description", "city_id", "category_id", "address", "latitude", "longitude", "starts_at", "ends_at", "visible", "chat_invite_url"):
            if field in changes:
                setattr(event, field, changes[field])
        if official is not None and "price_rub" in changes:
            official.price_rub = changes["price_rub"]
        if official is not None and "pushkin_card" in changes:
            official.pushkin_card = changes["pushkin_card"]
        if "area" in changes:
            area = await self.session.scalar(select(EventArea).where(EventArea.event_id == event.id))
            if changes["area"] is None and area is not None:
                await self.session.delete(area)
            elif changes["area"] is not None and area is None:
                self.session.add(EventArea(event_id=event.id, path=changes["area"]))
            elif area is not None:
                area.path = changes["area"]
        text_changed = "title" in changes or "description" in changes
        if text_changed or "visible" in changes:
            await EmbeddingIndex(self.session, get_settings()).index_event(event)
        await self.session.commit()
        await self.session.refresh(event)
        return await self.admin_card(event)

    async def delete_event(self, event_id: int) -> None:
        event = await self.session.get(Event, event_id)
        if event is None:
            raise HTTPException(status_code=404, detail="event_not_found")
        photos = list(await self.session.scalars(select(EventPhoto).where(EventPhoto.event_id == event_id)))
        keys = [photo.storage_key for photo in photos]
        await self.session.delete(event)
        await self.session.commit()
        storage = MediaStorage()
        for key in keys:
            storage.delete(key)

    async def connect_chat(self, event_id: int, invite_url: str, check: dict) -> dict:
        event = await self.session.get(Event, event_id)
        if event is None:
            raise HTTPException(status_code=404, detail="event_not_found")
        event.chat_invite_url = invite_url
        event.chat_max_id = check["chat_id"] if check["bot_ready"] else None
        await self.session.commit()
        return check

    async def _require_place(self, city_id: int, category_id: int | None) -> None:
        if await self.session.scalar(select(City.id).where(City.id == city_id)) is None:
            raise HTTPException(status_code=422, detail="invalid_city")
        if category_id is not None and await self.session.get(EventCategory, category_id) is None:
            raise HTTPException(status_code=422, detail="invalid_category")

    def _moderation(self, user_event: UserEvent | None) -> dict | None:
        if user_event is None:
            return None
        return {
            "status": user_event.moderation_status,
            "comment": user_event.moderation_comment,
            "submitted_at": user_event.submitted_at,
            "moderated_at": user_event.moderated_at,
            "moderated_by": user_event.moderated_by,
        }

    async def readable_event(self, user: MaxUser, event_id: int) -> Event:
        event = await self.session.get(Event, event_id)
        if event is None:
            raise HTTPException(status_code=404, detail="event_not_found")
        if event.visible:
            return event
        owned = await self.session.scalar(
            select(UserEvent.event_id).where(UserEvent.event_id == event_id, UserEvent.author_user_id == user.id)
        )
        if owned is None:
            raise HTTPException(status_code=404, detail="event_not_found")
        return event

    async def my_events(self, user: MaxUser) -> list[dict]:
        rows = (await self.session.scalars(
            select(Event).join(UserEvent, UserEvent.event_id == Event.id)
            .where(UserEvent.author_user_id == user.id)
            .order_by(UserEvent.submitted_at.desc())
        )).all()
        return [await self.card(user, event) for event in rows]

    async def update_own_event(self, user: MaxUser, event_id: int, data: UserEventUpdate) -> dict:
        record = await self.session.scalar(
            select(UserEvent).where(UserEvent.event_id == event_id, UserEvent.author_user_id == user.id)
        )
        if record is None:
            raise HTTPException(status_code=404, detail="event_not_found")
        event = await self.session.get(Event, event_id)
        changes = data.model_dump(exclude_unset=True)
        if "city_id" in changes or "category_id" in changes:
            await self._require_place(changes.get("city_id", event.city_id), changes.get("category_id", event.category_id))
        for field in ("title", "description", "category_id", "city_id", "address", "latitude", "longitude", "starts_at", "ends_at", "chat_invite_url"):
            if field in changes:
                setattr(event, field, changes[field])
        if "area" in changes:
            area = await self.session.scalar(select(EventArea).where(EventArea.event_id == event.id))
            if changes["area"] is None and area is not None:
                await self.session.delete(area)
            elif changes["area"] is not None and area is None:
                self.session.add(EventArea(event_id=event.id, path=changes["area"]))
            elif area is not None:
                area.path = changes["area"]
        substantial = bool(changes)
        if record.moderation_status in {"rejected", "changes_requested"} or (record.moderation_status == "approved" and substantial):
            record.moderation_status = "pending"
            record.submitted_at = datetime.now(timezone.utc)
            event.visible = False
        await self.session.commit()
        return await self.card(user, event)

    async def moderation_queue(
        self,
        *,
        status: str | None,
        city_id: int | None,
        category_id: int | None,
        query: str | None,
        limit: int,
        offset: int,
    ) -> dict:
        counts = {name: 0 for name in ("pending", "changes_requested", "approved", "rejected")}
        grouped = await self.session.execute(select(UserEvent.moderation_status, func.count()).group_by(UserEvent.moderation_status))
        for name, count in grouped:
            if name in counts:
                counts[name] = count
        statement = select(Event).join(UserEvent, UserEvent.event_id == Event.id)
        count_statement = select(func.count()).select_from(Event).join(UserEvent, UserEvent.event_id == Event.id)
        if status is not None:
            statement = statement.where(UserEvent.moderation_status == status)
            count_statement = count_statement.where(UserEvent.moderation_status == status)
        if city_id is not None:
            statement = statement.where(Event.city_id == city_id)
            count_statement = count_statement.where(Event.city_id == city_id)
        if category_id is not None:
            statement = statement.where(Event.category_id == category_id)
            count_statement = count_statement.where(Event.category_id == category_id)
        if query:
            pattern = f"%{query}%"
            condition = or_(Event.title.ilike(pattern), Event.description.ilike(pattern), Event.address.ilike(pattern))
            statement = statement.where(condition)
            count_statement = count_statement.where(condition)
        total = await self.session.scalar(count_statement) or 0
        rows = (await self.session.scalars(
            statement.order_by(UserEvent.submitted_at.desc(), Event.id.desc()).limit(limit).offset(offset)
        )).all()
        return {"total": total, "counts": counts, "limit": limit, "offset": offset, "items": [await self.admin_card(event) for event in rows]}

    async def moderate(self, event_id: int, status: str, comment: str | None) -> dict:
        record = await self.session.scalar(select(UserEvent).where(UserEvent.event_id == event_id))
        if record is None:
            raise HTTPException(status_code=404, detail="event_not_found")
        if record.moderation_status not in {"pending", "changes_requested"}:
            raise HTTPException(status_code=409, detail="moderation_conflict")
        event = await self.session.get(Event, event_id)
        record.moderation_status = status
        record.moderation_comment = comment
        record.moderated_at = datetime.now(timezone.utc)
        record.moderated_by = "admin"
        event.visible = status == "approved"
        await EmbeddingIndex(self.session, get_settings()).index_event(event)
        await self.session.commit()
        return await self.admin_card(event)

    async def add_photo(self, event_id: int, upload) -> dict:
        event = await self.session.get(Event, event_id)
        if event is None:
            raise HTTPException(status_code=404, detail="event_not_found")
        count = await self.session.scalar(
            select(func.count()).select_from(EventPhoto).where(EventPhoto.event_id == event_id)
        )
        if count is not None and count >= 3:
            raise HTTPException(status_code=409, detail="event_photo_limit")
        storage = MediaStorage()
        storage_key, content_type = await storage.save(upload)
        position = int(count or 0)
        photo = EventPhoto(event_id=event_id, storage_key=storage_key, content_type=content_type, position=position)
        self.session.add(photo)
        try:
            await self.session.commit()
        except Exception:
            storage.delete(storage_key)
            raise
        return {"id": photo.id, "url": storage.public_url(storage_key), "position": position}

    async def delete_photo(self, event_id: int, photo_id: int) -> None:
        photo = await self.session.scalar(
            select(EventPhoto).where(EventPhoto.id == photo_id, EventPhoto.event_id == event_id)
        )
        if photo is None:
            raise HTTPException(status_code=404, detail="photo_not_found")
        storage_key = photo.storage_key
        await self.session.delete(photo)
        await self.session.commit()
        MediaStorage().delete(storage_key)

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
        photos = list(await self.session.scalars(
            select(EventPhoto).where(EventPhoto.event_id == event.id).order_by(EventPhoto.position, EventPhoto.id)
        ))
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
            "category_id": event.category_id,
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
            "images": [MediaStorage().public_url(photo.storage_key) for photo in photos],
            "going": going is not None,
            "attendees_count": attendees_count or 0,
            "reviews": [await self._review_payload(review) for review in reviews],
            "moderation": self._moderation(user_event) if user_event is not None and user_event.author_user_id == user.id else None,
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