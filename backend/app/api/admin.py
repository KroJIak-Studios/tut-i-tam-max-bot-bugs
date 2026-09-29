import secrets

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.admin_tokens import bearer, require_admin
from app.core.settings import Settings, get_settings
from app.db import get_session
from app.models.event import City, CityName, Event, MapArea
from app.models.profile import Interest, InterestName, Locale
from app.models.user import MaxUser
from app.schemas.admin_auth import AdminLogin, AdminRefresh, AdminSession, AdminStats, AdminTokens
from app.schemas.events import EventPhotoUpdate
from app.schemas.profile import CityCreate, InterestCreate, InterestPatch
from app.services.admin_auth_service import AdminAuthService
from app.services.admin_stats_service import AdminStatsService
from app.services.events_service import EventsService

router = APIRouter(prefix="/admin", tags=["admin"])


def auth_service(settings: Settings = Depends(get_settings)) -> AdminAuthService:
    return AdminAuthService(settings)


@router.post("/login", response_model=AdminTokens)
async def login(data: AdminLogin, service: AdminAuthService = Depends(auth_service)) -> AdminTokens:
    return service.login(data.password)


@router.post("/refresh", response_model=AdminTokens)
async def refresh(data: AdminRefresh, service: AdminAuthService = Depends(auth_service)) -> AdminTokens:
    return service.refresh(data.refresh_token)


@router.get("/me", response_model=AdminSession)
async def me(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer),
    service: AdminAuthService = Depends(auth_service),
) -> AdminSession:
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise HTTPException(status_code=401, detail="admin_unauthorized")
    return service.session(credentials.credentials)


@router.get("/stats", response_model=AdminStats, dependencies=[Depends(require_admin)])
async def stats(session: AsyncSession = Depends(get_session)) -> AdminStats:
    return await AdminStatsService(session).stats()


def names_payload(names: list[CityName | InterestName]) -> list[dict[str, str]]:
    return [{"locale_code": item.locale_code, "text": item.text} for item in names]


def city_payload(city: City) -> dict[str, object]:
    return {
        "id": city.id,
        "latitude": city.latitude,
        "longitude": city.longitude,
        "names": names_payload(city.names),
    }


async def locale_names(session: AsyncSession, values: list[dict[str, str]]) -> list[Locale]:
    codes = {item["locale_code"] for item in values}
    locales = (await session.scalars(select(Locale).where(Locale.code.in_(codes)))).all()
    if len(locales) != len(codes):
        raise HTTPException(status_code=422, detail="invalid_locale")
    if len(values) != len(codes):
        raise HTTPException(status_code=422, detail="duplicate_locale")
    return locales


async def save_city_names(session: AsyncSession, city: City, values: list[dict[str, str]]) -> None:
    await locale_names(session, values)
    city.names.clear()
    city.names.extend(CityName(locale_code=item["locale_code"], text=item["text"]) for item in values)


async def save_interest_names(session: AsyncSession, interest: Interest, values: list[dict[str, str]]) -> None:
    await locale_names(session, values)
    interest.names.clear()
    interest.names.extend(InterestName(locale_code=item["locale_code"], text=item["text"]) for item in values)


@router.patch("/events/{event_id}/photos", dependencies=[Depends(require_admin)])
async def update_event_photos(
    event_id: int,
    data: EventPhotoUpdate,
    session: AsyncSession = Depends(get_session),
):
    return {"id": event_id, "images": await EventsService(session).replace_photos(event_id, data)}


@router.get("/locales", dependencies=[Depends(require_admin)])
async def list_locales(session: AsyncSession = Depends(get_session)):
    return (await session.scalars(select(Locale).order_by(Locale.code))).all()


@router.get("/cities", dependencies=[Depends(require_admin)])
async def list_cities(session: AsyncSession = Depends(get_session)):
    cities = (await session.scalars(
        select(City).options(selectinload(City.names)).order_by(City.id)
    )).all()
    return [city_payload(city) for city in cities]


@router.post("/cities", status_code=201, dependencies=[Depends(require_admin)])
async def create_city(data: CityCreate, session: AsyncSession = Depends(get_session)):
    city = City(latitude=data.latitude, longitude=data.longitude, names=[])
    session.add(city)
    await save_city_names(session, city, [item.model_dump() for item in data.names])
    await session.commit()
    await session.refresh(city, ["names"])
    return city_payload(city)


@router.patch("/cities/{city_id}", dependencies=[Depends(require_admin)])
async def update_city(city_id: int, data: CityCreate, session: AsyncSession = Depends(get_session)):
    city = await session.scalar(select(City).options(selectinload(City.names)).where(City.id == city_id))
    if city is None:
        raise HTTPException(status_code=404, detail="city_not_found")
    city.latitude = data.latitude
    city.longitude = data.longitude
    await save_city_names(session, city, [item.model_dump() for item in data.names])
    await session.commit()
    await session.refresh(city, ["names"])
    return city_payload(city)


@router.delete("/cities/{city_id}", status_code=204, dependencies=[Depends(require_admin)])
async def delete_city(city_id: int, session: AsyncSession = Depends(get_session)):
    city = await session.get(City, city_id)
    if city is None:
        raise HTTPException(status_code=404, detail="city_not_found")
    used_by_event = await session.scalar(select(Event.id).where(Event.city_id == city_id).limit(1))
    used_by_user = await session.scalar(select(MaxUser.id).where(MaxUser.city_id == city_id).limit(1))
    used_by_area = await session.scalar(select(MapArea.id).where(MapArea.city_id == city_id).limit(1))
    if used_by_event is not None or used_by_user is not None or used_by_area is not None:
        raise HTTPException(status_code=409, detail="city_in_use")
    await session.delete(city)
    await session.commit()


@router.get("/interests", dependencies=[Depends(require_admin)])
async def list_interests(session: AsyncSession = Depends(get_session)):
    interests = (await session.scalars(
        select(Interest).options(selectinload(Interest.names)).order_by(Interest.id)
    )).all()
    return [{"id": interest.id, "names": names_payload(interest.names)} for interest in interests]


@router.post("/interests", status_code=201, dependencies=[Depends(require_admin)])
async def create_interest(data: InterestCreate, session: AsyncSession = Depends(get_session)):
    interest = Interest(color=f"#{secrets.randbelow(0x1000000):06x}", names=[])
    session.add(interest)
    await save_interest_names(session, interest, [item.model_dump() for item in data.names])
    await session.commit()
    await session.refresh(interest, ["names"])
    return {"id": interest.id, "names": names_payload(interest.names)}


@router.patch("/interests/{interest_id}", dependencies=[Depends(require_admin)])
async def update_interest(interest_id: int, data: InterestPatch, session: AsyncSession = Depends(get_session)):
    interest = await session.scalar(
        select(Interest).options(selectinload(Interest.names)).where(Interest.id == interest_id)
    )
    if interest is None:
        raise HTTPException(status_code=404, detail="interest_not_found")
    await save_interest_names(session, interest, [item.model_dump() for item in data.names])
    await session.commit()
    await session.refresh(interest, ["names"])
    return {"id": interest.id, "names": names_payload(interest.names)}


@router.delete("/interests/{interest_id}", status_code=204, dependencies=[Depends(require_admin)])
async def delete_interest(interest_id: int, session: AsyncSession = Depends(get_session)):
    interest = await session.get(Interest, interest_id)
    if interest is None:
        raise HTTPException(status_code=404, detail="interest_not_found")
    await session.delete(interest)
    await session.commit()
