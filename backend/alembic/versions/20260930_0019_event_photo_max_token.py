"""store MAX image token on event photos

Revision ID: 20260930_0019
Revises: 20260929_0018
"""
from typing import Sequence

from alembic import op
import sqlalchemy as sa

revision = "20260930_0019"
down_revision = "20260930_0018"
branch_labels: str | Sequence[str] | None = None
depends_on: str | None = None


def upgrade() -> None:
    op.add_column("event_photos", sa.Column("max_image_token", sa.String(length=1024), nullable=True))


def downgrade() -> None:
    op.drop_column("event_photos", "max_image_token")
