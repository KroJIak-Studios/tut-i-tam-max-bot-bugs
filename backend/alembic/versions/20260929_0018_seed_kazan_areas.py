"""seed initial kazan map areas

Revision ID: 20260929_0018
Revises: 20260929_0017
"""
from typing import Sequence

from alembic import op

revision = "20260929_0018"
down_revision = "20260929_0017"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.execute("""
        INSERT INTO map_areas (city_id, kind, name, path, visible)
        SELECT c.id, 'park', 'Парк «Чёрное озеро»', '[[55.7932, 49.1150], [55.7952, 49.1158], [55.7950, 49.1192], [55.7930, 49.1185]]'::json, true
        FROM cities c
        JOIN city_names cn ON cn.city_id = c.id
        WHERE cn.text = 'Казань'
        AND NOT EXISTS (SELECT 1 FROM map_areas WHERE name = 'Парк «Чёрное озеро»');

        INSERT INTO map_areas (city_id, kind, name, path, visible)
        SELECT c.id, 'park', 'Склон Казанского Кремля', '[[55.7970, 49.1020], [55.8010, 49.1035], [55.8015, 49.1090], [55.7980, 49.1090]]'::json, true
        FROM cities c
        JOIN city_names cn ON cn.city_id = c.id
        WHERE cn.text = 'Казань'
        AND NOT EXISTS (SELECT 1 FROM map_areas WHERE name = 'Склон Казанского Кремля');

        INSERT INTO map_areas (city_id, kind, name, path, visible)
        SELECT c.id, 'sport_ground', 'Спортивный кластер «Трудовые резервы»', '[[55.7915, 49.1340], [55.7942, 49.1350], [55.7940, 49.1395], [55.7912, 49.1385]]'::json, true
        FROM cities c
        JOIN city_names cn ON cn.city_id = c.id
        WHERE cn.text = 'Казань'
        AND NOT EXISTS (SELECT 1 FROM map_areas WHERE name = 'Спортивный кластер «Трудовые резервы»');
    """)


def downgrade() -> None:
    op.execute("""
        DELETE FROM map_areas WHERE name IN (
            'Парк «Чёрное озеро»',
            'Склон Казанского Кремля',
            'Спортивный кластер «Трудовые резервы»'
        );
    """)
