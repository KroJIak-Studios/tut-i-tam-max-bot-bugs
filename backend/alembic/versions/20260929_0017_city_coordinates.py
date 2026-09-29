"""add city center coordinates

Revision ID: 20260929_0017
Revises: 20260929_0016
"""
from typing import Sequence

from alembic import op
import sqlalchemy as sa

revision = "20260929_0017"
down_revision = "20260929_0016"
branch_labels: str | Sequence[str] | None = None
depends_on: str | None = None


def upgrade() -> None:
    op.add_column("cities", sa.Column("latitude", sa.Float(), nullable=True))
    op.add_column("cities", sa.Column("longitude", sa.Float(), nullable=True))
    op.execute("UPDATE cities SET latitude = 55.7963, longitude = 49.1088 WHERE id = 1")
    op.execute("UPDATE cities SET latitude = 55.7558, longitude = 37.6173 WHERE id <> 1")


def downgrade() -> None:
    op.drop_column("cities", "longitude")
    op.drop_column("cities", "latitude")
