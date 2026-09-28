"""add user settings

Revision ID: 20260926_0004
Revises: 20260925_0003
Create Date: 2026-09-26
"""

from typing import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "20260926_0004"
down_revision: str | None = "20260925_0003"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column(
        "max_users",
        sa.Column("notification_preference", sa.String(length=16), nullable=False, server_default="enabled"),
    )


def downgrade() -> None:
    op.drop_column("max_users", "notification_preference")
