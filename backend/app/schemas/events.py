from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator


class EventCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    title: str = Field(min_length=1, max_length=500)
    description: str = Field(max_length=10000)
    category_id: int | None = None
    city_id: int
    address: str = Field(min_length=1, max_length=500)
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)
    starts_at: datetime
    ends_at: datetime | None = None
    area: list[list[float]] | None = None


class EventPhotoUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    images: list[str] = Field(max_length=3)

    @field_validator("images")
    @classmethod
    def image_urls(cls, values: list[str]) -> list[str]:
        cleaned = [value.strip() for value in values]
        if any(not url or len(url) > 2048 for url in cleaned):
            raise ValueError("event photo url is invalid")
        return cleaned


class ReviewCreate(BaseModel):
    rating: int = Field(ge=1, le=5)
    text: str | None = None
    anonymous: bool = False
