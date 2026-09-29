from datetime import datetime, timezone
from hmac import compare_digest

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.settings import Settings
from app.core.locales import canonicalize_locale, normalize_locale
from app.models.user import MaxUser
from app.repositories.chat_repository import ChatRepository
from app.repositories.user_repository import UserRepository
from app.schemas.bot_access import (
    AccessStatusResponse,
    MaxIdentityRequest,
    UserAccessResponse,
    VerifyAccessCodeRequest,
)


class AccessService:
    def __init__(self, session: AsyncSession, settings: Settings) -> None:
        self._settings = settings
        self._users = UserRepository(session)
        self._chats = ChatRepository(session)
        self._session = session

    async def status(self, request: MaxIdentityRequest) -> AccessStatusResponse:
        user = await self._ensure_identity(request)
        return AccessStatusResponse(
            access_required=self._settings.access_code_enabled,
            access_granted=self._has_access(user),
            locale=user.locale,
        )

    async def verify(self, request: VerifyAccessCodeRequest) -> UserAccessResponse:
        user = await self._ensure_identity(request)
        if self._settings.access_code_enabled and not compare_digest(
            request.code, self._settings.access_code
        ): 
            return self._access_response(user)

        if user.access_code_fingerprint != self._settings.access_code_fingerprint:
            user.access_granted_at = datetime.now(timezone.utc)
            user.access_code_fingerprint = self._settings.access_code_fingerprint
            await self._session.commit()

        return self._access_response(user)

    async def get_primary_message(self, request: MaxIdentityRequest) -> str | None:
        await self._ensure_identity(request)
        chat = await self._chats.get_by_max_chat_id(request.max_chat_id)
        return chat.primary_message_id if chat else None

    async def save_primary_message(self, request: MaxIdentityRequest, message_id: str | None) -> None:
        await self._ensure_identity(request)
        await self._chats.update_primary_message(request.max_chat_id, message_id)

    def _has_access(self, user: MaxUser) -> bool:
        return (
            not self._settings.access_code_enabled
            or user.access_code_fingerprint == self._settings.access_code_fingerprint
        )

    def _access_response(self, user: MaxUser) -> UserAccessResponse:
        return UserAccessResponse(
            access_required=self._settings.access_code_enabled,
            access_granted=self._has_access(user),
            locale=user.locale,
            max_user_id=user.max_user_id,
            access_granted_at=user.access_granted_at,
        )

    async def _ensure_identity(self, request: MaxIdentityRequest) -> MaxUser:
        user = await self._users.get_by_max_user_id(request.max_user_id)
        if user is None:
            user = await self._users.save(
                MaxUser(
                    max_user_id=request.max_user_id,
                    first_name=request.first_name,
                    last_name=request.last_name,
                    username=request.username,
                    locale=canonicalize_locale(request.locale) or normalize_locale(None, self._settings.fallback_locale),
                    avatar_url=request.avatar_url,
                    full_avatar_url=request.full_avatar_url,
                )
            )
        else:
            user.first_name = request.first_name
            user.last_name = request.last_name
            user.username = request.username
            if request.locale and canonicalize_locale(request.locale):
                user.locale = canonicalize_locale(request.locale)
            if request.avatar_url is not None:
                user.avatar_url = request.avatar_url
            if request.full_avatar_url is not None:
                user.full_avatar_url = request.full_avatar_url

        await self._chats.get_or_create(request.max_chat_id, user.id)
        await self._session.commit()
        return user
