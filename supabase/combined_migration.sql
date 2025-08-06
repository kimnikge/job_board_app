-- ====================================================================
-- МИГРАЦИЯ АРХИТЕКТУРЫ БД ДЛЯ HR-ПЛАТФОРМЫ ОБЩЕПИТА
-- Объединенный файл всех новых таблиц и функций
-- Дата: 14 июля 2025
-- ====================================================================

BEGIN;

-- ====================================================================
-- 1. СПРАВОЧНЫЕ ТАБЛИЦЫ
-- ====================================================================

-- Специализации для общепита
CREATE TABLE IF NOT EXISTS specializations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(50), -- emoji или иконка
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Районы города
CREATE TABLE IF NOT EXISTS city_districts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    metro_stations TEXT[], -- массив станций метро
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Типы заведений общепита
CREATE TABLE IF NOT EXISTS venue_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Заполняем специализации для общепита
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
('Курьер', 'Доставка заказов, работа с клиентами', '🚲')
ON CONFLICT (name) DO NOTHING;

-- Заполняем типы заведений
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
('Пекарня', 'Хлеб, выпечка, булочки', '🥖')
ON CONFLICT (name) DO NOTHING;

-- Примеры районов (можно расширить под конкретный город)
INSERT INTO city_districts (name, metro_stations) VALUES
('Центральный', ARRAY['Площадь Революции', 'Театральная', 'Охотный ряд']),
('Арбат', ARRAY['Арбатская', 'Смоленская', 'Кропоткинская']),
('Замоскворечье', ARRAY['Третьяковская', 'Новокузнецкая', 'Павелецкая']),
('Сокольники', ARRAY['Сокольники', 'Красносельская', 'Комсомольская']),
('Таганский', ARRAY['Таганская', 'Курская', 'Чкаловская']),
('Басманный', ARRAY['Красные ворота', 'Чистые пруды', 'Сретенский бульвар']),
('Тверской', ARRAY['Тверская', 'Пушкинская', 'Чеховская']),
('Пресненский', ARRAY['Белорусская', 'Маяковская', 'Баррикадная'])
ON CONFLICT (name) DO NOTHING;

-- ====================================================================
-- 2. ТАБЛИЦА СРОЧНЫХ ВАКАНСИЙ (ОТДЕЛЬНАЯ!)
-- ====================================================================

CREATE TABLE IF NOT EXISTS urgent_jobs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Основная информация
    title VARCHAR(200) NOT NULL,
    venue_name VARCHAR(200) NOT NULL, -- название заведения
    venue_type_id INTEGER REFERENCES venue_types(id),
    specialization_id INTEGER NOT NULL REFERENCES specializations(id),
    
    -- Локация
    district_id INTEGER REFERENCES city_districts(id),
    address TEXT NOT NULL,
    metro_station VARCHAR(100),
    
    -- Срочность и время
    needed_date DATE NOT NULL, -- когда нужен работник
    needed_time TIME, -- во сколько выход
    shift_duration INTERVAL, -- продолжительность смены
    auto_close_at TIMESTAMP WITH TIME ZONE NOT NULL, -- автозакрытие через 24-48 часов
    
    -- Оплата (специфично для срочных - за смену)
    pay_per_shift NUMERIC(10,2) NOT NULL, -- фиксированная оплата за смену
    currency VARCHAR(3) DEFAULT 'RUB',
    
    -- Описание
    description TEXT,
    requirements TEXT,
    benefits TEXT[],
    
    -- Контакты (для срочного связывания)
    contact_phone VARCHAR(20) NOT NULL,
    contact_name VARCHAR(100),
    contact_telegram VARCHAR(100),
    
    -- Статус
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'filled', 'expired', 'cancelled')),
    filled_at TIMESTAMP WITH TIME ZONE, -- когда была закрыта
    
    -- Системные поля
    employer_id UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Приоритет для уведомлений
    notification_priority INTEGER DEFAULT 1 CHECK (notification_priority BETWEEN 1 AND 5)
);

