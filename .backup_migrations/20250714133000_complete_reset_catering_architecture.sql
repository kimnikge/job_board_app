-- ====================================================================
-- ПОЛНЫЙ СБРОС И СОЗДАНИЕ АРХИТЕКТУРЫ БД ДЛЯ HR-ПЛАТФОРМЫ ОБЩЕПИТА
-- Дата: 14 июля 2025
-- Версия: COMPLETE RESET
-- ====================================================================

BEGIN;

-- ====================================================================
-- 1. ПОЛНАЯ ЗАЧИСТКА ВСЕХ ТАБЛИЦ
-- ====================================================================
DROP TABLE IF EXISTS automation_logs CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS notification_types CASCADE;
DROP TABLE IF EXISTS user_notification_settings CASCADE;
DROP TABLE IF EXISTS candidate_profiles CASCADE;
DROP TABLE IF EXISTS employer_profiles CASCADE;
DROP TABLE IF EXISTS applications CASCADE;
DROP TABLE IF EXISTS urgent_jobs CASCADE;
DROP TABLE IF EXISTS job_postings CASCADE;
DROP TABLE IF EXISTS resumes CASCADE;
DROP TABLE IF EXISTS companies CASCADE;
DROP TABLE IF EXISTS specializations CASCADE;
DROP TABLE IF EXISTS city_districts CASCADE;
DROP TABLE IF EXISTS venue_types CASCADE;

-- ====================================================================
-- 2. СПРАВОЧНИКИ ДЛЯ ОБЩЕПИТА
-- ====================================================================

-- Специализации для общепита
CREATE TABLE specializations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Районы города с метро
CREATE TABLE city_districts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    metro_stations TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Типы заведений общепита
CREATE TABLE venue_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================================================
-- 3. ЗАПОЛНЕНИЕ СПРАВОЧНИКОВ
-- ====================================================================

-- Специализации для общепита (12 позиций)
INSERT INTO specializations (name, description, icon) VALUES
('Повар', 'Приготовление горячих блюд, супов, основных блюд', '👨‍🍳'),
('Су-шеф', 'Помощник шеф-повара, организация работы кухни', '👩‍🍳'),
('Повар-универсал', 'Приготовление различных блюд, работа на всех участках', '🍳'),
('Официант', 'Обслуживание гостей, прием заказов, подача блюд', '🙋‍♂️'),
('Старший официант', 'Координация работы официантов, работа с VIP-гостями', '🙋‍♀️'),
('Бармен', 'Приготовление напитков, коктейлей, обслуживание бара', '🍹'),
('Бариста', 'Приготовление кофе, кофейных напитков', '☕'),
('Кассир', 'Работа с кассой, расчет с клиентами', '💳'),
('Администратор зала', 'Координация работы зала, решение конфликтов', '📋'),
('Хостес', 'Встреча гостей, рассадка, бронирование столиков', '💁‍♀️'),
('Посудомойщик', 'Мытье посуды, поддержание чистоты', '🧽'),
('Курьер', 'Доставка заказов, работа с клиентами', '🚲');

-- Типы заведений (10 видов)
INSERT INTO venue_types (name, description, icon) VALUES
('Ресторан', 'Полноценный ресторан с разнообразным меню', '🍽️'),
('Кафе', 'Небольшое заведение с легким меню', '☕'),
('Быстрое питание', 'Фаст-фуд, быстрое обслуживание', '🍔'),
('Пиццерия', 'Специализация на пицце и итальянской кухне', '🍕'),
('Суши-бар', 'Японская кухня, суши, роллы', '🍣'),
('Бар', 'Алкогольные напитки, закуски', '🍻'),
('Кофейня', 'Кофе, выпечка, легкие закуски', '☕'),
('Столовая', 'Комплексные обеды, домашняя кухня', '🥘'),
('Кондитерская', 'Торты, пирожные, сладости', '🧁'),
('Пекарня', 'Хлеб, выпечка, булочки', '🥖');

