import hashlib
import re
from functools import lru_cache

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

TTL_UNITS = {"m": 60, "h": 3600, "d": 86400, "w": 604800}


def parse_ttl(value: str) -> int:
    match = re.fullmatch(r"(\d+)([mhdw])", value.strip())
    if match is None or int(match.group(1)) <= 0:
        raise ValueError("ttl must look like 15m, 12h, 1d or 4w")
    return int(match.group(1)) * TTL_UNITS[match.group(2)]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env.local", extra="ignore")

    database_url: str = Field(validation_alias="DATABASE_URL")
    access_code_enabled: bool = Field(default=False, validation_alias="ACCESS_CODE_ENABLED")
    access_code: str = Field(default="", validation_alias="ACCESS_CODE")
    bot_token: str = Field(default="", validation_alias="BOT_TOKEN")
    admin_password: str = Field(default="", validation_alias="ADMIN_PASSWORD")
    admin_access_ttl: str = Field(default="15m", validation_alias="ADMIN_ACCESS_TTL")
    admin_refresh_ttl: str = Field(default="7d", validation_alias="ADMIN_REFRESH_TTL")
    fallback_locale: str = Field(default="ru-ru", validation_alias="FALLBACK_LOCALE")
    chat_provider_base_url: str = Field(default="", validation_alias="CHAT_PROVIDER_BASE_URL")
    chat_provider_api_key: str = Field(default="", validation_alias="CHAT_PROVIDER_API_KEY")
    chat_provider_model: str = Field(default="", validation_alias="CHAT_PROVIDER_MODEL")
    embedding_provider_base_url: str = Field(default="", validation_alias="EMBEDDING_PROVIDER_BASE_URL")
    embedding_provider_api_key: str = Field(default="", validation_alias="EMBEDDING_PROVIDER_API_KEY")
    embedding_provider_model: str = Field(default="", validation_alias="EMBEDDING_PROVIDER_MODEL")
    mini_app_public_url: str = Field(default="", validation_alias="MINI_APP_PUBLIC_URL")
    local_dev_auth_enabled: bool = Field(default=False, validation_alias="LOCAL_DEV_AUTH_ENABLED")
    local_dev_auth_hosts: str = Field(default="", validation_alias="LOCAL_DEV_AUTH_HOSTS")
    media_root: str = Field(default="/var/lib/tut-i-tam/media", validation_alias="MEDIA_ROOT")

    @field_validator("admin_access_ttl", "admin_refresh_ttl")
    @classmethod
    def valid_ttl(cls, value: str) -> str:
        parse_ttl(value)
        return value.strip()

    @property
    def admin_access_ttl_seconds(self) -> int:
        return parse_ttl(self.admin_access_ttl)

    @property
    def admin_refresh_ttl_seconds(self) -> int:
        return parse_ttl(self.admin_refresh_ttl)

    @property
    def admin_token_key(self) -> bytes:
        return hashlib.sha256(f"admin-session:{self.admin_password}".encode()).digest()

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