import secrets

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.admin_tokens import bearer, require_admin
from app.core.settings import Settings, get_settings
from app.db import get_session
from app.models.event import City, CityName
from app.models.profile import Interest, InterestName, Locale
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
    city.names = [CityName(locale_code=item["locale_code"], text=item["text"]) for item in values]


async def save_interest_names(session: AsyncSession, interest: Interest, values: list[dict[str, str]]) -> None:
    await locale_names(session, values)
    interest.names = [InterestName(locale_code=item["locale_code"], text=item["text"]) for item in values]


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
    cities = (await session.scalars(select(City).order_by(City.id))).all()
    for city in cities:
        await session.refresh(city, ["names"])
    return [{"id": city.id, "names": names_payload(city.names)} for city in cities]


@router.post("/cities", status_code=201, dependencies=[Depends(require_admin)])
async def create_city(data: CityCreate, session: AsyncSession = Depends(get_session)):
    city = City(latitude=data.latitude, longitude=data.longitude)
    session.add(city)
    await save_city_names(session, city, [item.model_dump() for item in data.names])
    await session.commit()
    await session.refresh(city, ["names"])
    return {"id": city.id, "names": names_payload(city.names)}


@router.patch("/cities/{city_id}", dependencies=[Depends(require_admin)])
async def update_city(city_id: int, data: CityCreate, session: AsyncSession = Depends(get_session)):
    city = await session.get(City, city_id)
    if city is None:
        raise HTTPException(status_code=404, detail="city_not_found")
    await save_city_names(session, city, [item.model_dump() for item in data.names])
    await session.commit()
    await session.refresh(city, ["names"])
    return {"id": city.id, "names": names_payload(city.names)}


@router.get("/interests", dependencies=[Depends(require_admin)])
async def list_interests(session: AsyncSession = Depends(get_session)):
    interests = (await session.scalars(select(Interest).order_by(Interest.id))).all()
    for interest in interests:
        await session.refresh(interest, ["names"])
    return [{"id": interest.id, "names": names_payload(interest.names)} for interest in interests]


@router.post("/interests", status_code=201, dependencies=[Depends(require_admin)])
async def create_interest(data: InterestCreate, session: AsyncSession = Depends(get_session)):
    interest = Interest(color=f"#{secrets.randbelow(0x1000000):06x}")
    session.add(interest)
    await save_interest_names(session, interest, [item.model_dump() for item in data.names])
    await session.commit()
    await session.refresh(interest, ["names"])
    return {"id": interest.id, "names": names_payload(interest.names)}


@router.patch("/interests/{interest_id}", dependencies=[Depends(require_admin)])
async def update_interest(interest_id: int, data: InterestPatch, session: AsyncSession = Depends(get_session)):
    interest = await session.get(Interest, interest_id)
    if interest is None:
        raise HTTPException(status_code=404, detail="interest_not_found")
    await save_interest_names(session, interest, [item.model_dump() for item in data.names])
    await session.commit()
    await session.refresh(interest, ["names"])
    return {"id": interest.id, "names": names_payload(interest.names)}
