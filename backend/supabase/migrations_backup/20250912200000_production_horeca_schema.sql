-- Новая миграция для продакшн HoReCa схемы
-- Дата: 12 сентября 2025
-- Задача: Применить окончательную HoReCa схему без синтаксических ошибок

BEGIN;

-- Удаляем проблемные ограничения если есть
DO $$ BEGIN
    ALTER TABLE urgent_jobs DROP CONSTRAINT IF EXISTS check_urgent_jobs_status;
    ALTER TABLE urgent_jobs DROP CONSTRAINT IF EXISTS check_urgent_jobs_priority;
    ALTER TABLE urgent_jobs DROP CONSTRAINT IF EXISTS check_urgent_jobs_pay_positive;
    ALTER TABLE urgent_jobs DROP CONSTRAINT IF EXISTS check_urgent_jobs_needed_date;
    ALTER TABLE urgent_jobs DROP CONSTRAINT IF EXISTS check_urgent_jobs_auto_close;
    ALTER TABLE urgent_jobs DROP CONSTRAINT IF EXISTS check_urgent_jobs_currency;
    ALTER TABLE urgent_jobs DROP CONSTRAINT IF EXISTS check_urgent_jobs_shift_time;
    ALTER TABLE urgent_jobs DROP CONSTRAINT IF EXISTS check_urgent_jobs_phone_format;
EXCEPTION
    WHEN others THEN null;
END $$;

-- Сбросим схему к чистому состоянию для продакшн
DROP TABLE IF EXISTS urgent_jobs CASCADE;
DROP TABLE IF EXISTS job_postings CASCADE;
DROP TABLE IF EXISTS employers CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- ====================================================================
-- СОЗДАНИЕ ТАБЛИЦ ЗАНОВО С ПРАВИЛЬНОЙ СХЕМОЙ
-- ====================================================================

-- Таблица профилей пользователей
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    telegram_id BIGINT UNIQUE,
    full_name TEXT NOT NULL,
    username TEXT,
    phone TEXT,
    role TEXT DEFAULT 'candidate' CHECK (role IN ('candidate', 'employer', 'admin')),
    bio TEXT,
    location TEXT,
    experience TEXT,
    skills TEXT[] DEFAULT '{}',
    benefits_wanted TEXT[] DEFAULT '{}',
    portfolio_url TEXT,
    ready_for_urgent BOOLEAN DEFAULT false,
    urgent_available_until TIMESTAMPTZ,
    notification_preferences JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (id)
);

-- Таблица работодателей
CREATE TABLE employers (
    id UUID DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    company_type TEXT DEFAULT 'restaurant' CHECK (company_type IN ('restaurant', 'cafe', 'bar', 'hotel', 'catering', 'other')),
    description TEXT,
    location TEXT NOT NULL,
    contact_person TEXT NOT NULL,
    contact_phone TEXT NOT NULL,
    contact_telegram TEXT,
    website TEXT,
    license_number TEXT,
    is_verified BOOLEAN DEFAULT false,
    verification_documents JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (id)
);

-- Таблица обычных вакансий HoReCa
CREATE TABLE job_postings (
    id UUID DEFAULT gen_random_uuid(),
    employer_id UUID REFERENCES employers(id) ON DELETE CASCADE,
    
    -- Основная информация
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('service', 'kitchen', 'management', 'cleaning', 'other')),
    position_type TEXT NOT NULL CHECK (position_type IN ('waiter', 'bartender', 'cook', 'chef', 'cashier', 'cleaner', 'manager', 'host', 'other')),
    
    -- Зарплата и условия
    salary_min INTEGER,
    salary_max INTEGER,
    salary_type TEXT DEFAULT 'monthly' CHECK (salary_type IN ('hourly', 'daily', 'monthly')),
    employment_type TEXT DEFAULT 'full_time' CHECK (employment_type IN ('full_time', 'part_time', 'temporary', 'internship')),
    schedule_type TEXT DEFAULT 'fixed' CHECK (schedule_type IN ('fixed', 'flexible', 'shift', 'night', 'weekend')),
    
    -- Требования
    experience_required TEXT DEFAULT 'none' CHECK (experience_required IN ('none', 'any', '1year+', '3years+', '5years+')),
    education_required TEXT DEFAULT 'none' CHECK (education_required IN ('none', 'secondary', 'vocational', 'higher')),
    required_skills TEXT[] DEFAULT '{}',
    
    -- Дополнительная информация
    benefits TEXT[] DEFAULT '{}',
    location TEXT NOT NULL,
    additional_info TEXT,
    
    -- Контакты и отклики
    contact_method TEXT DEFAULT 'application' CHECK (contact_method IN ('application', 'phone', 'telegram', 'email', 'both')),
    contact_phone TEXT,
    contact_telegram TEXT,
    
    -- Статус
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'filled', 'expired')),
    positions_total INTEGER DEFAULT 1,
    positions_filled INTEGER DEFAULT 0,
    
    -- Временные метки
    published_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    PRIMARY KEY (id)
);

