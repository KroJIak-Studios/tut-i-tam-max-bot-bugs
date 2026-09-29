from datetime import datetime

from pydantic import BaseModel

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


class BotMeetingCard(BotMeetingItem):
    latitude: float
    longitude: float
    price_rub: int | None
    pushkin_card: bool
    images: list[str]
    attendees_count: int
    going: bool


class BotMeetingAttendanceRequest(BotMeetingsRequest):
    going: bool