-- ====================================================================
-- 3. ОБНОВЛЕНИЕ ОБЫЧНЫХ ВАКАНСИЙ
-- ====================================================================

-- Добавляем поля для специализации на общепит в job_postings
ALTER TABLE job_postings ADD COLUMN IF NOT EXISTS venue_name VARCHAR(200);
ALTER TABLE job_postings ADD COLUMN IF NOT EXISTS venue_type_id INTEGER REFERENCES venue_types(id);
ALTER TABLE job_postings ADD COLUMN IF NOT EXISTS specialization_id INTEGER REFERENCES specializations(id);
ALTER TABLE job_postings ADD COLUMN IF NOT EXISTS district_id INTEGER REFERENCES city_districts(id);
ALTER TABLE job_postings ADD COLUMN IF NOT EXISTS metro_station VARCHAR(100);

-- Зарплата для обычных вакансий (месячная + возможность за смену)
ALTER TABLE job_postings ADD COLUMN IF NOT EXISTS salary_monthly_min NUMERIC(10,2);
ALTER TABLE job_postings ADD COLUMN IF NOT EXISTS salary_monthly_max NUMERIC(10,2);
ALTER TABLE job_postings ADD COLUMN IF NOT EXISTS salary_shift NUMERIC(10,2); -- для подработок

-- Дополнительные поля для общепита
ALTER TABLE job_postings ADD COLUMN IF NOT EXISTS work_schedule TEXT; -- график работы
ALTER TABLE job_postings ADD COLUMN IF NOT EXISTS experience_required VARCHAR(50); -- опыт работы
ALTER TABLE job_postings ADD COLUMN IF NOT EXISTS age_min INTEGER;
ALTER TABLE job_postings ADD COLUMN IF NOT EXISTS age_max INTEGER;

-- Контактная информация
ALTER TABLE job_postings ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(20);
ALTER TABLE job_postings ADD COLUMN IF NOT EXISTS contact_person VARCHAR(100);

-- Срок размещения (30 дней по ТЗ)
ALTER TABLE job_postings ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE 
    DEFAULT (NOW() + INTERVAL '30 days');

-- Статус вакансии
ALTER TABLE job_postings ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active' 
    CHECK (status IN ('active', 'paused', 'filled', 'expired'));

-- Счетчики для аналитики
ALTER TABLE job_postings ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0;
ALTER TABLE job_postings ADD COLUMN IF NOT EXISTS applications_count INTEGER DEFAULT 0;

-- ====================================================================
-- 4. РАСШИРЕННЫЕ ПРОФИЛИ ПОЛЬЗОВАТЕЛЕЙ
-- ====================================================================

-- Профили соискателей
CREATE TABLE IF NOT EXISTS candidate_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) UNIQUE,
    
    -- Основная информация
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    telegram_username VARCHAR(100),
    
    -- Специализация в общепите
    primary_specialization_id INTEGER REFERENCES specializations(id),
    secondary_specializations INTEGER[] DEFAULT '{}', -- дополнительные специализации
    
    -- Опыт работы
    experience_years INTEGER DEFAULT 0,
    experience_description TEXT,
    
    -- Зарплатные ожидания
    expected_salary_monthly_min NUMERIC(10,2),
    expected_salary_monthly_max NUMERIC(10,2),
    expected_salary_shift_min NUMERIC(10,2), -- минимальная оплата за смену
    
    -- Готовность к работе
    ready_for_urgent BOOLEAN DEFAULT FALSE, -- готов к срочным выходам
    ready_tomorrow BOOLEAN DEFAULT FALSE, -- готов выйти завтра
    available_for_substitutions BOOLEAN DEFAULT FALSE, -- готов к подменам
    
    -- Предпочтения по локации
    preferred_districts INTEGER[] DEFAULT '{}',
    max_travel_time INTERVAL DEFAULT '1 hour', -- максимальное время в пути
    
    -- Предпочтения по графику
    preferred_schedule TEXT, -- предпочитаемый график
    available_weekdays BOOLEAN[] DEFAULT '{true,true,true,true,true,true,true}', -- пн-вс
    available_day_shifts BOOLEAN DEFAULT TRUE,
    available_night_shifts BOOLEAN DEFAULT FALSE,
    
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
    is_active BOOLEAN DEFAULT TRUE
);

