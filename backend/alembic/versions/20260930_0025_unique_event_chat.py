"""one MAX chat belongs to one event

Revision ID: 20260930_0025
Revises: 20260930_0024
"""
from typing import Sequence

from alembic import op

revision = "20260930_0025"
down_revision = "20260930_0024"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_index("uq_events_chat_max_id", "events", ["chat_max_id"], unique=True, postgresql_where="chat_max_id IS NOT NULL")


def downgrade() -> None:
    op.drop_index("uq_events_chat_max_id", table_name="events")