-- Районы города (8 основных районов)
INSERT INTO city_districts (name, metro_stations) VALUES
('Центральный', ARRAY['Площадь Революции', 'Театральная', 'Охотный ряд']),
('Арбат', ARRAY['Арбатская', 'Смоленская', 'Кропоткинская']),
('Замоскворечье', ARRAY['Третьяковская', 'Новокузнецкая', 'Павелецкая']),
('Сокольники', ARRAY['Сокольники', 'Красносельская', 'Комсомольская']),
('Таганский', ARRAY['Таганская', 'Курская', 'Чкаловская']),
('Басманный', ARRAY['Красные ворота', 'Чистые пруды', 'Сретенский бульвар']),
('Тверской', ARRAY['Тверская', 'Пушкинская', 'Чеховская']),
('Пресненский', ARRAY['Белорусская', 'Маяковская', 'Баррикадная']);

-- ====================================================================
-- 4. ОСНОВНЫЕ ТАБЛИЦЫ
-- ====================================================================

-- Компании/заведения
CREATE TABLE companies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    venue_type_id INTEGER REFERENCES venue_types(id),
    district_id INTEGER REFERENCES city_districts(id),
    address TEXT,
    metro_station VARCHAR(100),
    description TEXT,
    logo VARCHAR(255),
    website VARCHAR(255),
    phone VARCHAR(20),
    email VARCHAR(255),
    verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ОБЫЧНЫЕ ВАКАНСИИ (срок: 30 дней)
CREATE TABLE job_postings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    
    -- Связь с заведением
    company_id UUID REFERENCES companies(id),
    venue_name VARCHAR(200),
    venue_type_id INTEGER REFERENCES venue_types(id),
    specialization_id INTEGER NOT NULL REFERENCES specializations(id),
    
    -- Локация
    district_id INTEGER REFERENCES city_districts(id),
    address TEXT,
    metro_station VARCHAR(100),
    location VARCHAR(255), -- для совместимости
    
    -- Зарплата (месячная)
    salary_monthly_min NUMERIC(10,2),
    salary_monthly_max NUMERIC(10,2),
    salary_shift NUMERIC(10,2), -- для подработок
    salary_from NUMERIC(10,2), -- для совместимости
    salary_to NUMERIC(10,2), -- для совместимости
    currency VARCHAR(3) DEFAULT 'RUB',
    
    -- Условия работы
    employment_type VARCHAR(50),
    work_schedule TEXT,
    experience_level VARCHAR(50),
    experience_required VARCHAR(50),
    age_min INTEGER,
    age_max INTEGER,
    
    -- Контакты
    contact_phone VARCHAR(20),
    contact_person VARCHAR(100),
    
    -- Дополнительно
    requirements TEXT,
    benefits JSONB,
    tags JSONB,
    
    -- Статус и сроки
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'filled', 'expired')),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'),
    
    -- Статистика
    views_count INTEGER DEFAULT 0,
    applications_count INTEGER DEFAULT 0,
    
    -- Системные поля
    employer_id UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Старые поля для совместимости
    is_urgent BOOLEAN DEFAULT false,
    deadline TIMESTAMP WITH TIME ZONE,
    company_logo_emoji VARCHAR(20)
);

