"""rename localized catalog text columns

Revision ID: 20260929_0013
Revises: 20260929_0012
"""
from typing import Sequence

from alembic import op

revision = "20260929_0013"
down_revision = "20260929_0012"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def _rename_if_needed(table: str) -> None:
    bind = op.get_bind()
    columns = {column["name"] for column in bind.dialect.get_columns(bind, table)}
    if "name" in columns and "text" not in columns:
        op.alter_column(table, "name", new_column_name="text")


def upgrade() -> None:
    _rename_if_needed("city_names")
    _rename_if_needed("interest_names")


def downgrade() -> None:
    raise NotImplementedError("The catalog schema has no compatible legacy shape")
