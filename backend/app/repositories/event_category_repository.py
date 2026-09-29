from __future__ import annotations

from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.event_category import EventCategory, EventCategoryName


class EventCategoryRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def list(self) -> list[EventCategory]:
        return list((await self._session.scalars(
            select(EventCategory).options(selectinload(EventCategory.names)).order_by(EventCategory.id)
        )).all())

    async def get(self, category_id: int) -> EventCategory | None:
        return await self._session.scalar(
            select(EventCategory).options(selectinload(EventCategory.names)).where(EventCategory.id == category_id)
        )

    def replace_names(self, category: EventCategory, values: list[dict[str, Any]]) -> None:
        category.names.clear()
        category.names.extend(EventCategoryName(locale_code=item["locale_code"], text=item["text"]) for item in values)

    def add(self, category: EventCategory) -> None:
        self._session.add(category)

    async def delete(self, category: EventCategory) -> None:
        await self._session.delete(category)
