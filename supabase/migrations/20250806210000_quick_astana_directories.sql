-- Быстрая миграция: Только справочники для Астаны
-- Дата: 6 августа 2025

BEGIN;

-- Создаем справочники если их нет

-- 1. Районы Астаны
CREATE TABLE IF NOT EXISTS city_districts (
    id serial PRIMARY KEY,
    name varchar(100) NOT NULL UNIQUE,
    description text,
    metro_stations text[],
    created_at timestamp with time zone DEFAULT NOW()
);

-- Заполняем районы Астаны
INSERT INTO city_districts (name, description, metro_stations) VALUES
('Есиль', 'Левобережный административный район Астаны', ARRAY['Нур-Жол', 'Сарыарка', 'Московская']),
('Алматы', 'Правобережный центральный район', ARRAY['Достык', 'Жибек Жолы', 'Алматы']),
('Сарыарка', 'Административный центр города', ARRAY['Университет', 'Спортивный комплекс', 'Сарыарка']),
('Байконыр', 'Северо-западный район города', ARRAY['Байконыр', 'Космонавтов', 'Туран']),
('Центральный', 'Исторический центр Астаны', ARRAY['Центральный стадион', 'Ак Орда', 'Байтерек'])
ON CONFLICT (name) DO NOTHING;

-- 2. Специализации для общепита
CREATE TABLE IF NOT EXISTS specializations (
    id serial PRIMARY KEY,
    name varchar(100) NOT NULL UNIQUE,
    description text,
    icon varchar(50),
    category varchar(50) DEFAULT 'kitchen',
    created_at timestamp with time zone DEFAULT NOW()
);

INSERT INTO specializations (name, description, icon, category) VALUES
('Повар', 'Приготовление национальных и европейских блюд', '👨‍🍳', 'kitchen'),
('Су-шеф', 'Помощник шеф-повара, организация работы кухни', '👩‍🍳', 'kitchen'),
('Официант', 'Обслуживание гостей, знание казахских традиций', '🙋‍♂️', 'service'),
('Бармен', 'Приготовление напитков, знание казахских напитков', '🍹', 'service'),
('Администратор зала', 'Координация работы зала, решение конфликтов', '📋', 'management'),
('Кассир', 'Работа с кассой, расчет в тенге и других валютах', '💳', 'service'),
('Курьер', 'Доставка заказов по Астане', '🚲', 'delivery')
ON CONFLICT (name) DO NOTHING;

-- 3. Типы заведений
CREATE TABLE IF NOT EXISTS venue_types (
    id serial PRIMARY KEY,
    name varchar(100) NOT NULL UNIQUE,
    description text,
    icon varchar(50),
    typical_pay_range_min integer DEFAULT 0,
    typical_pay_range_max integer DEFAULT 50000,
    created_at timestamp with time zone DEFAULT NOW()
);

INSERT INTO venue_types (name, description, icon, typical_pay_range_min, typical_pay_range_max) VALUES
('Национальный ресторан', 'Ресторан казахской и центрально-азиатской кухни', '🏛️', 8000, 25000),
('Европейский ресторан', 'Ресторан европейской кухни', '🍽️', 10000, 30000),
('Кафе', 'Небольшое заведение с легким меню', '☕', 5000, 15000),
('Фастфуд', 'Заведение быстрого питания', '🍔', 4000, 12000),
('Шашлычная', 'Специализация на мясных блюдах на углях', '🔥', 6000, 20000),
('Чайхана', 'Традиционное казахское заведение', '🫖', 5000, 18000)
ON CONFLICT (name) DO NOTHING;

-- Логирование
CREATE TABLE IF NOT EXISTS simple_logs (
    id serial PRIMARY KEY,
    operation text NOT NULL,
    executed_at timestamp with time zone DEFAULT NOW(),
    success boolean DEFAULT true,
    details text
);

INSERT INTO simple_logs (operation, details)
VALUES ('create_astana_directories', 'Созданы справочники для Астаны: районы, специализации, типы заведений');

COMMIT;

-- Результат: Справочники для Астаны созданы успешно
