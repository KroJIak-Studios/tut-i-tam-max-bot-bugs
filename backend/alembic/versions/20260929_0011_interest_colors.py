"""add server-generated interest colors

Revision ID: 20260929_0011
Revises: 20260929_0010
"""
from typing import Sequence

from alembic import op
import sqlalchemy as sa

revision = "20260929_0011"
down_revision = "20260929_0010"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column("interests", sa.Column("color", sa.String(7), nullable=True))
    op.execute("UPDATE interests SET color = '#' || lpad(to_hex((random() * 16777215)::int), 6, '0') WHERE color IS NULL")
    op.alter_column("interests", "color", nullable=False)


def downgrade() -> None:
    op.drop_column("interests", "color")
