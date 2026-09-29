from sqlalchemy import delete, select
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.pending_message import PendingMessage


class PendingMessageRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def add(self, max_chat_id: int, max_message_id: str) -> None:
        statement = (
            insert(PendingMessage)
            .values(max_chat_id=max_chat_id, max_message_id=max_message_id)
            .on_conflict_do_nothing(constraint="uq_pending_chat_message")
        )
        await self._session.execute(statement)

    async def remove(self, max_chat_id: int, max_message_id: str) -> None:
        await self._session.execute(
            delete(PendingMessage).where(
                PendingMessage.max_chat_id == max_chat_id,
                PendingMessage.max_message_id == max_message_id,
            )
        )

    async def delete_batch(self, max_chat_id: int, message_ids: list[str]) -> None:
        if not message_ids:
            return
        await self._session.execute(
            delete(PendingMessage).where(
                PendingMessage.max_chat_id == max_chat_id,
                PendingMessage.max_message_id.in_(message_ids),
            )
        )

    async def list_ids(self, max_chat_id: int, exclude_message_id: str | None = None) -> list[str]:
        statement = select(PendingMessage.max_message_id).where(PendingMessage.max_chat_id == max_chat_id)
        if exclude_message_id is not None:
            statement = statement.where(PendingMessage.max_message_id != exclude_message_id)
        statement = statement.order_by(PendingMessage.id)
        return list((await self._session.scalars(statement)).all())

    async def list_all_grouped(self) -> dict[int, list[str]]:
        statement = select(PendingMessage.max_chat_id, PendingMessage.max_message_id).order_by(
            PendingMessage.max_chat_id, PendingMessage.id
        )
        grouped: dict[int, list[str]] = {}
        for chat_id, message_id in (await self._session.execute(statement)).all():
            grouped.setdefault(chat_id, []).append(message_id)
        return grouped
