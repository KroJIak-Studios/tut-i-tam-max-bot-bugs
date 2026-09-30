"""allow shared chat invite links across events

Revision ID: 20260930_0027
Revises: 20260930_0026
"""
from typing import Sequence

import sqlalchemy as sa
from alembic import op

revision = "20260930_0027"
down_revision = "20260930_0026"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.drop_index("uq_events_chat_invite_url", table_name="events")
    op.create_index(
        "ix_events_chat_invite_url",
        "events",
        ["chat_invite_url"],
        unique=False,
        postgresql_where="chat_invite_url IS NOT NULL",
    )


def downgrade() -> None:
    op.drop_index("ix_events_chat_invite_url", table_name="events")
    op.create_index(
        "uq_events_chat_invite_url",
        "events",
        ["chat_invite_url"],
        unique=True,
        postgresql_where="chat_invite_url IS NOT NULL",
    )
