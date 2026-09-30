"""keep volunteering as a system event category

Revision ID: 20260930_0023
Revises: 20260930_0022
"""
from typing import Sequence

from alembic import op
import sqlalchemy as sa

revision = "20260930_0023"
down_revision = "20260930_0022"
branch_labels: str | Sequence[str] | None = None
depends_on: str | None = None


def upgrade() -> None:
    columns = {column["name"] for column in sa.inspect(op.get_bind()).get_columns("event_categories")}
    if "code" not in columns:
        op.add_column("event_categories", sa.Column("code", sa.String(length=32), nullable=True))
        op.create_unique_constraint("uq_event_categories_code", "event_categories", ["code"])
    connection = op.get_bind()
    category_id = connection.execute(sa.text("""
        SELECT ec.id
        FROM event_categories ec
        JOIN event_category_names ecn ON ecn.category_id = ec.id
        WHERE ecn.text IN ('Волонтерство', 'Волонтёрство', 'Volunteering')
        ORDER BY ec.id
        LIMIT 1
    """)).scalar()
    if category_id is None:
        category_id = connection.execute(sa.text("INSERT INTO event_categories (code) VALUES ('volunteering') RETURNING id")).scalar_one()
        connection.execute(sa.text("""
            INSERT INTO event_category_names (category_id, locale_code, text)
            VALUES (:category_id, 'ru-ru', 'Волонтёрство'), (:category_id, 'en-us', 'Volunteering')
        """), {"category_id": category_id})
    connection.execute(sa.text("UPDATE event_categories SET code = 'volunteering' WHERE id = :category_id"), {"category_id": category_id})


def downgrade() -> None:
    op.drop_constraint("uq_event_categories_code", "event_categories", type_="unique")
    op.drop_column("event_categories", "code")
