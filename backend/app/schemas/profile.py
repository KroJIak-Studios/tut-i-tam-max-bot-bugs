from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.core.locales import canonicalize_locale


class LocalizedNameInput(BaseModel):
    model_config = ConfigDict(extra="forbid")

    locale_code: str = Field(min_length=2, max_length=32)
    text: str = Field(min_length=1, max_length=255)

    @field_validator("locale_code")
    @classmethod
    def canonical_locale(cls, value: str) -> str:
        locale = canonicalize_locale(value)
        if locale is None:
            raise ValueError("locale format is invalid")
        return locale


class CityCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    names: list[LocalizedNameInput] = Field(min_length=1)
    latitude: float | None = Field(default=None, ge=-90, le=90)
    longitude: float | None = Field(default=None, ge=-180, le=180)


class InterestCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    names: list[LocalizedNameInput] = Field(min_length=1)


class InterestPatch(InterestCreate):
    pass


class MePatch(BaseModel):
    model_config = ConfigDict(extra="forbid")

    city_id: int | None = None
    locale: str | None = Field(default=None, min_length=2, max_length=64)
    interest_ids: list[int] | None = Field(default=None, min_length=0, max_length=5)
    smart_interest_rotation: bool | None = None
    notifications_enabled: bool | None = None
    notifications_silent: bool | None = None
    notify_event_reminders: bool | None = None
    notify_schedule_changes: bool | None = None

    @field_validator("locale")
    @classmethod
    def canonical_locale(cls, value: str | None) -> str | None:
        if value is None:
            return None
        locale = canonicalize_locale(value)
        if locale is None:
            raise ValueError("locale format is invalid")
        return locale

    @field_validator("interest_ids")
    @classmethod
    def unique_interest_ids(cls, value: list[int] | None) -> list[int] | None:
        if value is not None and len(value) != len(set(value)):
            raise ValueError("interest_ids must not contain duplicates")
        return value
