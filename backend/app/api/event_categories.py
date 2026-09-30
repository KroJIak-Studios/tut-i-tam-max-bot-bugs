from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.admin import require_admin
from app.db import get_session
from app.models.event_category import EventCategory
from app.schemas.event_categories import EventCategoryCreate
from app.services.event_category_service import EventCategoryService

public_router = APIRouter(prefix="/v1/event-categories", tags=["event-categories"])
admin_router = APIRouter(prefix="/admin/event-categories", tags=["admin-event-categories"])


def service(session: AsyncSession = Depends(get_session)) -> EventCategoryService:
    return EventCategoryService(session)


def category_payload(category: EventCategory) -> dict:
    return {"id": category.id, "code": category.code, "names": [{"locale_code": name.locale_code, "text": name.text} for name in category.names]}


@public_router.get("")
async def list_categories(category_service: EventCategoryService = Depends(service)):
    return [category_payload(category) for category in await category_service.list()]


@admin_router.get("", dependencies=[Depends(require_admin)])
async def list_admin_categories(category_service: EventCategoryService = Depends(service)):
    counts = await category_service.event_counts()
    return [
        {**category_payload(category), "events_count": counts.get(category.id, 0)}
        for category in await category_service.list()
    ]


@admin_router.post("", status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_admin)])
async def create_category(data: EventCategoryCreate, category_service: EventCategoryService = Depends(service)):
    return category_payload(await category_service.create(data))


@admin_router.patch("/{category_id}", dependencies=[Depends(require_admin)])
async def update_category(category_id: int, data: EventCategoryCreate, category_service: EventCategoryService = Depends(service)):
    return category_payload(await category_service.update(category_id, data))


@admin_router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_admin)])
async def delete_category(category_id: int, category_service: EventCategoryService = Depends(service)):
    await category_service.delete(category_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
