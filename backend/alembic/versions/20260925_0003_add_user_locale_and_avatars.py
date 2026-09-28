"""add user locale and avatars

Revision ID: 20260925_0003
Revises: 20260925_0002
Create Date: 2026-09-25
"""

from typing import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "20260925_0003"
down_revision: str | None = "20260925_0002"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column(
        "max_users",
        sa.Column("locale", sa.String(length=16), nullable=False, server_default="ru-ru"),
    )
    op.add_column("max_users", sa.Column("avatar_url", sa.String(length=2048), nullable=True))
    op.add_column("max_users", sa.Column("full_avatar_url", sa.String(length=2048), nullable=True))


def downgrade() -> None:
    op.drop_column("max_users", "full_avatar_url")
    op.drop_column("max_users", "avatar_url")
    op.drop_column("max_users", "locale")
