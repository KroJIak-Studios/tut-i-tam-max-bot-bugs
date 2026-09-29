from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class AdminEventWrite(BaseModel):
    model_config = ConfigDict(extra="forbid")

    title: str = Field(min_length=1, max_length=500)
    description: str = Field(max_length=10000)
    city_id: int
    category_id: int | None = None
    address: str = Field(min_length=1, max_length=500)
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)
    starts_at: datetime
    ends_at: datetime | None = None
    price_rub: int = Field(default=0, ge=0)
    pushkin_card: bool = False
    visible: bool = True
    chat_invite_url: str | None = Field(default=None, max_length=2048)
    area: list[list[float]] | None = None


class AdminEventPatch(BaseModel):
    model_config = ConfigDict(extra="forbid")

    title: str | None = Field(default=None, min_length=1, max_length=500)
    description: str | None = Field(default=None, max_length=10000)
    city_id: int | None = None
    category_id: int | None = None
    address: str | None = Field(default=None, min_length=1, max_length=500)
    latitude: float | None = Field(default=None, ge=-90, le=90)
    longitude: float | None = Field(default=None, ge=-180, le=180)
    starts_at: datetime | None = None
    ends_at: datetime | None = None
    price_rub: int | None = Field(default=None, ge=0)
    pushkin_card: bool | None = None
    visible: bool | None = None
    chat_invite_url: str | None = Field(default=None, max_length=2048)
    area: list[list[float]] | None = None


class AdminChatCheck(BaseModel):
    model_config = ConfigDict(extra="forbid")

    chat_invite_url: str = Field(min_length=1, max_length=2048)
