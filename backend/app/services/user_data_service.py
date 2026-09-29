from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import MaxUser
from app.repositories.user_repository import UserRepository


class UserDataService:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session
        self._users = UserRepository(session)

    async def delete(self, user: MaxUser) -> None:
        await self._users.delete_user_data(user)
        await self._session.commit()
