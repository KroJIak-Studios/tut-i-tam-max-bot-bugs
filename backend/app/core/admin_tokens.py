import hashlib
import hmac
import time
from dataclasses import dataclass

from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.settings import Settings, get_settings

bearer = HTTPBearer(auto_error=False)
ACCESS_KIND = "access"
REFRESH_KIND = "refresh"


class AdminTokenError(Exception):
    pass


@dataclass(frozen=True)
class AdminToken:
    kind: str
    expires_at: int


def issue_token(settings: Settings, kind: str, now: int | None = None) -> tuple[str, int]:
    issued_at = int(time.time()) if now is None else now
    lifetime = settings.admin_access_ttl_seconds if kind == ACCESS_KIND else settings.admin_refresh_ttl_seconds
    expires_at = issued_at + lifetime
    payload = f"{kind}.{expires_at}".encode()
    signature = hmac.new(settings.admin_token_key, payload, hashlib.sha256).hexdigest()
    return f"{kind}.{expires_at}.{signature}", expires_at


def read_token(settings: Settings, token: str, expected_kind: str, now: int | None = None) -> AdminToken:
    kind, separator, remainder = token.partition(".")
    expires_text, dot, signature = remainder.partition(".")
    if separator != "." or dot != "." or kind != expected_kind or not expires_text.isdigit() or not signature:
        raise AdminTokenError
    expires_at = int(expires_text)
    current = int(time.time()) if now is None else now
    payload = f"{kind}.{expires_at}".encode()
    expected = hmac.new(settings.admin_token_key, payload, hashlib.sha256).hexdigest()
    if not hmac.compare_digest(signature, expected) or expires_at <= current:
        raise AdminTokenError
    return AdminToken(kind, expires_at)


def require_admin(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer),
    settings: Settings = Depends(get_settings),
) -> None:
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise HTTPException(status_code=401, detail="admin_unauthorized")
    try:
        read_token(settings, credentials.credentials, ACCESS_KIND)
    except AdminTokenError:
        raise HTTPException(status_code=401, detail="admin_unauthorized") from None
