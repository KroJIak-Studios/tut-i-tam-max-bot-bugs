import hashlib
from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env.local", extra="ignore", populate_by_name=True)

    database_url: str = Field(validation_alias="DATABASE_URL")
    access_code_enabled: bool = Field(default=False, validation_alias="ACCESS_CODE_ENABLED")
    access_code: str = Field(default="", validation_alias="ACCESS_CODE")
    bot_token: str = Field(default="", validation_alias="BOT_TOKEN")
    admin_password: str = Field(default="", validation_alias="ADMIN_PASSWORD")
    fallback_locale: str = Field(default="ru-ru", validation_alias="FALLBACK_LOCALE")
    allow_dev_auth: bool = Field(default=False, validation_alias="ALLOW_DEV_AUTH")

    @property
    def access_code_fingerprint(self) -> str:
        return hashlib.sha256(self.access_code.encode()).hexdigest()


@lru_cache
def get_settings() -> Settings:
    return Settings()
