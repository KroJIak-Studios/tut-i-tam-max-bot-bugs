from sqlalchemy import delete, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.chat import BotChat
from app.models.event import Event, UserEvent
from app.models.user import MaxUser


class UserRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get_by_max_user_id(self, max_user_id: int) -> MaxUser | None:
        return await self._session.scalar(select(MaxUser).where(MaxUser.max_user_id == max_user_id))

    async def save(self, user: MaxUser) -> MaxUser:
        try:
            async with self._session.begin_nested():
                self._session.add(user)
                await self._session.flush()
        except IntegrityError:
            existing = await self.get_by_max_user_id(user.max_user_id)
            if existing is None:
                raise
            return existing
        return user

    async def delete_user_data(self, user: MaxUser) -> None:
        authored_event_ids = select(UserEvent.event_id).where(UserEvent.author_user_id == user.id)
        await self._session.execute(delete(Event).where(Event.id.in_(authored_event_ids)))
        await self._session.execute(delete(BotChat).where(BotChat.user_id == user.id))
        await self._session.delete(user)
        await self._session.flush()