-- СРОЧНЫЕ ВАКАНСИИ (отдельная таблица, автозакрытие 24-48 часов)
CREATE TABLE urgent_jobs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Основная информация
    title VARCHAR(200) NOT NULL,
    description TEXT,
    venue_name VARCHAR(200) NOT NULL,
    venue_type_id INTEGER REFERENCES venue_types(id),
    specialization_id INTEGER NOT NULL REFERENCES specializations(id),
    
    -- Локация
    district_id INTEGER REFERENCES city_districts(id),
    address TEXT NOT NULL,
    metro_station VARCHAR(100),
    
    -- СРОЧНОСТЬ И ВРЕМЯ (ключевые поля)
    needed_date DATE NOT NULL, -- когда нужен работник
    needed_time TIME, -- во сколько выход
    shift_duration INTERVAL, -- продолжительность смены
    auto_close_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
    
    -- ОПЛАТА ЗА СМЕНУ (основная особенность срочных)
    pay_per_shift NUMERIC(10,2) NOT NULL, -- фиксированная оплата за смену
    currency VARCHAR(3) DEFAULT 'RUB',
    
    -- Условия
    requirements TEXT,
    benefits TEXT[],
    
    -- Контакты для СРОЧНОГО связывания
    contact_phone VARCHAR(20) NOT NULL,
    contact_name VARCHAR(100),
    contact_telegram VARCHAR(100),
    
    -- Статус
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'filled', 'expired', 'cancelled')),
    filled_at TIMESTAMP WITH TIME ZONE,
    
    -- Приоритет для уведомлений (1-5, где 5 = критичный)
    notification_priority INTEGER DEFAULT 3 CHECK (notification_priority BETWEEN 1 AND 5),
    
    -- Системные поля
    employer_id UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Резюме
CREATE TABLE resumes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    
    -- Основная информация
    full_name VARCHAR(200) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    telegram_username VARCHAR(100),
    
    -- Специализация в общепите
    primary_specialization_id INTEGER REFERENCES specializations(id),
    secondary_specializations INTEGER[] DEFAULT '{}',
    
    -- Опыт работы
    experience_years INTEGER DEFAULT 0,
    experience_description TEXT,
    skills TEXT[],
    
    -- Зарплатные ожидания
    expected_salary_min NUMERIC(10,2),
    expected_salary_max NUMERIC(10,2),
    expected_salary_shift_min NUMERIC(10,2), -- минимальная оплата за смену для срочных
    
    -- ГОТОВНОСТЬ К РАБОТЕ (ключевые флаги для общепита)
    ready_for_urgent BOOLEAN DEFAULT false, -- готов к срочным выходам
    ready_tomorrow BOOLEAN DEFAULT false, -- готов выйти завтра
    available_for_substitutions BOOLEAN DEFAULT false, -- готов к подменам
    
    -- Предпочтения по локации
    preferred_districts INTEGER[] DEFAULT '{}',
    max_travel_time INTERVAL DEFAULT '1 hour',
    
    -- Предпочтения по графику
    available_weekdays BOOLEAN[] DEFAULT '{true,true,true,true,true,true,true}', -- пн-вс
    available_day_shifts BOOLEAN DEFAULT true,
    available_night_shifts BOOLEAN DEFAULT false,
    preferred_schedule TEXT,
    
    -- Дополнительная информация
    about TEXT,
    languages TEXT[],
    education TEXT,
    
    -- Статистика
    views_count INTEGER DEFAULT 0,
    applications_sent INTEGER DEFAULT 0,
    
    -- Системные поля
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'hidden', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ОТКЛИКИ (поддерживает ОБА типа вакансий)
CREATE TABLE applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Кто откликается
    user_id UUID NOT NULL REFERENCES auth.users(id),
    resume_id UUID REFERENCES resumes(id),
    
    -- На что откликается (один из двух типов)
    job_id UUID REFERENCES job_postings(id), -- обычная вакансия
    urgent_job_id UUID REFERENCES urgent_jobs(id), -- срочная вакансия
    
    -- Тип отклика
    application_type VARCHAR(20) DEFAULT 'standard' CHECK (application_type IN ('standard', 'urgent_ready')),
    
    -- Содержание
    cover_letter TEXT,
    
    -- Статус
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'viewed', 'accepted', 'rejected')),
    
    -- Системные поля
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ограничение: только один тип вакансии
    CHECK (
        (job_id IS NOT NULL AND urgent_job_id IS NULL) OR 
        (job_id IS NULL AND urgent_job_id IS NOT NULL)
    )
);

