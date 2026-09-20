from fastapi import APIRouter, FastAPI

app = FastAPI(
    title="tut-i-tam-max-bot",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    swagger_ui_oauth2_redirect_url="/api/docs/oauth2-redirect",
)

api_router = APIRouter()


@app.get("/health", include_in_schema=False)
def health() -> dict[str, str]:
    return {"status": "ok"}


@api_router.get("/health")
def api_health() -> dict[str, str]:
    return {"status": "ok"}


app.include_router(api_router, prefix="/api")
