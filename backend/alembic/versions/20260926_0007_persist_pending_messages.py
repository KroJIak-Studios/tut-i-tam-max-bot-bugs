"""persist pending bot messages

Revision ID: 20260926_0007
Revises: 20260926_0006
Create Date: 2026-09-26
"""

from typing import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "20260926_0007"
down_revision: str | None = "20260926_0006"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "pending_messages",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("max_chat_id", sa.BigInteger(), nullable=False),
        sa.Column("max_message_id", sa.String(length=255), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["max_chat_id"], ["bot_chats.max_chat_id"], ondelete="CASCADE"),
        sa.UniqueConstraint("max_chat_id", "max_message_id", name="uq_pending_chat_message"),
    )
    op.create_index("ix_pending_messages_max_chat_id", "pending_messages", ["max_chat_id"])


def downgrade() -> None:
    op.drop_index("ix_pending_messages_max_chat_id", table_name="pending_messages")
    op.drop_table("pending_messages")
