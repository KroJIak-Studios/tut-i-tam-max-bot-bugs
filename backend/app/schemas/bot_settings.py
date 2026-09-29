from typing import Literal

from pydantic import BaseModel, Field

from app.schemas.bot_access import MaxIdentityRequest

NotificationPreference = Literal["enabled", "silent", "disabled"]


class NotificationPreferenceRequest(MaxIdentityRequest):
    preference: NotificationPreference


class NotificationPreferenceResponse(BaseModel):
    preference: NotificationPreference


class LocalePreferenceRequest(MaxIdentityRequest):
    locale: str = Field(min_length=2, max_length=64)


class LocalePreferenceResponse(BaseModel):
    locale: str
