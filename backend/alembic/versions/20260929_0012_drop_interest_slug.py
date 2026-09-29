"""drop legacy interest slug

Revision ID: 20260929_0012
Revises: 20260929_0011
"""
from typing import Sequence

from alembic import op

revision = "20260929_0012"
down_revision = "20260929_0011"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    bind = op.get_bind()
    columns = {column["name"] for column in bind.dialect.get_columns(bind, "interests")}
    if "slug" in columns:
        op.drop_column("interests", "slug")


def downgrade() -> None:
    raise NotImplementedError("The catalog schema has no compatible legacy shape")
