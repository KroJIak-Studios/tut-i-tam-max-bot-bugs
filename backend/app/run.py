import uvicorn

from app.config import BACKEND_HOST, BACKEND_PORT

uvicorn.run(
    "app.main:app",
    host=BACKEND_HOST,
    port=BACKEND_PORT,
    reload=True,
)
