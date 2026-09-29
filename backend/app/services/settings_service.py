from sqlalchemy.ext.asyncio import AsyncSession

from app.core.locales import canonicalize_locale, normalize_locale
from app.core.settings import Settings
from app.models.user import MaxUser
from app.repositories.chat_repository import ChatRepository
from app.repositories.user_repository import UserRepository
from app.schemas.bot_access import MaxIdentityRequest
from app.schemas.bot_settings import (
    LocalePreferenceRequest,
    LocalePreferenceResponse,
    NotificationPreferenceRequest,
    NotificationPreferenceResponse,
)


class SettingsService:
    def __init__(self, session: AsyncSession, settings: Settings) -> None:
        self._session = session
        self._settings = settings
        self._users = UserRepository(session)
        self._chats = ChatRepository(session)

    async def notification_preference(
        self, request: MaxIdentityRequest
    ) -> NotificationPreferenceResponse:
        user = await self._identity(request)
        return NotificationPreferenceResponse(preference=user.notification_preference)

    async def update_notification_preference(
        self, request: NotificationPreferenceRequest
    ) -> NotificationPreferenceResponse:
        user = await self._identity(request)
        user.notification_preference = request.preference
        await self._session.commit()
        return NotificationPreferenceResponse(preference=user.notification_preference)

    async def update_locale(self, request: LocalePreferenceRequest) -> LocalePreferenceResponse:
        user = await self._identity(request)
        user.locale = canonicalize_locale(request.locale) or normalize_locale(
            request.locale, self._settings.fallback_locale
        )
        user.locale_is_user_set = True
        await self._session.commit()
        return LocalePreferenceResponse(locale=user.locale)

    async def delete_user_data(self, request: MaxIdentityRequest) -> None:
        user = await self._users.get_by_max_user_id(request.max_user_id)
        if user is None:
            return
        await self._users.delete_user_data(user)
        await self._session.commit()

    async def _identity(self, request: MaxIdentityRequest) -> MaxUser:
        user = await self._users.get_by_max_user_id(request.max_user_id)
        if user is None:
            user = await self._users.save(
                MaxUser(
                    max_user_id=request.max_user_id,
                    first_name=request.first_name,
                    last_name=request.last_name,
                    username=request.username,
                    locale=normalize_locale(request.locale, self._settings.fallback_locale),
                    avatar_url=request.avatar_url,
                    full_avatar_url=request.full_avatar_url,
                )
            )
        else:
            user.first_name = request.first_name
            user.last_name = request.last_name
            user.username = request.username
            if request.locale:
                user.locale = normalize_locale(request.locale, self._settings.fallback_locale)
            if request.avatar_url is not None:
                user.avatar_url = request.avatar_url
            if request.full_avatar_url is not None:
                user.full_avatar_url = request.full_avatar_url

        await self._chats.get_or_create(request.max_chat_id, user.id)
        await self._session.commit()
        return user
