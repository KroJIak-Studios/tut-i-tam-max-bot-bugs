from datetime import datetime

from sqlalchemy import BigInteger, DateTime, ForeignKey, String, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db import Base


class PendingMessage(Base):
    __tablename__ = "pending_messages"
    __table_args__ = (UniqueConstraint("max_chat_id", "max_message_id", name="uq_pending_chat_message"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    max_chat_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("bot_chats.max_chat_id", ondelete="CASCADE"),
        index=True,
    )
    max_message_id: Mapped[str] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