-- ====================================================================
-- 5. РАСШИРЕННЫЕ ПРОФИЛИ ПОЛЬЗОВАТЕЛЕЙ
-- ====================================================================

-- Профили кандидатов
CREATE TABLE candidate_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) UNIQUE,
    
    -- Основная информация
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    telegram_username VARCHAR(100),
    avatar_url VARCHAR(500),
    
    -- Специализация в общепите
    primary_specialization_id INTEGER REFERENCES specializations(id),
    secondary_specializations INTEGER[] DEFAULT '{}',
    
    -- Опыт работы
    experience_years INTEGER DEFAULT 0,
    experience_description TEXT,
    
    -- Зарплатные ожидания
    expected_salary_monthly_min NUMERIC(10,2),
    expected_salary_monthly_max NUMERIC(10,2),
    expected_salary_shift_min NUMERIC(10,2),
    
    -- Готовность к работе
    ready_for_urgent BOOLEAN DEFAULT false,
    ready_tomorrow BOOLEAN DEFAULT false,
    available_for_substitutions BOOLEAN DEFAULT false,
    
    -- Предпочтения по локации
    preferred_districts INTEGER[] DEFAULT '{}',
    max_travel_time INTERVAL DEFAULT '1 hour',
    
    -- Предпочтения по графику
    preferred_schedule TEXT,
    available_weekdays BOOLEAN[] DEFAULT '{true,true,true,true,true,true,true}',
    available_day_shifts BOOLEAN DEFAULT true,
    available_night_shifts BOOLEAN DEFAULT false,
    
    -- Дополнительная информация
    about_text TEXT,
    skills TEXT[],
    languages TEXT[],
    
    -- Статистика
    profile_views INTEGER DEFAULT 0,
    applications_sent INTEGER DEFAULT 0,
    successful_applications INTEGER DEFAULT 0,
    
    -- Системные поля
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- Профили работодателей (заведений)
CREATE TABLE employer_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) UNIQUE,
    
    -- Информация о заведении
    venue_name VARCHAR(200) NOT NULL,
    venue_type_id INTEGER REFERENCES venue_types(id),
    legal_name VARCHAR(200),
    
    -- Контакты
    contact_phone VARCHAR(20) NOT NULL,
    contact_person VARCHAR(100),
    email VARCHAR(255),
    website VARCHAR(255),
    
    -- Локация
    district_id INTEGER REFERENCES city_districts(id),
    address TEXT NOT NULL,
    metro_station VARCHAR(100),
    coordinates POINT,
    
    -- Описание
    description TEXT,
    specialties TEXT[],
    
    -- Статистика
    jobs_posted INTEGER DEFAULT 0,
    urgent_jobs_posted INTEGER DEFAULT 0,
    successful_hires INTEGER DEFAULT 0,
    rating NUMERIC(3,2) DEFAULT 5.0,
    reviews_count INTEGER DEFAULT 0,
    
    -- Системные поля
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true
);

-- ====================================================================
-- 6. СИСТЕМА УВЕДОМЛЕНИЙ
-- ====================================================================

-- Типы уведомлений
CREATE TABLE notification_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    is_urgent BOOLEAN DEFAULT false,
    telegram_template TEXT,
    push_template TEXT
);

