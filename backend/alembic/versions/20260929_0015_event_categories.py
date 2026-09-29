"""add localized event categories and demo catalog data

Revision ID: 20260929_0015
Revises: 20260929_0014
"""
from datetime import datetime, timedelta, timezone
from typing import Sequence

from alembic import op
import sqlalchemy as sa

revision = "20260929_0015"
down_revision = "20260929_0014"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

CATEGORIES = [
    ("Спектакли", "theatre", "Theatre"),
    ("Концерты", "concerts", "Concerts"),
    ("Выставки", "exhibitions", "Exhibitions"),
    ("Лекции", "lectures", "Lectures"),
    ("Мастер-классы", "workshops", "Workshops"),
    ("Кино", "cinema", "Cinema"),
    ("Фестивали", "festivals", "Festivals"),
    ("Спорт", "sport", "Sport"),
    ("Волонтерство", "volunteering", "Volunteering"),
    ("Прогулки и экскурсии", "walks", "Walks and tours"),
]


def upgrade() -> None:
    op.create_table(
        "event_categories",
        sa.Column("id", sa.Integer(), primary_key=True),
    )
    op.create_table(
        "event_category_names",
        sa.Column("category_id", sa.Integer(), sa.ForeignKey("event_categories.id", ondelete="CASCADE"), primary_key=True),
        sa.Column("locale_code", sa.String(32), sa.ForeignKey("locales.code"), primary_key=True),
        sa.Column("text", sa.String(255), nullable=False),
    )
    op.add_column("events", sa.Column("category_id", sa.Integer(), sa.ForeignKey("event_categories.id"), nullable=True))
    op.drop_constraint("ck_events_category", "events", type_="check")

    conn = op.get_bind()
    for ru, code, en in CATEGORIES:
        category_id = conn.execute(sa.text("INSERT INTO event_categories DEFAULT VALUES RETURNING id")).scalar_one()
        conn.execute(sa.text("INSERT INTO event_category_names (category_id, locale_code, text) VALUES (:id, 'ru-ru', :text), (:id, 'en-us', :en)"), {"id": category_id, "text": ru, "en": en})

    category_ids = {code: conn.execute(sa.text("SELECT ec.id FROM event_categories ec JOIN event_category_names ecn ON ecn.category_id = ec.id WHERE ecn.locale_code = 'en-us' AND ecn.text = :text"), {"text": en}).scalar_one() for _ru, code, en in CATEGORIES}
    legacy_map = {"event": category_ids["theatre"], "place": category_ids["exhibitions"], "volunteer": category_ids["volunteering"], "sport": category_ids["sport"], "park": category_ids["walks"]}
    for legacy, category_id in legacy_map.items():
        conn.execute(sa.text("UPDATE events SET category_id = :category_id WHERE category = :legacy"), {"category_id": category_id, "legacy": legacy})
    op.drop_column("events", "category")

    city_id = conn.execute(sa.text("SELECT id FROM cities ORDER BY id LIMIT 1")).scalar_one()
    user_id = conn.execute(sa.text("INSERT INTO max_users (max_user_id, first_name, locale) VALUES (-9000015, 'Demo organizer', 'ru-ru') ON CONFLICT (max_user_id) DO UPDATE SET first_name = EXCLUDED.first_name RETURNING id")).scalar_one()
    now = datetime(2026, 10, 1, 12, 0, tzinfo=timezone.utc)
    events = [
        ("Вечер современной хореографии", "Пластический спектакль о городе и людях с музыкой казанских композиторов.", "Большой драматический театр им. В. И. Качалова", 55.7904, 49.1221, 1, 0, False, "official"),
        ("Камерный концерт: Времена года", "Струнный ансамбль исполняет Вивальди и современные сочинения в камерной акустике.", "Государственный концертный зал, площадь Свободы, 3", 55.7963, 49.1064, 2, 850, True, "official"),
        ("Фотографии Волги: от экспедиции до архива", "Выставка документальных фотографий и личных дневников путешественников по Волге.", "Центр современной культуры «Смена»", 55.7937, 49.1096, 3, 0, False, "official"),
        ("Лекция о татарском модернизме", "Историк искусства рассказывает о художниках Казани начала XX века и их европейских связях.", "Национальная библиотека Республики Татарстан", 55.7874, 49.1235, 4, 0, True, "official"),
        ("Керамика для начинающих", "Небольшая группа, глина, глазури и готовая работа, которую можно забрать после обжига.", "Мастерская «Тепло», улица Пушкина, 22", 55.7891, 49.1208, 5, 2200, False, "official"),
        ("Кино на крыше: советская комедия", "Открытый показ с видом на старый центр, пледами и обсуждением после фильма.", "Лофт на улице Московской, 15", 55.7878, 49.1098, 6, 600, False, "official"),
        ("Фестиваль локальной еды", "Фермерские продукты, уличная кухня Татарстана, музыка и детская программа.", "Парк Горького", 55.7847, 49.1392, 7, 0, False, "official"),
        ("Утренняя тренировка на набережной", "Функциональная тренировка для любого уровня с тренером и мягкой разминкой.", "Кремлёвская набережная, у Центра семьи «Казан»", 55.8041, 49.1097, 8, 0, False, "official"),
        ("Собираем продуктовые наборы", "Помогаем благотворительному фонду подготовить наборы для пожилых людей.", "Склад фонда на улице Декабристов, 1", 55.8247, 49.0876, 9, 0, False, "user"),
        ("Пешая экскурсия по купеческой Казани", "Маршрут по старым доходным домам, дворам и историям купеческих семей.", "Встреча у станции метро «Площадь Тукая»", 55.7872, 49.1220, 10, 450, False, "user"),
        ("Городской книжный клуб", "Обсуждаем новый роман месяца, знакомимся и выбираем следующую книгу вместе.", "Кофейня «Библиотека», улица Баумана, 51", 55.7888, 49.1229, 4, 0, False, "user"),
        ("Волейбол во дворе", "Дружеская игра на открытой площадке. Подойдут новичкам, мяч и сетка на месте.", "Спортивная площадка у улицы Четаева, 10", 55.8250, 49.1650, 8, 0, False, "user"),
        ("Школа городской фотографии", "Практикум по свету и композиции: снимаем вечерние улицы и разбираем кадры.", "Арт-пространство «Алафузов», улица Гладилова, 55", 55.8066, 49.0704, 5, 1200, False, "user"),
        ("Тихая прогулка вдоль Кабана", "Неспешный маршрут на час, разговоры и знакомство с людьми из соседних районов.", "Набережная озера Кабан, у театра Камала", 55.7804, 49.1227, 10, 0, False, "user"),
        ("Открытая репетиция хора", "Можно послушать репетицию и присоединиться к вокальной разминке без подготовки.", "Молодёжный центр «Ак Барс», улица Декабристов, 1", 55.8242, 49.0870, 2, 0, False, "user"),
    ]
    event_insert = sa.text("""
        INSERT INTO events (city_id, category_id, visible, title, description, address, latitude, longitude, starts_at, ends_at)
        VALUES (:city_id, :category_id, true, :title, :description, :address, :latitude, :longitude, :starts_at, :ends_at)
        RETURNING id
    """)
    official_insert = sa.text("INSERT INTO official_events (event_id, price_rub, pushkin_card) VALUES (:event_id, :price, :pushkin)")
    user_insert = sa.text("INSERT INTO user_events (event_id, author_user_id) VALUES (:event_id, :user_id)")
    for index, (title, description, address, latitude, longitude, category_id, price, pushkin, origin) in enumerate(events):
        starts_at = now + timedelta(days=1 + index % 9, hours=10 + index % 8)
        event_id = conn.execute(event_insert, {"city_id": city_id, "category_id": category_id, "title": title, "description": description, "address": address, "latitude": latitude, "longitude": longitude, "starts_at": starts_at, "ends_at": starts_at + timedelta(hours=2)}).scalar_one()
        if origin == "official":
            conn.execute(official_insert, {"event_id": event_id, "price": price, "pushkin": pushkin})
        else:
            conn.execute(user_insert, {"event_id": event_id, "user_id": user_id})


def downgrade() -> None:
    raise NotImplementedError("The category schema has no compatible legacy shape")
