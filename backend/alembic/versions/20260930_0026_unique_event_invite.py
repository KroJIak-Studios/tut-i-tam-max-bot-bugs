"""one invite link belongs to one event

Revision ID: 20260930_0026
Revises: 20260930_0025
"""
from typing import Sequence

import sqlalchemy as sa
from alembic import op

revision = "20260930_0026"
down_revision = "20260930_0025"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.execute(sa.text("UPDATE events SET chat_max_id = NULL"))
    op.drop_index("uq_events_chat_max_id", table_name="events")
    op.create_index(
        "uq_events_chat_invite_url",
        "events",
        ["chat_invite_url"],
        unique=True,
        postgresql_where="chat_invite_url IS NOT NULL",
    )


def downgrade() -> None:
    op.drop_index("uq_events_chat_invite_url", table_name="events")
    op.create_index(
        "uq_events_chat_max_id",
        "events",
        ["chat_max_id"],
        unique=True,
        postgresql_where="chat_max_id IS NOT NULL",
    )