-- Профили работодателей (заведений)
CREATE TABLE IF NOT EXISTS employer_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) UNIQUE,
    
    -- Информация о заведении
    venue_name VARCHAR(200) NOT NULL,
    venue_type_id INTEGER REFERENCES venue_types(id),
    legal_name VARCHAR(200), -- юридическое название
    
    -- Контакты
    contact_phone VARCHAR(20) NOT NULL,
    contact_person VARCHAR(100),
    email VARCHAR(255),
    website VARCHAR(255),
    
    -- Локация
    district_id INTEGER REFERENCES city_districts(id),
    address TEXT NOT NULL,
    metro_station VARCHAR(100),
    coordinates POINT, -- для геолокации
    
    -- Описание
    description TEXT,
    specialties TEXT[], -- кухни/специализации заведения
    
    -- Статистика
    jobs_posted INTEGER DEFAULT 0,
    urgent_jobs_posted INTEGER DEFAULT 0,
    successful_hires INTEGER DEFAULT 0,
    rating NUMERIC(3,2) DEFAULT 5.0,
    reviews_count INTEGER DEFAULT 0,
    
    -- Системные поля
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE
);

-- ====================================================================
-- 5. СИСТЕМА УВЕДОМЛЕНИЙ
-- ====================================================================

-- Типы уведомлений
CREATE TABLE IF NOT EXISTS notification_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    is_urgent BOOLEAN DEFAULT FALSE, -- для приоритетных уведомлений
    telegram_template TEXT,
    push_template TEXT
);

-- Основная таблица уведомлений
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Получатель
    recipient_id UUID NOT NULL REFERENCES auth.users(id),
    
    -- Тип и содержание
    notification_type_id INTEGER NOT NULL REFERENCES notification_types(id),
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    
    -- Приоритет (1 - низкий, 5 - критичный)
    priority INTEGER DEFAULT 1 CHECK (priority BETWEEN 1 AND 5),
    
    -- Связанные объекты
    urgent_job_id UUID REFERENCES urgent_jobs(id),
    job_posting_id UUID REFERENCES job_postings(id),
    application_id UUID REFERENCES applications(id),
    
    -- Каналы доставки
    send_telegram BOOLEAN DEFAULT TRUE,
    send_push BOOLEAN DEFAULT TRUE,
    send_email BOOLEAN DEFAULT FALSE,
    
    -- Статус доставки
    telegram_sent BOOLEAN DEFAULT FALSE,
    telegram_sent_at TIMESTAMP WITH TIME ZONE,
    push_sent BOOLEAN DEFAULT FALSE,
    push_sent_at TIMESTAMP WITH TIME ZONE,
    email_sent BOOLEAN DEFAULT FALSE,
    email_sent_at TIMESTAMP WITH TIME ZONE,
    
    -- Статус прочтения
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    
    -- Системные поля
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT NOW(), -- когда отправить
    
    -- Дополнительные данные
    metadata JSONB DEFAULT '{}'::JSONB
);

-- Настройки уведомлений пользователей
CREATE TABLE IF NOT EXISTS user_notification_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) UNIQUE,
    
    -- Общие настройки
    telegram_enabled BOOLEAN DEFAULT TRUE,
    push_enabled BOOLEAN DEFAULT TRUE,
    email_enabled BOOLEAN DEFAULT FALSE,
    
    -- Настройки для соискателей
    urgent_jobs_notifications BOOLEAN DEFAULT TRUE,
    new_jobs_notifications BOOLEAN DEFAULT TRUE,
    application_updates BOOLEAN DEFAULT TRUE,
    
    -- Фильтры для уведомлений о вакансиях
    notify_specializations INTEGER[] DEFAULT '{}',
    notify_districts INTEGER[] DEFAULT '{}',
    min_salary_filter NUMERIC(10,2),
    
    -- Настройки для работодателей
    new_applications_notifications BOOLEAN DEFAULT TRUE,
    urgent_responses_notifications BOOLEAN DEFAULT TRUE,
    
    -- Расписание уведомлений
    quiet_hours_start TIME DEFAULT '22:00',
    quiet_hours_end TIME DEFAULT '08:00',
    timezone VARCHAR(50) DEFAULT 'Europe/Moscow',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Заполняем типы уведомлений
