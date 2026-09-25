from fastapi import APIRouter, FastAPI

from app.api.bot_access import router as bot_access_router

app = FastAPI(
    title="tut-i-tam-max-bot",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    swagger_ui_oauth2_redirect_url="/api/docs/oauth2-redirect",
)

api_router = APIRouter()
api_router.include_router(bot_access_router)


@app.get("/health", include_in_schema=False)
def health() -> dict[str, str]:
    return {"status": "ok"}


@api_router.get("/health")
def api_health() -> dict[str, str]:
    return {"status": "ok"}


app.include_router(api_router, prefix="/api")