-- Уведомления
CREATE TABLE notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Получатель
    recipient_id UUID NOT NULL REFERENCES auth.users(id),
    
    -- Тип и содержание
    notification_type_id INTEGER NOT NULL REFERENCES notification_types(id),
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    
    -- Приоритет (1-5, где 5 = критичный)
    priority INTEGER DEFAULT 1 CHECK (priority BETWEEN 1 AND 5),
    
    -- Связанные объекты
    urgent_job_id UUID REFERENCES urgent_jobs(id),
    job_posting_id UUID REFERENCES job_postings(id),
    application_id UUID REFERENCES applications(id),
    
    -- Каналы доставки
    send_telegram BOOLEAN DEFAULT true,
    send_push BOOLEAN DEFAULT true,
    send_email BOOLEAN DEFAULT false,
    
    -- Статус доставки
    telegram_sent BOOLEAN DEFAULT false,
    telegram_sent_at TIMESTAMP WITH TIME ZONE,
    push_sent BOOLEAN DEFAULT false,
    push_sent_at TIMESTAMP WITH TIME ZONE,
    email_sent BOOLEAN DEFAULT false,
    email_sent_at TIMESTAMP WITH TIME ZONE,
    
    -- Статус прочтения
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    
    -- Системные поля
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Дополнительные данные
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Настройки уведомлений пользователей
CREATE TABLE user_notification_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) UNIQUE,
    
    -- Общие настройки
    telegram_enabled BOOLEAN DEFAULT true,
    push_enabled BOOLEAN DEFAULT true,
    email_enabled BOOLEAN DEFAULT false,
    
    -- Настройки для соискателей
    urgent_jobs_notifications BOOLEAN DEFAULT true,
    new_jobs_notifications BOOLEAN DEFAULT true,
    application_updates BOOLEAN DEFAULT true,
    
    -- Фильтры для уведомлений о вакансиях
    notify_specializations INTEGER[] DEFAULT '{}',
    notify_districts INTEGER[] DEFAULT '{}',
    min_salary_filter NUMERIC(10,2),
    
    -- Настройки для работодателей
    new_applications_notifications BOOLEAN DEFAULT true,
    urgent_responses_notifications BOOLEAN DEFAULT true,
    
    -- Расписание уведомлений
    quiet_hours_start TIME DEFAULT '22:00',
    quiet_hours_end TIME DEFAULT '08:00',
    timezone VARCHAR(50) DEFAULT 'Europe/Moscow',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Заполняем типы уведомлений
INSERT INTO notification_types (name, description, is_urgent, telegram_template, push_template) VALUES
('urgent_job_created', 'Новая срочная вакансия', true, 
 '🚨 СРОЧНО! Новая вакансия "{title}" в {venue_name}. Оплата: {pay_per_shift}₽ за смену', 
 'Срочная вакансия: {title}'),
('urgent_job_match', 'Срочная вакансия по вашей специализации', true,
 '⚡ Идеальная вакансия! {title} в {venue_name}, завтра в {needed_time}. Готовы?',
 'Подходящая срочная вакансия'),
('application_received', 'Новый отклик на вакансию', false,
 '📨 Новый отклик на "{title}" от {candidate_name}',
 'Новый отклик на вакансию'),
('urgent_application_received', 'Срочный отклик "ГОТОВ!"', true,
 '🔥 ГОТОВ ВЫЙТИ! {candidate_name} откликнулся на "{title}". Контакт: {phone}',
 'Срочный отклик получен'),
('job_expires_soon', 'Вакансия скоро закроется', false,
 '⏰ Вакансия "{title}" закроется через {hours} часов',
 'Вакансия скоро закроется'),
('profile_viewed', 'Ваше резюме просмотрели', false,
 '👀 Работодатель "{employer_name}" просмотрел ваше резюме',
 'Резюме просмотрено');

-- ====================================================================
-- 7. СИСТЕМА АВТОМАТИЗАЦИИ
-- ====================================================================

-- Логирование автоматических задач
CREATE TABLE automation_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    task_name VARCHAR(100) NOT NULL,
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    success BOOLEAN NOT NULL,
    details TEXT,
    affected_rows INTEGER DEFAULT 0
);

-- ====================================================================
-- 8. ИНДЕКСЫ ДЛЯ ОПТИМИЗАЦИИ
-- ====================================================================

-- Справочники
CREATE INDEX idx_specializations_name ON specializations(name);
CREATE INDEX idx_city_districts_name ON city_districts(name);
CREATE INDEX idx_venue_types_name ON venue_types(name);

