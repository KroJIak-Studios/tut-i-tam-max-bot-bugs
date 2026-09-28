"""add user locale override flag

Revision ID: 20260926_0005
Revises: 20260926_0004
Create Date: 2026-09-26
"""

from typing import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "20260926_0005"
down_revision: str | None = "20260926_0004"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column(
        "max_users",
        sa.Column("locale_is_user_set", sa.Boolean(), nullable=False, server_default=sa.false()),
    )


def downgrade() -> None:
    op.drop_column("max_users", "locale_is_user_set")
