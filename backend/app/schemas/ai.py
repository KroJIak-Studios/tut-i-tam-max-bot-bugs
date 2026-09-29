from datetime import datetime

from pydantic import BaseModel, Field, HttpUrl


class AiProviderWrite(BaseModel):
    purpose: str = Field(pattern="^(chat|embedding|review)$")
    protocol: str = Field(pattern="^(chat_completions|responses)$")
    base_url: HttpUrl
    api_key: str = Field(min_length=1, max_length=4096)
    model: str = Field(min_length=1, max_length=255)
    enabled: bool = True


class AiProviderPatch(BaseModel):
    protocol: str | None = Field(default=None, pattern="^(chat_completions|responses)$")
    base_url: HttpUrl | None = None
    api_key: str | None = Field(default=None, min_length=1, max_length=4096)
    model: str | None = Field(default=None, min_length=1, max_length=255)
    enabled: bool | None = None


class AiProviderView(BaseModel):
    id: int
    purpose: str
    protocol: str
    base_url: str
    key_hint: str
    model: str
    enabled: bool
    created_at: datetime
    updated_at: datetime


class AiProviderCheck(BaseModel):
    ok: bool
    models: list[str] = Field(default_factory=list)
    detail: str | None = None
