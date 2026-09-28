"""create bot access tables

Revision ID: 20260925_0001
Revises:
Create Date: 2026-09-25
"""

from typing import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "20260925_0001"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "max_users",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("max_user_id", sa.BigInteger(), nullable=False),
        sa.Column("first_name", sa.String(length=255), nullable=False),
        sa.Column("last_name", sa.String(length=255), nullable=True),
        sa.Column("username", sa.String(length=255), nullable=True),
        sa.Column("access_granted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.UniqueConstraint("max_user_id"),
    )
    op.create_index("ix_max_users_max_user_id", "max_users", ["max_user_id"])
    op.create_table(
        "bot_chats",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("max_chat_id", sa.BigInteger(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("primary_message_id", sa.String(length=255), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["max_users.id"]),
        sa.UniqueConstraint("max_chat_id"),
    )
    op.create_index("ix_bot_chats_max_chat_id", "bot_chats", ["max_chat_id"])
    op.create_index("ix_bot_chats_user_id", "bot_chats", ["user_id"])


def downgrade() -> None:
    op.drop_index("ix_bot_chats_user_id", table_name="bot_chats")
    op.drop_index("ix_bot_chats_max_chat_id", table_name="bot_chats")
    op.drop_table("bot_chats")
    op.drop_index("ix_max_users_max_user_id", table_name="max_users")
    op.drop_table("max_users")
