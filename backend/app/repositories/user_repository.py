from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import MaxUser


class UserRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get_by_max_user_id(self, max_user_id: int) -> MaxUser | None:
        return await self._session.scalar(select(MaxUser).where(MaxUser.max_user_id == max_user_id))

    async def save(self, user: MaxUser) -> MaxUser:
        self._session.add(user)
        await self._session.flush()
        return user