-- Обычные вакансии
CREATE INDEX idx_job_postings_specialization ON job_postings(specialization_id);
CREATE INDEX idx_job_postings_district ON job_postings(district_id);
CREATE INDEX idx_job_postings_venue_type ON job_postings(venue_type_id);
CREATE INDEX idx_job_postings_status ON job_postings(status);
CREATE INDEX idx_job_postings_expires ON job_postings(expires_at);
CREATE INDEX idx_job_postings_employer ON job_postings(employer_id);

-- Срочные вакансии
CREATE INDEX idx_urgent_jobs_status ON urgent_jobs(status);
CREATE INDEX idx_urgent_jobs_needed_date ON urgent_jobs(needed_date);
CREATE INDEX idx_urgent_jobs_specialization ON urgent_jobs(specialization_id);
CREATE INDEX idx_urgent_jobs_district ON urgent_jobs(district_id);
CREATE INDEX idx_urgent_jobs_auto_close ON urgent_jobs(auto_close_at);
CREATE INDEX idx_urgent_jobs_employer ON urgent_jobs(employer_id);

-- Отклики
CREATE INDEX idx_applications_user ON applications(user_id);
CREATE INDEX idx_applications_job ON applications(job_id);
CREATE INDEX idx_applications_urgent_job ON applications(urgent_job_id);
CREATE INDEX idx_applications_type ON applications(application_type);

-- Резюме
CREATE INDEX idx_resumes_user ON resumes(user_id);
CREATE INDEX idx_resumes_specialization ON resumes(primary_specialization_id);
CREATE INDEX idx_resumes_ready_urgent ON resumes(ready_for_urgent) WHERE ready_for_urgent = true;
CREATE INDEX idx_resumes_ready_tomorrow ON resumes(ready_tomorrow) WHERE ready_tomorrow = true;

-- Профили
CREATE INDEX idx_candidate_profiles_user ON candidate_profiles(user_id);
CREATE INDEX idx_candidate_profiles_specialization ON candidate_profiles(primary_specialization_id);
CREATE INDEX idx_employer_profiles_user ON employer_profiles(user_id);
CREATE INDEX idx_employer_profiles_venue_type ON employer_profiles(venue_type_id);

-- Уведомления
CREATE INDEX idx_notifications_recipient ON notifications(recipient_id);
CREATE INDEX idx_notifications_type ON notifications(notification_type_id);
CREATE INDEX idx_notifications_priority ON notifications(priority);
CREATE INDEX idx_notifications_unread ON notifications(recipient_id, is_read) WHERE is_read = false;

-- Композитные индексы
CREATE INDEX idx_job_postings_active_search ON job_postings(status, specialization_id, district_id) WHERE status = 'active';
CREATE INDEX idx_urgent_jobs_active ON urgent_jobs(status, needed_date, specialization_id) WHERE status = 'active';

-- GIN индексы для массивов
CREATE INDEX idx_candidate_profiles_secondary_specs ON candidate_profiles USING gin(secondary_specializations);
CREATE INDEX idx_candidate_profiles_preferred_districts ON candidate_profiles USING gin(preferred_districts);
CREATE INDEX idx_resumes_secondary_specializations ON resumes USING gin(secondary_specializations);
CREATE INDEX idx_resumes_preferred_districts ON resumes USING gin(preferred_districts);

COMMIT;

-- ====================================================================
-- МИГРАЦИЯ ЗАВЕРШЕНА
-- ====================================================================

/*
РЕЗУЛЬТАТ:
✅ Полная зачистка старых таблиц
✅ 12 специализаций для общепита
✅ 10 типов заведений 
✅ 8 районов города с метро
✅ Отдельная таблица urgent_jobs с автозакрытием
✅ Оплата за смену для срочных вакансий
✅ Флаги готовности (ready_for_urgent, ready_tomorrow)
✅ Система умных уведомлений
✅ Расширенные профили пользователей
✅ Оптимизированные индексы

СЛЕДУЮЩИЙ ШАГ: Обновить фронтенд сервисы для работы с новой схемой
*/
