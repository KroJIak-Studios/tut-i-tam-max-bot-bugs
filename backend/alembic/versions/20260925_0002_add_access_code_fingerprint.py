"""add access code fingerprint

Revision ID: 20260925_0002
Revises: 20260925_0001
Create Date: 2026-09-25
"""

from typing import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "20260925_0002"
down_revision: str | None = "20260925_0001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column("max_users", sa.Column("access_code_fingerprint", sa.String(length=64), nullable=True))


def downgrade() -> None:
    op.drop_column("max_users", "access_code_fingerprint")
