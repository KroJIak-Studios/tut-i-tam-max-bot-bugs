from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.chat import BotChat


class ChatRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get_or_create(self, max_chat_id: int, user_id: int) -> BotChat:
        chat = await self._session.scalar(select(BotChat).where(BotChat.max_chat_id == max_chat_id))

        if chat is None:
            chat = BotChat(max_chat_id=max_chat_id, user_id=user_id)
            self._session.add(chat)
            await self._session.flush()

        return chat

    async def get_by_max_chat_id(self, max_chat_id: int) -> BotChat | None:
        return await self._session.scalar(select(BotChat).where(BotChat.max_chat_id == max_chat_id))

    async def update_primary_message(self, max_chat_id: int, message_id: str | None) -> None:
        chat = await self.get_by_max_chat_id(max_chat_id)
        if chat is None:
            raise LookupError(f"Chat {max_chat_id} does not exist")

        chat.primary_message_id = message_id
        await self._session.commit()
