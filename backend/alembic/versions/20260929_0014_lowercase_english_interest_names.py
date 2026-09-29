"""lowercase English interest names

Revision ID: 20260929_0014
Revises: 20260929_0013
"""
from typing import Sequence

from alembic import op

revision = "20260929_0014"
down_revision = "20260929_0013"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.execute("UPDATE interest_names SET text = lower(text) WHERE locale_code = 'en-us'")


def downgrade() -> None:
    raise NotImplementedError("The catalog schema has no compatible legacy shape")
