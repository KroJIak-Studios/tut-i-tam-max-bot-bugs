from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.pending_message_repository import PendingMessageRepository
from app.schemas.pending_message import PendingChatSnapshot, PendingMessageRecoveryResponse, PendingMessageSnapshotResponse


class PendingMessageService:
    def __init__(self, session: AsyncSession) -> None:
        self._pending = PendingMessageRepository(session)
        self._session = session

    async def add(self, chat_id: int, message_id: str) -> None:
        await self._pending.add(chat_id, message_id)
        await self._session.commit()

    async def remove(self, chat_id: int, message_id: str) -> None:
        await self._pending.remove(chat_id, message_id)
        await self._session.commit()

    async def snapshot(
        self,
        chat_id: int,
        exclude_message_id: str | None,
    ) -> PendingMessageSnapshotResponse:
        message_ids = await self._pending.list_ids(chat_id, exclude_message_id)
        return PendingMessageSnapshotResponse(message_ids=message_ids)

    async def recovery_snapshot(self) -> PendingMessageRecoveryResponse:
        grouped = await self._pending.list_all_grouped()
        chats = [
            PendingChatSnapshot(max_chat_id=chat_id, message_ids=message_ids)
            for chat_id, message_ids in grouped.items()
        ]
        return PendingMessageRecoveryResponse(chats=chats)

    async def remove_batch(self, chat_id: int, message_ids: list[str]) -> None:
        await self._pending.delete_batch(chat_id, message_ids)
        await self._session.commit()


