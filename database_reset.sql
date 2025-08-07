-- ====================================================================
-- ПОЛНАЯ ЗАЧИСТКА И ПЕРЕСОЗДАНИЕ БД ДЛЯ ОБЩЕПИТА АСТАНЫ
-- Выполнить в Supabase Dashboard > SQL Editor
-- ====================================================================

-- Шаг 1: Удаляем все существующие таблицы
DROP TABLE IF EXISTS urgent_job_responses CASCADE;
DROP TABLE IF EXISTS job_applications CASCADE; 
DROP TABLE IF EXISTS urgent_jobs CASCADE;
DROP TABLE IF EXISTS job_postings CASCADE;
DROP TABLE IF EXISTS companies CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS candidate_profiles CASCADE;
DROP TABLE IF EXISTS employer_profiles CASCADE;
DROP TABLE IF EXISTS venue_types CASCADE;
DROP TABLE IF EXISTS specializations CASCADE;
DROP TABLE IF EXISTS city_districts CASCADE;
DROP TABLE IF EXISTS notification_queue CASCADE;
DROP TABLE IF EXISTS notification_settings CASCADE;
DROP TABLE IF EXISTS automation_logs CASCADE;
DROP TABLE IF EXISTS daily_statistics CASCADE;

-- Шаг 2: Создаем районы Астаны
CREATE TABLE city_districts (
    id serial PRIMARY KEY,
    name varchar(100) NOT NULL UNIQUE,
    description text,
    metro_stations text[],
    coordinates point,
    created_at timestamp with time zone DEFAULT NOW(),
    updated_at timestamp with time zone DEFAULT NOW()
);

-- Шаг 3: Создаем специализации
CREATE TABLE specializations (
    id serial PRIMARY KEY,
    name varchar(100) NOT NULL UNIQUE,
    description text,
    category varchar(50) DEFAULT 'general',
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT NOW(),
    updated_at timestamp with time zone DEFAULT NOW()
);

-- Шаг 4: Создаем типы заведений
CREATE TABLE venue_types (
    id serial PRIMARY KEY,
    name varchar(100) NOT NULL UNIQUE,
    description text,
    typical_specializations integer[],
    created_at timestamp with time zone DEFAULT NOW(),
    updated_at timestamp with time zone DEFAULT NOW()
);

-- Шаг 5: Создаем профили пользователей
CREATE TABLE user_profiles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    role varchar(20) NOT NULL CHECK (role IN ('candidate', 'employer', 'admin')),
    
    -- Основная информация
    first_name varchar(100),
    last_name varchar(100),
    phone varchar(20),
    email varchar(255),
    
    -- Для кандидатов
    specialization_id integer REFERENCES specializations(id),
    experience_years integer DEFAULT 0,
    preferred_district_id integer REFERENCES city_districts(id),
    preferred_salary_min integer DEFAULT 0,
    preferred_salary_max integer DEFAULT 0,
    available_immediately boolean DEFAULT false,
    available_weekends boolean DEFAULT false,
    has_own_transport boolean DEFAULT false,
    ready_for_urgent boolean DEFAULT false,
    
    -- Документы и сертификаты
    has_health_book boolean DEFAULT false,
    has_food_safety_cert boolean DEFAULT false,
    
    -- Метаданные
    avatar_url text,
    bio text,
    telegram_username varchar(100),
    created_at timestamp with time zone DEFAULT NOW(),
    updated_at timestamp with time zone DEFAULT NOW()
);

-- Шаг 6: Создаем компании
CREATE TABLE companies (
    id serial PRIMARY KEY,
    name varchar(200) NOT NULL,
    industry varchar(100),
    description text,
    logo text,
    website varchar(255),
    phone varchar(20),
    email varchar(255),
    address text,
    
    district_id integer REFERENCES city_districts(id),
    venue_type_id integer REFERENCES venue_types(id),
    
    verified boolean DEFAULT false,
    employees_count varchar(50),
    working_hours varchar(100),
    location varchar(255), -- для совместимости
    
    created_at timestamp with time zone DEFAULT NOW(),
    updated_at timestamp with time zone DEFAULT NOW()
);

-- Шаг 7: Создаем срочные вакансии
CREATE TABLE urgent_jobs (
    id serial PRIMARY KEY,
    title varchar(200) NOT NULL,
    company_id integer REFERENCES companies(id) ON DELETE CASCADE,
    venue_name varchar(200) NOT NULL,
    
    specialization_id integer REFERENCES specializations(id),
    district_id integer REFERENCES city_districts(id),
    venue_type_id integer REFERENCES venue_types(id),
    
    description text,
    requirements text,
    
    needed_date date NOT NULL,
    needed_time time,
    duration_hours integer DEFAULT 8,
    
    pay_per_shift integer NOT NULL,
    
    address text,
    contact_phone varchar(20),
    contact_person varchar(100),
    
    status varchar(20) DEFAULT 'active' CHECK (status IN ('active', 'filled', 'cancelled')),
    
    created_at timestamp with time zone DEFAULT NOW(),
    updated_at timestamp with time zone DEFAULT NOW()
);