INSERT INTO notification_types (name, description, is_urgent, telegram_template, push_template) VALUES
('urgent_job_created', 'Новая срочная вакансия', TRUE, 
 '🚨 СРОЧНО! Новая вакансия "{title}" в {venue_name}. Оплата: {pay_per_shift}₽ за смену', 
 'Срочная вакансия: {title}'),
('urgent_job_match', 'Срочная вакансия по вашей специализации', TRUE,
 '⚡ Идеальная вакансия! {title} в {venue_name}, завтра в {needed_time}. Готовы?',
 'Подходящая срочная вакансия'),
('application_received', 'Новый отклик на вакансию', FALSE,
 '📨 Новый отклик на "{title}" от {candidate_name}',
 'Новый отклик на вакансию'),
('urgent_application_received', 'Срочный отклик "ГОТОВ!"', TRUE,
 '🔥 ГОТОВ ВЫЙТИ! {candidate_name} откликнулся на "{title}". Контакт: {phone}',
 'Срочный отклик получен'),
('job_expires_soon', 'Вакансия скоро закроется', FALSE,
 '⏰ Вакансия "{title}" закроется через {hours} часов',
 'Вакансия скоро закроется'),
('profile_viewed', 'Ваше резюме просмотрели', FALSE,
 '👀 Работодатель "{employer_name}" просмотрел ваше резюме',
 'Резюме просмотрено')
ON CONFLICT (name) DO NOTHING;

-- ====================================================================
-- 6. ОБНОВЛЕНИЕ ОТКЛИКОВ
-- ====================================================================

-- Поддержка срочных вакансий в откликах
ALTER TABLE applications ADD COLUMN IF NOT EXISTS urgent_job_id UUID REFERENCES urgent_jobs(id);
ALTER TABLE applications ADD COLUMN IF NOT EXISTS application_type VARCHAR(20) DEFAULT 'standard' 
    CHECK (application_type IN ('standard', 'urgent_ready'));

-- Обновляем резюме для интеграции с новыми профилями
ALTER TABLE resumes ADD COLUMN IF NOT EXISTS candidate_profile_id UUID REFERENCES candidate_profiles(id);
ALTER TABLE resumes ADD COLUMN IF NOT EXISTS ready_for_urgent BOOLEAN DEFAULT FALSE;
ALTER TABLE resumes ADD COLUMN IF NOT EXISTS ready_tomorrow BOOLEAN DEFAULT FALSE;
ALTER TABLE resumes ADD COLUMN IF NOT EXISTS min_shift_pay NUMERIC(10,2);

-- ====================================================================
-- 7. АВТОМАТИЗАЦИЯ И ФУНКЦИИ
-- ====================================================================

-- Таблица для логирования автоматических задач
CREATE TABLE IF NOT EXISTS automation_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    task_name VARCHAR(100) NOT NULL,
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    success BOOLEAN NOT NULL,
    details TEXT,
    affected_rows INTEGER DEFAULT 0
);

-- ====================================================================
-- 8. СОЗДАНИЕ ВСЕХ ИНДЕКСОВ
-- ====================================================================

-- Индексы для справочников
CREATE INDEX IF NOT EXISTS idx_specializations_name ON specializations(name);
CREATE INDEX IF NOT EXISTS idx_city_districts_name ON city_districts(name);
CREATE INDEX IF NOT EXISTS idx_venue_types_name ON venue_types(name);