-- Таблица срочных вакансий
CREATE TABLE urgent_jobs (
    id UUID DEFAULT gen_random_uuid(),
    employer_id UUID REFERENCES employers(id) ON DELETE CASCADE,
    
    -- Основная информация
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL CHECK (category IN ('service', 'kitchen', 'management', 'cleaning', 'other')),
    position_type TEXT NOT NULL CHECK (position_type IN ('waiter', 'bartender', 'cook', 'chef', 'cashier', 'cleaner', 'manager', 'host', 'other')),
    
    -- Время и дата работы
    needed_date DATE NOT NULL,
    needed_time_start TIME NOT NULL,
    needed_time_end TIME NOT NULL,
    
    -- Оплата
    payment_per_shift INTEGER NOT NULL CHECK (payment_per_shift > 0),
    instant_payment BOOLEAN DEFAULT false,
    currency TEXT DEFAULT 'KZT' CHECK (currency IN ('KZT', 'USD', 'RUB')),
    
    -- Требования
    experience_required TEXT DEFAULT 'none' CHECK (experience_required IN ('none', 'any', '1year+', '3years+', '5years+')),
    required_skills TEXT[] DEFAULT '{}',
    
    -- Дополнительная информация
    benefits TEXT[] DEFAULT '{}',
    location TEXT NOT NULL,
    additional_requirements TEXT,
    
    -- Срочность и статус
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'critical')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'filled', 'expired', 'cancelled')),
    urgency_level INTEGER DEFAULT 1 CHECK (urgency_level BETWEEN 1 AND 5),
    
    -- Количество позиций
    positions_needed INTEGER DEFAULT 1 CHECK (positions_needed > 0),
    positions_filled INTEGER DEFAULT 0,
    
    -- Контактная информация
    contact_phone TEXT,
    contact_telegram TEXT,
    contact_person TEXT,
    
    -- Автоматическое закрытие
    auto_close_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours'),
    
    -- Временные метки
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    filled_at TIMESTAMPTZ,
    
    PRIMARY KEY (id)
);

-- ====================================================================
-- ИНДЕКСЫ ДЛЯ ПРОИЗВОДИТЕЛЬНОСТИ
-- ====================================================================

-- Индексы для job_postings
CREATE INDEX IF NOT EXISTS idx_job_postings_category ON job_postings(category);
CREATE INDEX IF NOT EXISTS idx_job_postings_position_type ON job_postings(position_type);
CREATE INDEX IF NOT EXISTS idx_job_postings_status ON job_postings(status);
CREATE INDEX IF NOT EXISTS idx_job_postings_location ON job_postings USING GIN (to_tsvector('english', location));
CREATE INDEX IF NOT EXISTS idx_job_postings_employer ON job_postings(employer_id);
CREATE INDEX IF NOT EXISTS idx_job_postings_created ON job_postings(created_at DESC);

-- Индексы для urgent_jobs
CREATE INDEX IF NOT EXISTS idx_urgent_jobs_category ON urgent_jobs(category);
CREATE INDEX IF NOT EXISTS idx_urgent_jobs_position_type ON urgent_jobs(position_type);
CREATE INDEX IF NOT EXISTS idx_urgent_jobs_status ON urgent_jobs(status);
CREATE INDEX IF NOT EXISTS idx_urgent_jobs_priority ON urgent_jobs(priority);
CREATE INDEX IF NOT EXISTS idx_urgent_jobs_needed_date ON urgent_jobs(needed_date);
CREATE INDEX IF NOT EXISTS idx_urgent_jobs_location ON urgent_jobs USING GIN (to_tsvector('english', location));
CREATE INDEX IF NOT EXISTS idx_urgent_jobs_created ON urgent_jobs(created_at DESC);

-- Индексы для employers
CREATE INDEX IF NOT EXISTS idx_employers_user_id ON employers(user_id);
CREATE INDEX IF NOT EXISTS idx_employers_company_type ON employers(company_type);
CREATE INDEX IF NOT EXISTS idx_employers_location ON employers USING GIN (to_tsvector('english', location));

-- Индексы для profiles
CREATE INDEX IF NOT EXISTS idx_profiles_telegram_id ON profiles(telegram_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_ready_urgent ON profiles(ready_for_urgent) WHERE ready_for_urgent = true;

-- ====================================================================
-- ТРИГГЕРЫ ДЛЯ АВТООБНОВЛЕНИЯ TIMESTAMPS
-- ====================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employers_updated_at BEFORE UPDATE ON employers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_job_postings_updated_at BEFORE UPDATE ON job_postings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_urgent_jobs_updated_at BEFORE UPDATE ON urgent_jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ====================================================================
-- RLS ПОЛИТИКИ БЕЗОПАСНОСТИ
-- ====================================================================

-- Включаем RLS для всех таблиц
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE employers ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE urgent_jobs ENABLE ROW LEVEL SECURITY;

-- Политики для profiles (пользователи могут читать и редактировать свои профили)
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Политики для employers
CREATE POLICY "Employers can manage their own data" ON employers
    FOR ALL USING (user_id = auth.uid());

-- Политики для job_postings
CREATE POLICY "Anyone can view active jobs" ON job_postings
    FOR SELECT USING (status = 'active');

CREATE POLICY "Employers can manage their jobs" ON job_postings
    FOR ALL USING (employer_id IN (SELECT id FROM employers WHERE user_id = auth.uid()));

-- Политики для urgent_jobs
CREATE POLICY "Anyone can view active urgent jobs" ON urgent_jobs
    FOR SELECT USING (status = 'active' AND needed_date >= CURRENT_DATE);

CREATE POLICY "Employers can manage their urgent jobs" ON urgent_jobs
    FOR ALL USING (employer_id IN (SELECT id FROM employers WHERE user_id = auth.uid()));

-- Админы могут видеть всё
CREATE POLICY "Admins can access all data" ON profiles
    FOR ALL USING (EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    ));

CREATE POLICY "Admins can access all employers" ON employers
    FOR ALL USING (EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    ));

CREATE POLICY "Admins can access all jobs" ON job_postings
    FOR ALL USING (EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    ));

CREATE POLICY "Admins can access all urgent jobs" ON urgent_jobs
    FOR ALL USING (EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    ));

COMMIT;

-- Лог окончания миграции
SELECT 'Production HoReCa schema migration completed successfully' AS status;