import hmac
import time

from fastapi import HTTPException

from app.core.admin_tokens import ACCESS_KIND, REFRESH_KIND, AdminTokenError, issue_token, read_token
from app.core.settings import Settings
from app.schemas.admin_auth import AdminSession, AdminTokens


class AdminAuthService:
    def __init__(self, settings: Settings) -> None:
        self._settings = settings

    def login(self, password: str) -> AdminTokens:
        expected = self._settings.admin_password
        if not expected or not hmac.compare_digest(password, expected):
            raise HTTPException(status_code=401, detail="admin_unauthorized")
        return self._tokens()

    def refresh(self, refresh_token: str) -> AdminTokens:
        self._read(refresh_token, REFRESH_KIND)
        return self._tokens()

    def session(self, access_token: str) -> AdminSession:
        token = self._read(access_token, ACCESS_KIND)
        return AdminSession(expires_in=max(token.expires_at - int(time.time()), 0))

    def _tokens(self) -> AdminTokens:
        access_token, access_expires = issue_token(self._settings, ACCESS_KIND)
        refresh_token, refresh_expires = issue_token(self._settings, REFRESH_KIND)
        now = int(time.time())
        return AdminTokens(
            access_token=access_token,
            refresh_token=refresh_token,
            expires_in=access_expires - now,
            refresh_expires_in=refresh_expires - now,
        )

    def _read(self, token: str, kind: str):
        try:
            return read_token(self._settings, token, kind)
        except AdminTokenError:
            raise HTTPException(status_code=401, detail="admin_unauthorized") from None
