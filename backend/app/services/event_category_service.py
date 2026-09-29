from fastapi import HTTPException
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.event import Event
from app.models.event_category import EventCategory
from app.models.profile import Locale
from app.repositories.event_category_repository import EventCategoryRepository
from app.schemas.event_categories import EventCategoryCreate


class EventCategoryService:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session
        self._categories = EventCategoryRepository(session)

    async def list(self) -> list[EventCategory]:
        return await self._categories.list()

    async def event_counts(self) -> dict[int, int]:
        rows = await self._session.execute(
            select(Event.category_id, func.count()).where(Event.category_id.is_not(None)).group_by(Event.category_id)
        )
        return {category_id: count for category_id, count in rows}

    async def create(self, data: EventCategoryCreate) -> EventCategory:
        category = EventCategory(names=[])
        self._categories.add(category)
        await self._save_names(category, data)
        await self._session.flush()
        category_id = category.id
        await self._session.commit()
        return await self._categories.get(category_id) or category

    async def update(self, category_id: int, data: EventCategoryCreate) -> EventCategory:
        category = await self._categories.get(category_id)
        if category is None:
            raise HTTPException(status_code=404, detail="event_category_not_found")
        await self._save_names(category, data)
        await self._session.commit()
        return await self._categories.get(category_id) or category

    async def delete(self, category_id: int) -> None:
        category = await self._categories.get(category_id)
        if category is None:
            raise HTTPException(status_code=404, detail="event_category_not_found")
        if await self._session.scalar(select(Event.id).where(Event.category_id == category_id).limit(1)) is not None:
            raise HTTPException(status_code=409, detail="event_category_in_use")
        await self._categories.delete(category)
        await self._session.commit()

    async def _save_names(self, category: EventCategory, data: EventCategoryCreate) -> None:
        names = [name.model_dump() for name in data.names]
        locale_codes = {name["locale_code"] for name in names}
        locales = set((await self._session.scalars(select(Locale.code).where(Locale.code.in_(locale_codes)))).all())
        if locales != locale_codes:
            raise HTTPException(status_code=422, detail="invalid_locale")
        if len(locale_codes) != len(names):
            raise HTTPException(status_code=422, detail="duplicate_locale")
        self._categories.replace_names(category, names)
