from sqlalchemy import exists, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.event import Event, OfficialEvent, UserEvent
from app.models.event_category import EventCategory


class CatalogService:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def list_events(
        self,
        *,
        city_id: int | None,
        category_id: int | None,
        category_code: str | None,
        starts_after,
        starts_before,
        free: bool | None,
        pushkin: bool | None,
        query: str | None,
        source: str | None,
        limit: int,
        offset: int,
    ) -> list[Event]:
        statement = select(Event).where(Event.visible.is_(True))
        if city_id is not None:
            statement = statement.where(Event.city_id == city_id)
        if category_code is not None:
            statement = statement.where(Event.category_id.in_(
                select(EventCategory.id).where(EventCategory.code == category_code)
            ))
        elif category_id is not None:
            statement = statement.where(Event.category_id == category_id)
        if starts_after is not None:
            statement = statement.where(Event.starts_at >= starts_after)
        if starts_before is not None:
            statement = statement.where(Event.starts_at <= starts_before)
        if query:
            statement = statement.where(Event.title.ilike(f"%{query.strip()}%"))
        if source == "user":
            statement = statement.where(exists(select(UserEvent.event_id).where(UserEvent.event_id == Event.id)))
        elif source == "external":
            statement = statement.where(~exists(select(UserEvent.event_id).where(UserEvent.event_id == Event.id)))
        if free is not None or pushkin is not None:
            official_match = select(OfficialEvent.event_id).where(OfficialEvent.event_id == Event.id)
            if free is True:
                official_match = official_match.where(OfficialEvent.price_rub == 0)
            elif free is False:
                official_match = official_match.where(OfficialEvent.price_rub > 0)
            if pushkin is not None:
                official_match = official_match.where(OfficialEvent.pushkin_card.is_(pushkin))
            condition = exists(official_match)
            if free is True and pushkin is None:
                condition = or_(condition, exists(select(UserEvent.event_id).where(UserEvent.event_id == Event.id)))
            statement = statement.where(condition)
        statement = statement.order_by(Event.starts_at).limit(limit).offset(offset)
        return list((await self._session.scalars(statement)).all())

    async def category_exists(self, category_id: int | None) -> bool:
        if category_id is None:
            return True
        return await self._session.scalar(select(EventCategory.id).where(EventCategory.id == category_id)) is not None
