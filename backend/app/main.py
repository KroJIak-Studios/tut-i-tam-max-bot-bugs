from fastapi import APIRouter, FastAPI

from app.api.bot_access import router as bot_access_router
from app.api.bot_settings import router as bot_settings_router
from app.api.bot_meetings import router as bot_meetings_router
from app.api.bot_pending import router as bot_pending_router
from app.api.admin import router as admin_router
from app.api.event_categories import admin_router as event_categories_admin_router
from app.api.event_categories import public_router as event_categories_router
from app.api.media import router as media_router
from app.api.events import router as events_router

app = FastAPI(
    title="tut-i-tam-max-bot",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    swagger_ui_oauth2_redirect_url="/api/docs/oauth2-redirect",
)

api_router = APIRouter()
api_router.include_router(bot_access_router)
api_router.include_router(bot_settings_router)
api_router.include_router(bot_pending_router)
api_router.include_router(bot_meetings_router)
api_router.include_router(admin_router)
api_router.include_router(event_categories_router)
api_router.include_router(event_categories_admin_router)
api_router.include_router(media_router)
api_router.include_router(events_router)


@app.get("/health", include_in_schema=False)
def health() -> dict[str, str]:
    return {"status": "ok"}


@api_router.get("/health")
def api_health() -> dict[str, str]:
    return {"status": "ok"}


app.include_router(api_router, prefix="/api")
