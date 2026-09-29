from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

from app.services.media_storage import IMAGE_TYPES, MediaStorage

router = APIRouter(prefix="/media", tags=["media"])


@router.get("/{storage_key}")
async def media_file(storage_key: str) -> FileResponse:
    storage = MediaStorage()
    path = storage.path(storage_key)
    if not path.is_file():
        raise HTTPException(status_code=404, detail="photo_not_found")
    content_type = next(mime for mime, suffix in IMAGE_TYPES.items() if storage_key.endswith(suffix))
    return FileResponse(path, media_type=content_type)
