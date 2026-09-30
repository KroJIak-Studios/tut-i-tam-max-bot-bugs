from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


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


class UserEventUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    title: str | None = Field(default=None, min_length=1, max_length=500)
    description: str | None = Field(default=None, max_length=10000)
    category_id: int | None = None
    city_id: int | None = None
    address: str | None = Field(default=None, min_length=1, max_length=500)
    latitude: float | None = Field(default=None, ge=-90, le=90)
    longitude: float | None = Field(default=None, ge=-180, le=180)
    starts_at: datetime | None = None
    ends_at: datetime | None = None
    chat_invite_url: str | None = Field(default=None, max_length=2048)
    area: list[list[float]] | None = None


class PhotoOrder(BaseModel):
    model_config = ConfigDict(extra="forbid")
    photo_ids: list[int] = Field(min_length=0, max_length=10)


class ChatLink(BaseModel):
    model_config = ConfigDict(extra="forbid")
    chat_invite_url: str = Field(min_length=1, max_length=2048)


class ReviewCreate(BaseModel):
    rating: int = Field(ge=1, le=5)
    text: str | None = None
    anonymous: bool = False
