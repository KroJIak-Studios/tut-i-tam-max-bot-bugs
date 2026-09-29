from datetime import datetime

from pydantic import BaseModel, Field


class MaxIdentityRequest(BaseModel):
    max_user_id: int
    first_name: str = Field(min_length=1, max_length=255)
    last_name: str | None = Field(default=None, max_length=255)
    username: str | None = Field(default=None, max_length=255)
    avatar_url: str | None = Field(default=None, max_length=2048)
    full_avatar_url: str | None = Field(default=None, max_length=2048)
    locale: str | None = Field(default=None, max_length=16)
    max_chat_id: int


class AccessStatusResponse(BaseModel):
    access_required: bool
    access_granted: bool
    locale: str
    assistant_available: bool = False


class VerifyAccessCodeRequest(MaxIdentityRequest):
    code: str = Field(min_length=1, max_length=255)


class PrimaryMessageRequest(MaxIdentityRequest):
    primary_message_id: str | None = Field(default=None, max_length=255)


class PrimaryMessageResponse(BaseModel):
    primary_message_id: str | None


class UserAccessResponse(AccessStatusResponse):
    max_user_id: int
    access_granted_at: datetime | None