-- Шаг 8: Включаем RLS (Row Level Security)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE urgent_jobs ENABLE ROW LEVEL SECURITY;

-- Шаг 9: Создаем базовые политики RLS
CREATE POLICY "Public profiles are viewable by everyone" 
ON user_profiles FOR SELECT 
USING (true);

CREATE POLICY "Users can insert their own profile" 
ON user_profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" 
ON user_profiles FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Companies are viewable by everyone" 
ON companies FOR SELECT 
USING (true);

CREATE POLICY "Urgent jobs are viewable by everyone" 
ON urgent_jobs FOR SELECT 
USING (true);

-- Шаг 10: Заполняем справочные данные
INSERT INTO city_districts (name, description) VALUES
('Есильский район', 'Центральный административный район Астаны'),
('Алматинский район', 'Южный район с деловым центром'),
('Сарыаркинский район', 'Северный жилой район');

INSERT INTO specializations (name, category, description) VALUES
('Повар', 'kitchen', 'Приготовление горячих блюд'),
('Су-шеф', 'kitchen', 'Помощник шеф-повара'),
('Кондитер', 'kitchen', 'Приготовление десертов и выпечки'),
('Официант', 'service', 'Обслуживание гостей в зале'),
('Бармен', 'service', 'Приготовление напитков'),
('Хостес', 'service', 'Встреча и размещение гостей'),
('Кухонный работник', 'kitchen', 'Подготовка продуктов и уборка'),
('Посудомойщик', 'kitchen', 'Мытье посуды и кухонной утвари'),
('Администратор зала', 'management', 'Координация работы персонала'),
('Курьер', 'delivery', 'Доставка заказов');

INSERT INTO venue_types (name, description) VALUES
('Ресторан', 'Заведение полного цикла с широким меню'),
('Кафе', 'Уютное заведение быстрого питания'),
('Быстрое питание', 'Заведения типа фаст-фуд'),
('Кофейня', 'Специализация на кофе и легких закусках'),
('Пиццерия', 'Специализация на пицце и итальянской кухне'),
('Суши-бар', 'Специализация на японской кухне'),
('Пекарня', 'Производство и продажа выпечки'),
('Кондитерская', 'Специализация на тортах и десертах');

-- Шаг 11: Создаем тестовые компании
INSERT INTO companies (name, industry, description, verified, employees_count, district_id, venue_type_id, location) VALUES
('Ресторан "Астана"', 'Ресторан высокой кухни', 'Премиальный ресторан с европейской кухней в центре города', true, '50-100', 1, 1, 'Есильский район'),
('Кафе "Достык"', 'Семейное кафе', 'Уютное семейное кафе с домашней кухней', true, '10-50', 2, 2, 'Алматинский район'),
('Пиццерия "Мама Мия"', 'Итальянская кухня', 'Аутентичная итальянская пиццерия', true, '20-50', 3, 5, 'Сарыаркинский район'),
('Кофейня "Central Perk"', 'Кофейня', 'Современная кофейня с авторскими напитками', true, '5-20', 1, 4, 'Есильский район'),
('Суши-бар "Токио"', 'Японская кухня', 'Суши-бар с свежей рыбой и роллами', true, '15-30', 2, 6, 'Алматинский район');

-- Шаг 12: Создаем тестовые срочные вакансии
INSERT INTO urgent_jobs (title, company_id, venue_name, specialization_id, district_id, venue_type_id, 
                        description, needed_date, needed_time, pay_per_shift, address, contact_phone, status) VALUES
('Повар на утреннюю смену', 1, 'Ресторан "Астана"', 1, 1, 1, 
 'Требуется опытный повар на утреннюю смену. Работа с европейской кухней.', 
 CURRENT_DATE, '09:00', 8000, 'ул. Республики, 15', '+7 701 123 4567', 'active'),

('Официант на вечернюю смену', 2, 'Кафе "Достык"', 4, 2, 2,
 'Нужен дружелюбный официант на вечернюю смену. Опыт приветствуется.',
 CURRENT_DATE, '18:00', 5000, 'пр. Достык, 20', '+7 701 234 5678', 'active'),

('Бармен в суши-бар', 5, 'Суши-бар "Токио"', 5, 2, 6,
 'Требуется бармен с знанием японских напитков. Обучение предоставляется.',
 CURRENT_DATE + 1, '19:00', 6000, 'ул. Кунаева, 12', '+7 701 345 6789', 'active');

-- Готово! База данных пересоздана с тестовыми данными.
-- Проверить можно командой: SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
