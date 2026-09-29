import re
from pathlib import Path
from uuid import uuid4

from fastapi import HTTPException, UploadFile

from app.core.settings import get_settings

IMAGE_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
}
KEY_PATTERN = re.compile(r"^[0-9a-f]{32}\.(jpg|png|webp)$")
MAX_BYTES = 8 * 1024 * 1024


class MediaStorage:
    def __init__(self, root: Path | None = None) -> None:
        self.root = root or Path(get_settings().media_root)
        self.root.mkdir(parents=True, exist_ok=True)

    def path(self, storage_key: str) -> Path:
        if KEY_PATTERN.fullmatch(storage_key) is None:
            raise HTTPException(status_code=404, detail="photo_not_found")
        return self.root / storage_key

    def public_url(self, storage_key: str) -> str:
        return f"/api/media/{storage_key}"

    async def save(self, upload: UploadFile) -> tuple[str, str]:
        content_type = upload.content_type or ""
        suffix = IMAGE_TYPES.get(content_type)
        if suffix is None:
            raise HTTPException(status_code=422, detail="unsupported_image")
        data = await upload.read(MAX_BYTES + 1)
        if not data or len(data) > MAX_BYTES:
            raise HTTPException(status_code=422, detail="invalid_image_size")
        storage_key = f"{uuid4().hex}{suffix}"
        self.path(storage_key).write_bytes(data)
        return storage_key, content_type

    def delete(self, storage_key: str) -> None:
        file_path = self.path(storage_key)
        if file_path.is_file():
            file_path.unlink()