-- Индексы для срочных вакансий
CREATE INDEX IF NOT EXISTS idx_urgent_jobs_status ON urgent_jobs(status);
CREATE INDEX IF NOT EXISTS idx_urgent_jobs_needed_date ON urgent_jobs(needed_date);
CREATE INDEX IF NOT EXISTS idx_urgent_jobs_specialization ON urgent_jobs(specialization_id);
CREATE INDEX IF NOT EXISTS idx_urgent_jobs_district ON urgent_jobs(district_id);
CREATE INDEX IF NOT EXISTS idx_urgent_jobs_auto_close ON urgent_jobs(auto_close_at);
CREATE INDEX IF NOT EXISTS idx_urgent_jobs_employer ON urgent_jobs(employer_id);
CREATE INDEX IF NOT EXISTS idx_urgent_jobs_location ON urgent_jobs(district_id, metro_station);
CREATE INDEX IF NOT EXISTS idx_urgent_jobs_active ON urgent_jobs(status, needed_date, specialization_id)
    WHERE status = 'active';

-- Индексы для обычных вакансий
CREATE INDEX IF NOT EXISTS idx_job_postings_specialization ON job_postings(specialization_id);
CREATE INDEX IF NOT EXISTS idx_job_postings_district ON job_postings(district_id);
CREATE INDEX IF NOT EXISTS idx_job_postings_venue_type ON job_postings(venue_type_id);
CREATE INDEX IF NOT EXISTS idx_job_postings_status ON job_postings(status);
CREATE INDEX IF NOT EXISTS idx_job_postings_expires ON job_postings(expires_at);
CREATE INDEX IF NOT EXISTS idx_job_postings_active_search ON job_postings(status, specialization_id, district_id)
    WHERE status = 'active';

-- Индексы для профилей
CREATE INDEX IF NOT EXISTS idx_candidate_profiles_user ON candidate_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_candidate_profiles_specialization ON candidate_profiles(primary_specialization_id);
CREATE INDEX IF NOT EXISTS idx_candidate_profiles_ready_urgent ON candidate_profiles(ready_for_urgent)
    WHERE ready_for_urgent = TRUE;
CREATE INDEX IF NOT EXISTS idx_candidate_profiles_ready_tomorrow ON candidate_profiles(ready_tomorrow)
    WHERE ready_tomorrow = TRUE;

CREATE INDEX IF NOT EXISTS idx_employer_profiles_user ON employer_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_employer_profiles_venue_type ON employer_profiles(venue_type_id);
CREATE INDEX IF NOT EXISTS idx_employer_profiles_district ON employer_profiles(district_id);

-- GIN индексы для поиска по массивам
CREATE INDEX IF NOT EXISTS idx_candidate_profiles_secondary_specs ON candidate_profiles USING GIN(secondary_specializations);
CREATE INDEX IF NOT EXISTS idx_candidate_profiles_preferred_districts ON candidate_profiles USING GIN(preferred_districts);

-- Индексы для уведомлений
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(notification_type_id);
CREATE INDEX IF NOT EXISTS idx_notifications_priority ON notifications(priority);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(recipient_id, is_read)
    WHERE is_read = FALSE;
CREATE INDEX IF NOT EXISTS idx_notifications_scheduled ON notifications(scheduled_for)
    WHERE telegram_sent = FALSE OR push_sent = FALSE;
CREATE INDEX IF NOT EXISTS idx_notifications_user_feed ON notifications(recipient_id, created_at DESC, is_read);

COMMIT;

-- ====================================================================
-- МИГРАЦИЯ ЗАВЕРШЕНА!
-- Создано:
-- - 3 справочные таблицы (специализации, районы, типы заведений)
-- - 1 отдельная таблица срочных вакансий
-- - 2 расширенные таблицы профилей
-- - 3 таблицы системы уведомлений
-- - Обновлены существующие таблицы
-- - Созданы все необходимые индексы
-- ====================================================================
