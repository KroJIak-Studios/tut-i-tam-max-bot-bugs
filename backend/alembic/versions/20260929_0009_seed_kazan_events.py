"""seed initial kazan events and map areas

Revision ID: 20260929_0009
Revises: 20260928_0008
"""
from typing import Sequence
from alembic import op

revision = "20260929_0009"
down_revision = "20260928_0008"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    # 1. Insert map areas if they don't already exist
    op.execute("""
        INSERT INTO map_areas (city_id, kind, name, path, visible)
        SELECT 1, 'park', 'Парк «Чёрное озеро»', '[[55.7932, 49.1150], [55.7952, 49.1158], [55.7950, 49.1192], [55.7930, 49.1185]]'::json, true
        WHERE NOT EXISTS (SELECT 1 FROM map_areas WHERE name = 'Парк «Чёрное озеро»');

        INSERT INTO map_areas (city_id, kind, name, path, visible)
        SELECT 1, 'park', 'Склон Казанского Кремля', '[[55.7970, 49.1020], [55.8010, 49.1035], [55.8015, 49.1090], [55.7980, 49.1090]]'::json, true
        WHERE NOT EXISTS (SELECT 1 FROM map_areas WHERE name = 'Склон Казанского Кремля');

        INSERT INTO map_areas (city_id, kind, name, path, visible)
        SELECT 1, 'sport_ground', 'Спортивный кластер «Трудовые резервы»', '[[55.7915, 49.1340], [55.7942, 49.1350], [55.7940, 49.1395], [55.7912, 49.1385]]'::json, true
        WHERE NOT EXISTS (SELECT 1 FROM map_areas WHERE name = 'Спортивный кластер «Трудовые резервы»');
    """)

    # 2. Insert initial official events
    op.execute("""
    DO $$
    DECLARE
        eid INT;
    BEGIN
        -- 1. Вечер на набережной
        IF NOT EXISTS (SELECT 1 FROM events WHERE title = 'Вечер на набережной') THEN
            INSERT INTO events (city_id, category, visible, title, description, address, latitude, longitude, starts_at, ends_at)
            VALUES (1, 'event', true, 'Вечер на набережной',
                    'Прогулка по самой красивой набережной Казани. Живая музыка, закатный вид на Кремль, уютная вечерняя атмосфера и новые знакомства.',
                    'Кремлёвская набережная, Казань', 55.8015, 49.1120,
                    NOW() + interval '2 hours', NOW() + interval '5 hours')
            RETURNING id INTO eid;

            INSERT INTO official_events (event_id, price_rub, pushkin_card) VALUES (eid, 0, false);
            INSERT INTO event_reviews (event_id, user_id, rating, text, anonymous)
            VALUES (eid, NULL, 5, 'Очень атмосферное событие! Музыка на закате потрясающая, вид на Кремль просто волшебный.', false);
        END IF;

        -- 2. Тайны Казанского Кремля
        IF NOT EXISTS (SELECT 1 FROM events WHERE title = 'Тайны Казанского Кремля') THEN
            INSERT INTO events (city_id, category, visible, title, description, address, latitude, longitude, starts_at, ends_at)
            VALUES (1, 'place', true, 'Тайны Казанского Кремля',
                    'Вечерняя пешеходная экскурсия по древней крепости с профессиональным гидом. Вы узнаете тайны башни Сююмбике и древних стен.',
                    'Казанский Кремль, Спасская башня', 55.7985, 49.1055,
                    NOW() + interval '4 hours', NOW() + interval '6 hours')
            RETURNING id INTO eid;

            INSERT INTO official_events (event_id, price_rub, pushkin_card) VALUES (eid, 450, true);
            INSERT INTO event_reviews (event_id, user_id, rating, text, anonymous)
            VALUES (eid, NULL, 5, 'Гид рассказывал невероятно увлекательно! Экскурсия пролетела на одном дыхании.', false);
        END IF;

        -- 3. Ночной велоквест по огням Казани
        IF NOT EXISTS (SELECT 1 FROM events WHERE title = 'Ночной велоквест по огням Казани') THEN
            INSERT INTO events (city_id, category, visible, title, description, address, latitude, longitude, starts_at, ends_at)
            VALUES (1, 'sport', true, 'Ночной велоквест по огням Казани',
                    'Атмосферный ночной маршрут по освещённым историческим улицам и набережным города. Загадки старой Казани и командные чекпоинты.',
                    'ул. Баумана, у часов', 55.7890, 49.1205,
                    NOW() + interval '8 hours', NOW() + interval '11 hours')
            RETURNING id INTO eid;

            INSERT INTO official_events (event_id, price_rub, pushkin_card) VALUES (eid, 0, false);
        END IF;

        -- 4. Фестиваль уличных искусств
        IF NOT EXISTS (SELECT 1 FROM events WHERE title = 'Фестиваль уличных искусств') THEN
            INSERT INTO events (city_id, category, visible, title, description, address, latitude, longitude, starts_at, ends_at)
            VALUES (1, 'event', true, 'Фестиваль уличных искусств',
                    'Масштабный трехдневный фестиваль под открытым небом: арт-инсталляции, выступления уличных театров и музыкальная сцена.',
                    'Парк «Чёрное озеро», Казань', 55.7940, 49.1175,
                    NOW() + interval '1 day', NOW() + interval '3 days')
            RETURNING id INTO eid;

            INSERT INTO official_events (event_id, price_rub, pushkin_card) VALUES (eid, 0, false);
        END IF;

        -- 5. Йога на траве
        IF NOT EXISTS (SELECT 1 FROM events WHERE title = 'Йога на траве') THEN
            INSERT INTO events (city_id, category, visible, title, description, address, latitude, longitude, starts_at, ends_at)
            VALUES (1, 'park', true, 'Йога на траве',
                    'Открытая утренняя практика хатха-йоги на свежем воздухе для любого уровня. С собой коврик и удобную одежду.',
                    'Парк «Чёрное озеро», Казань', 55.7942, 49.1170,
                    NOW() + interval '1 day 2 hours', NOW() + interval '1 day 4 hours')
            RETURNING id INTO eid;

            INSERT INTO official_events (event_id, price_rub, pushkin_card) VALUES (eid, 0, false);
            INSERT INTO event_reviews (event_id, user_id, rating, text, anonymous)
            VALUES (eid, NULL, 5, 'Прекрасный инструктор и медитативная музыка. Заряд энергии на целый день!', false);
        END IF;

        -- 6. Турнир 3х3 по стритболу
        IF NOT EXISTS (SELECT 1 FROM events WHERE title = 'Турнир 3х3 по стритболу') THEN
            INSERT INTO events (city_id, category, visible, title, description, address, latitude, longitude, starts_at, ends_at)
            VALUES (1, 'sport', true, 'Турнир 3х3 по стритболу',
                    'Любительские игры и открытая площадка с профессиональным амортизирующим покрытием. Участвуйте или приходите поболеть!',
                    'Спортивный корт «Трудовые резервы»', 55.7928, 49.1368,
                    NOW() + interval '1 day 6 hours', NOW() + interval '1 day 9 hours')
            RETURNING id INTO eid;

            INSERT INTO official_events (event_id, price_rub, pushkin_card) VALUES (eid, 0, false);
        END IF;

        -- 7. Эко-десант: Чистая Казанка
        IF NOT EXISTS (SELECT 1 FROM events WHERE title = 'Эко-десант: Чистая Казанка') THEN
            INSERT INTO events (city_id, category, visible, title, description, address, latitude, longitude, starts_at, ends_at)
            VALUES (1, 'volunteer', true, 'Эко-десант: Чистая Казанка',
                    'Сбор волонтёров для очистки береговой линии и раздельного сбора отходов. Инвентарь и чай предоставляются.',
                    'Берег реки Казанка', 55.8040, 49.1010,
                    NOW() + interval '2 days', NOW() + interval '2 days 4 hours')
            RETURNING id INTO eid;

            INSERT INTO official_events (event_id, price_rub, pushkin_card) VALUES (eid, 0, false);
            INSERT INTO event_reviews (event_id, user_id, rating, text, anonymous)
            VALUES (eid, NULL, 5, 'Отличное полезное дело, собрали 40 мешков мусора и познакомились с классными ребятами.', false);
        END IF;

        -- 8. Архитектура старой Казани
        IF NOT EXISTS (SELECT 1 FROM events WHERE title = 'Архитектура старой Казани') THEN
            INSERT INTO events (city_id, category, visible, title, description, address, latitude, longitude, starts_at, ends_at)
            VALUES (1, 'event', true, 'Архитектура старой Казани',
                    'Лекция и открытая дискуссия о сохранении исторического наследия города, деревянном зодчестве и купеческих особняках.',
                    'ул. Бурхана Шахиди, 7', 55.7875, 49.1230,
                    NOW() + interval '2 days 5 hours', NOW() + interval '2 days 7 hours')
            RETURNING id INTO eid;

            INSERT INTO official_events (event_id, price_rub, pushkin_card) VALUES (eid, 350, true);
        END IF;

        -- 9. Джаз в Старо-Татарской слободе
        IF NOT EXISTS (SELECT 1 FROM events WHERE title = 'Джаз в Старо-Татарской слободе') THEN
            INSERT INTO events (city_id, category, visible, title, description, address, latitude, longitude, starts_at, ends_at)
            VALUES (1, 'event', true, 'Джаз в Старо-Татарской слободе',
                    'Вечер камерного джаза под открытым небом на исторической пешеходной улице. Живые саксофон и контрабас.',
                    'ул. Каюма Насыри, 10', 55.7812, 49.1165,
                    NOW() + interval '3 days', NOW() + interval '3 days 3 hours')
            RETURNING id INTO eid;

            INSERT INTO official_events (event_id, price_rub, pushkin_card) VALUES (eid, 500, true);
        END IF;

        -- 10. Вечерняя пробежка по набережной
        IF NOT EXISTS (SELECT 1 FROM events WHERE title = 'Вечерняя пробежка по набережной') THEN
            INSERT INTO events (city_id, category, visible, title, description, address, latitude, longitude, starts_at, ends_at)
            VALUES (1, 'sport', true, 'Вечерняя пробежка по набережной',
                    'Дружеский забег на 5 км в комфортном темпе с разминкой и заминкой. Подходит для любого уровня подготовки.',
                    'Кремлёвская набережная, старт у НКЦ', 55.8020, 49.1090,
                    NOW() + interval '3 days 4 hours', NOW() + interval '3 days 6 hours')
            RETURNING id INTO eid;

            INSERT INTO official_events (event_id, price_rub, pushkin_card) VALUES (eid, 0, false);
        END IF;

        -- 11. Городской маркет и фестиваль еды
        IF NOT EXISTS (SELECT 1 FROM events WHERE title = 'Городской маркет и фестиваль еды') THEN
            INSERT INTO events (city_id, category, visible, title, description, address, latitude, longitude, starts_at, ends_at)
            VALUES (1, 'place', true, 'Городской маркет и фестиваль еды',
                    'Локальные бренды, фермерские сыры, крафтовые сладости и уличная музыка в уютном сквере.',
                    'Лядской сад, Казань', 55.7915, 49.1210,
                    NOW() + interval '4 days', NOW() + interval '4 days 7 hours')
            RETURNING id INTO eid;

            INSERT INTO official_events (event_id, price_rub, pushkin_card) VALUES (eid, 0, false);
        END IF;

        -- 12. Прошедшее событие: Экскурсия по купеческим особнякам
        IF NOT EXISTS (SELECT 1 FROM events WHERE title = 'Экскурсия по купеческим особнякам') THEN
            INSERT INTO events (city_id, category, visible, title, description, address, latitude, longitude, starts_at, ends_at)
            VALUES (1, 'event', true, 'Экскурсия по купеческим особнякам',
                    'Историческая прогулка по сохранившимся домам казанского купечества XIX века.',
                    'ул. Муштари, 14', 55.7900, 49.1350,
                    NOW() - interval '2 days', NOW() - interval '2 days' + interval '2 hours')
            RETURNING id INTO eid;

            INSERT INTO official_events (event_id, price_rub, pushkin_card) VALUES (eid, 300, false);
            INSERT INTO event_reviews (event_id, user_id, rating, text, anonymous)
            VALUES (eid, NULL, 5, 'Прекрасный лектор, очень интересно рассказал про купеческие дома.', false);
        END IF;
    END $$;
    """)


def downgrade() -> None:
    op.execute("""
        DELETE FROM events WHERE title IN (
            'Вечер на набережной',
            'Тайны Казанского Кремля',
            'Ночной велоквест по огням Казани',
            'Фестиваль уличных искусств',
            'Йога на траве',
            'Турнир 3х3 по стритболу',
            'Эко-десант: Чистая Казанка',
            'Архитектура старой Казани',
            'Джаз в Старо-Татарской слободе',
            'Вечерняя пробежка по набережной',
            'Городской маркет и фестиваль еды',
            'Экскурсия по купеческим особнякам'
        );
        DELETE FROM map_areas WHERE name IN (
            'Парк «Чёрное озеро»',
            'Склон Казанского Кремля',
            'Спортивный кластер «Трудовые резервы»'
        );
    """)
