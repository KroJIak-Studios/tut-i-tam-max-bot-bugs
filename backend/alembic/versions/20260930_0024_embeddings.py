"""store event and interest embeddings

Revision ID: 20260930_0024
Revises: 20260930_0023
"""
from typing import Sequence

from alembic import op
import sqlalchemy as sa
from pgvector.sqlalchemy import Vector

revision = "20260930_0024"
down_revision = "20260930_0023"
branch_labels: str | Sequence[str] | None = None
depends_on: str | None = None

DIMENSIONS = 3072


def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS vector")
    op.add_column("events", sa.Column("embedding", Vector(DIMENSIONS), nullable=True))
    op.add_column("events", sa.Column("embedding_model", sa.String(length=255), nullable=True))
    op.add_column("interests", sa.Column("embedding", Vector(DIMENSIONS), nullable=True))
    op.add_column("interests", sa.Column("embedding_model", sa.String(length=255), nullable=True))


def downgrade() -> None:
    op.drop_column("interests", "embedding_model")
    op.drop_column("interests", "embedding")
    op.drop_column("events", "embedding_model")
    op.drop_column("events", "embedding")
