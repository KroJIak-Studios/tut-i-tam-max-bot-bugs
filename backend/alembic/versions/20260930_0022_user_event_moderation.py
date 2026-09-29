"""add moderation fields for user events

Revision ID: 20260930_0022
Revises: 20260930_0021
"""
from typing import Sequence

from alembic import op
import sqlalchemy as sa

revision = "20260930_0022"
down_revision = "20260930_0021"
branch_labels: str | Sequence[str] | None = None
depends_on: str | None = None


def upgrade() -> None:
    columns = {column["name"] for column in sa.inspect(op.get_bind()).get_columns("user_events")}
    if "moderation_status" not in columns:
        op.add_column("user_events", sa.Column("moderation_status", sa.String(32), nullable=False, server_default="approved"))
        op.add_column("user_events", sa.Column("moderation_comment", sa.Text(), nullable=True))
        op.add_column("user_events", sa.Column("submitted_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")))
        op.add_column("user_events", sa.Column("moderated_at", sa.DateTime(timezone=True), nullable=True))
        op.add_column("user_events", sa.Column("moderated_by", sa.String(64), nullable=True))


def downgrade() -> None:
    op.drop_column("user_events", "moderated_by")
    op.drop_column("user_events", "moderated_at")
    op.drop_column("user_events", "submitted_at")
    op.drop_column("user_events", "moderation_comment")
    op.drop_column("user_events", "moderation_status")
