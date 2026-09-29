import hashlib
from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env.local", extra="ignore")

    database_url: str = Field(validation_alias="DATABASE_URL")
    access_code_enabled: bool = Field(default=False, validation_alias="ACCESS_CODE_ENABLED")
    access_code: str = Field(default="", validation_alias="ACCESS_CODE")
    bot_token: str = Field(default="", validation_alias="BOT_TOKEN")
    admin_password: str = Field(default="", validation_alias="ADMIN_PASSWORD")
    fallback_locale: str = Field(default="ru-ru", validation_alias="FALLBACK_LOCALE")
    local_dev_auth_enabled: bool = Field(default=False, validation_alias="LOCAL_DEV_AUTH_ENABLED")
    local_dev_auth_hosts: str = Field(default="", validation_alias="LOCAL_DEV_AUTH_HOSTS")

    @property
    def access_code_fingerprint(self) -> str:
        return hashlib.sha256(self.access_code.encode()).hexdigest()

    @property
    def local_dev_auth_host_allowlist(self) -> frozenset[str]:
        return frozenset(
            host.strip().lower().rstrip(".")
            for host in self.local_dev_auth_hosts.split(",")
            if host.strip()
        )


@lru_cache
def get_settings() -> Settings:
    return Settings()
