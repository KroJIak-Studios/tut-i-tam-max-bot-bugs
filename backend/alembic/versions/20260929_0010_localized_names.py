"""store locales and localized catalog names

Revision ID: 20260929_0010
Revises: 20260928_0009
"""
from typing import Sequence

from alembic import op
import sqlalchemy as sa

revision = "20260929_0010"
down_revision = "20260928_0009"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "locales",
        sa.Column("code", sa.String(32), primary_key=True),
        sa.Column("native_name", sa.String(255), nullable=False),
    )
    op.execute("INSERT INTO locales (code, native_name) VALUES ('ru-ru', 'Русский'), ('en-us', 'English')")
    op.create_table(
        "city_names",
        sa.Column("city_id", sa.Integer(), sa.ForeignKey("cities.id", ondelete="CASCADE"), primary_key=True),
        sa.Column("locale_code", sa.String(32), sa.ForeignKey("locales.code"), primary_key=True),
        sa.Column("text", sa.String(255), nullable=False),
    )
    op.create_table(
        "interest_names",
        sa.Column("interest_id", sa.Integer(), sa.ForeignKey("interests.id", ondelete="CASCADE"), primary_key=True),
        sa.Column("locale_code", sa.String(32), sa.ForeignKey("locales.code"), primary_key=True),
        sa.Column("text", sa.String(255), nullable=False),
    )
    op.execute("INSERT INTO city_names (city_id, locale_code, text) SELECT id, 'ru-ru', name FROM cities")
    op.execute("INSERT INTO interest_names (interest_id, locale_code, text) SELECT id, 'ru-ru', name FROM interests")
    translations = {
        "Казань": "Kazan", "Москва": "Moscow", "прогулки": "walks", "музеи": "museums",
        "спорт": "sports", "волонтёрство": "volunteering", "концерты": "concerts", "театры": "theatres",
        "парки": "parks", "лекции": "lectures", "кино": "cinema", "гастрономия": "gastronomy",
        "фестивали": "festivals", "настолки": "board games",
    }
    for source, translated in translations.items():
        op.execute(sa.text(
            "INSERT INTO city_names (city_id, locale_code, text) SELECT city_id, 'en-us', :translated "
            "FROM city_names WHERE locale_code = 'ru-ru' AND text = :source"
        ).bindparams(source=source, translated=translated))
        op.execute(sa.text(
            "INSERT INTO interest_names (interest_id, locale_code, text) SELECT interest_id, 'en-us', :translated "
            "FROM interest_names WHERE locale_code = 'ru-ru' AND text = :source"
        ).bindparams(source=source, translated=translated))
    op.drop_constraint("cities_name_key", "cities", type_="unique")
    op.drop_column("cities", "name")
    op.drop_column("interests", "name")
    op.drop_column("interests", "slug")


def downgrade() -> None:
    raise NotImplementedError("The catalog schema has no compatible legacy shape")
