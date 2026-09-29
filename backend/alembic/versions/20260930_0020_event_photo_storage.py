"""store event photo files by generated key

Revision ID: 20260930_0020
Revises: 20260930_0019
"""
from typing import Sequence

from alembic import op
import sqlalchemy as sa

revision = "20260930_0020"
down_revision = "20260930_0019"
branch_labels: str | Sequence[str] | None = None
depends_on: str | None = None


def upgrade() -> None:
    op.add_column("event_photos", sa.Column("storage_key", sa.String(length=64), nullable=True))
    op.add_column("event_photos", sa.Column("content_type", sa.String(length=64), nullable=True))
    op.execute("DELETE FROM event_photos")
    op.alter_column("event_photos", "storage_key", nullable=False)
    op.alter_column("event_photos", "content_type", nullable=False)
    op.create_unique_constraint("uq_event_photos_storage_key", "event_photos", ["storage_key"])
    op.drop_column("event_photos", "url")


def downgrade() -> None:
    op.add_column("event_photos", sa.Column("url", sa.String(length=2048), nullable=True))
    op.execute("DELETE FROM event_photos")
    op.alter_column("event_photos", "url", nullable=False)
    op.drop_constraint("uq_event_photos_storage_key", "event_photos", type_="unique")
    op.drop_column("event_photos", "content_type")
    op.drop_column("event_photos", "storage_key")
