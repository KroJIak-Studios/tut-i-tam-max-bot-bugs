from pydantic import BaseModel, Field

from app.schemas.bot_access import MaxIdentityRequest


class NearbyRequest(MaxIdentityRequest):
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)


class NearbyEvent(BaseModel):
    id: int
    title: str
    description: str
    address: str
    starts_at: str
    images: list[str]
    going: bool
