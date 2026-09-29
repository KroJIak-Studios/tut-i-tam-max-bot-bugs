"""add event category constraints and catalog query index

Revision ID: 20260929_0016
Revises: 20260929_0015
"""
from typing import Sequence

from alembic import op
import sqlalchemy as sa

revision = "20260929_0016"
down_revision = "20260929_0015"
branch_labels: str | Sequence[str] | None = None
depends_on: str | None = None


def upgrade() -> None:
    op.create_index("ix_events_category_id_starts_at", "events", ["category_id", "starts_at"])


def downgrade() -> None:
    op.drop_index("ix_events_category_id_starts_at", table_name="events")
