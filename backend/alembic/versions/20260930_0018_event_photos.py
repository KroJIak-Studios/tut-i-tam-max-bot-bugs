"""store event photos

Revision ID: 20260930_0018
Revises: 20260929_0018
"""
from typing import Sequence

from alembic import op
import sqlalchemy as sa

revision = "20260930_0018"
down_revision = "20260929_0018"
branch_labels: str | Sequence[str] | None = None
depends_on: str | None = None


def upgrade() -> None:
    op.create_table(
        "event_photos",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("event_id", sa.Integer(), sa.ForeignKey("events.id", ondelete="CASCADE"), nullable=False),
        sa.Column("url", sa.String(2048), nullable=False),
        sa.Column("position", sa.Integer(), nullable=False, server_default="0"),
    )
    op.create_index("ix_event_photos_event_id_position", "event_photos", ["event_id", "position"])


def downgrade() -> None:
    op.drop_index("ix_event_photos_event_id_position", table_name="event_photos")
    op.drop_table("event_photos")
