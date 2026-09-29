from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.core.locales import canonicalize_locale


class CategoryNameInput(BaseModel):
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


class EventCategoryCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    names: list[CategoryNameInput] = Field(min_length=1)
