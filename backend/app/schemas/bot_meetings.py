from datetime import datetime

from pydantic import BaseModel, Field

from app.schemas.bot_access import MaxIdentityRequest


class BotMeetingItem(BaseModel):
    id: int
    title: str
    description: str
    address: str
    starts_at: datetime
    ends_at: datetime | None
    chat_invite_url: str | None


class BotMeetingsResponse(BaseModel):
    total: int
    meetings: list[BotMeetingItem]


class BotMeetingsRequest(MaxIdentityRequest):
    pass


class BotMeetingPhoto(BaseModel):
    id: int
    url: str
    max_image_token: str | None


class BotMeetingCard(BotMeetingItem):
    latitude: float
    longitude: float
    price_rub: int | None
    pushkin_card: bool
    images: list[BotMeetingPhoto]
    attendees_count: int
    going: bool


class BotMeetingAttendanceRequest(BotMeetingsRequest):
    going: bool


class BotPhotoTokenRequest(BotMeetingsRequest):
    token: str = Field(min_length=1, max_length=1024)

