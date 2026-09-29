"""add profile catalog tables

Revision ID: 20260928_0009
Revises: 20260928_0008
"""
from typing import Sequence

from alembic import op
import sqlalchemy as sa

revision = "20260928_0009"
down_revision = "20260928_0008"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.alter_column("max_users", "smart_interest_rotation", server_default=sa.text("true"))
    op.create_table(
        "interests",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("slug", sa.String(32), nullable=False, unique=True),
        sa.Column("name", sa.String(255), nullable=False),
    )
    op.create_table(
        "user_interests",
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("max_users.id", ondelete="CASCADE"), primary_key=True),
        sa.Column("interest_id", sa.Integer(), sa.ForeignKey("interests.id", ondelete="CASCADE"), primary_key=True),
        sa.Column("weight", sa.Float(), nullable=False, server_default=sa.text("1")),
        sa.Column("updated_at", sa.DateTime(timezone=True)),
    )
    op.execute("INSERT INTO cities (name) VALUES ('Казань'), ('Москва') ON CONFLICT (name) DO NOTHING")
    interests = (
        ("walks", "прогулки"), ("museums", "музеи"), ("sport", "спорт"),
        ("volunteering", "волонтёрство"), ("concerts", "концерты"), ("theatres", "театры"),
        ("parks", "парки"), ("lectures", "лекции"), ("cinema", "кино"),
        ("food", "гастрономия"), ("festivals", "фестивали"), ("boardgames", "настолки"),
    )
    values = ", ".join("(%r, %r)" % item for item in interests)
    op.execute(f"INSERT INTO interests (slug, name) VALUES {values} ON CONFLICT (slug) DO NOTHING")


def downgrade() -> None:
    op.drop_table("user_interests")
    op.drop_table("interests")
    op.alter_column("max_users", "smart_interest_rotation", server_default=sa.text("false"))
