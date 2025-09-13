-- ПОЛНЫЙ СБРОС к чистой HoReCa схеме
-- ⚠️  ВНИМАНИЕ: ВСЕ СУЩЕСТВУЮЩИЕ ДАННЫЕ БУДУТ УДАЛЕНЫ!
-- Использовать только если продакшн база пустая или данные не критичны

BEGIN;

-- ====================================================================
-- ЭТАП 1: ПОЛНАЯ ОЧИСТКА СУЩЕСТВУЮЩИХ ТАБЛИЦ
-- ====================================================================

-- Отключаем RLS для удаления
ALTER TABLE IF EXISTS user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS job_postings DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS urgent_jobs DISABLE ROW LEVEL SECURITY;

-- Удаляем все старые таблицы и их зависимости
DROP TABLE IF EXISTS urgent_jobs CASCADE;
DROP TABLE IF EXISTS job_postings CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS companies CASCADE;
DROP TABLE IF EXISTS specializations CASCADE;
DROP VIEW IF EXISTS profiles CASCADE;

-- Удаляем старые последовательности
DROP SEQUENCE IF EXISTS job_postings_id_seq CASCADE;
DROP SEQUENCE IF EXISTS urgent_jobs_id_seq CASCADE;
DROP SEQUENCE IF EXISTS user_profiles_id_seq CASCADE;

-- ====================================================================
-- ЭТАП 2: СОЗДАНИЕ ЧИСТОЙ HoReCa СХЕМЫ
-- ====================================================================

-- Таблица профилей пользователей
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    telegram_id BIGINT UNIQUE,
    full_name TEXT,
    username TEXT,
    phone TEXT,
    role TEXT DEFAULT 'candidate' CHECK (role IN ('candidate', 'employer', 'admin')),
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
    location TEXT,
    contact_person TEXT,
    contact_phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (id)
);

-- Таблица обычных вакансий HoReCa
CREATE TABLE job_postings (
    id UUID DEFAULT gen_random_uuid(),
    employer_id UUID REFERENCES employers(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'service' CHECK (category IN ('service', 'kitchen', 'management', 'cleaning', 'other')),
    position_type TEXT DEFAULT 'waiter' CHECK (position_type IN ('waiter', 'bartender', 'cook', 'chef', 'cashier', 'cleaner', 'manager', 'host', 'other')),
    salary_min INTEGER,
    salary_max INTEGER,
    salary_type TEXT DEFAULT 'monthly' CHECK (salary_type IN ('hourly', 'daily', 'monthly')),
    employment_type TEXT DEFAULT 'full_time' CHECK (employment_type IN ('full_time', 'part_time', 'temporary', 'internship')),
    schedule_type TEXT DEFAULT 'fixed' CHECK (schedule_type IN ('fixed', 'flexible', 'shift', 'night', 'weekend')),
    experience_required TEXT DEFAULT 'none' CHECK (experience_required IN ('none', 'any', '1year+', '3years+', '5years+')),
    required_skills TEXT[] DEFAULT '{}',
    benefits TEXT[] DEFAULT '{}',
    location TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'paused', 'filled', 'expired')),
    contact_phone TEXT,
    positions_total INTEGER DEFAULT 1,
    positions_filled INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (id)
);

-- Таблица срочных вакансий
CREATE TABLE urgent_jobs (
    id UUID DEFAULT gen_random_uuid(),
    employer_id UUID REFERENCES employers(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    category TEXT DEFAULT 'service' CHECK (category IN ('service', 'kitchen', 'management', 'cleaning', 'other')),
    position_type TEXT DEFAULT 'waiter' CHECK (position_type IN ('waiter', 'bartender', 'cook', 'chef', 'cashier', 'cleaner', 'manager', 'host', 'other')),
    needed_date DATE NOT NULL,
    needed_time_start TIME,
    needed_time_end TIME,
    payment_per_shift INTEGER CHECK (payment_per_shift > 0),
    location TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'filled', 'expired', 'cancelled')),
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'critical')),
    positions_needed INTEGER DEFAULT 1 CHECK (positions_needed > 0),
    positions_filled INTEGER DEFAULT 0,
    required_skills TEXT[] DEFAULT '{}',
    instant_payment BOOLEAN DEFAULT false,
    contact_phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (id)
);

-- ====================================================================
-- ЭТАП 3: ИНДЕКСЫ ДЛЯ ПРОИЗВОДИТЕЛЬНОСТИ
-- ====================================================================

-- Индексы для job_postings
CREATE INDEX idx_job_postings_category ON job_postings(category);
CREATE INDEX idx_job_postings_position_type ON job_postings(position_type);
CREATE INDEX idx_job_postings_status ON job_postings(status);
CREATE INDEX idx_job_postings_employer ON job_postings(employer_id);

-- Индексы для urgent_jobs
CREATE INDEX idx_urgent_jobs_category ON urgent_jobs(category);
CREATE INDEX idx_urgent_jobs_status ON urgent_jobs(status);
CREATE INDEX idx_urgent_jobs_priority ON urgent_jobs(priority);
CREATE INDEX idx_urgent_jobs_needed_date ON urgent_jobs(needed_date);

-- Индексы для employers и profiles
CREATE INDEX idx_employers_user_id ON employers(user_id);
CREATE INDEX idx_profiles_telegram_id ON profiles(telegram_id);
CREATE INDEX idx_profiles_role ON profiles(role);

-- ====================================================================
-- ЭТАП 4: RLS ПОЛИТИКИ И ТРИГГЕРЫ
-- ====================================================================

-- Включаем RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE employers ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE urgent_jobs ENABLE ROW LEVEL SECURITY;

-- RLS политики
CREATE POLICY "Public can view profiles" ON profiles FOR SELECT TO public USING (true);
CREATE POLICY "Users can edit own profile" ON profiles FOR ALL USING (auth.uid() = id);

CREATE POLICY "Public can view employers" ON employers FOR SELECT TO public USING (true);
CREATE POLICY "Users can manage their employer profile" ON employers FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Public can view active jobs" ON job_postings FOR SELECT TO public USING (status = 'active');
CREATE POLICY "Employers can manage their jobs" ON job_postings FOR ALL USING (
    employer_id IN (SELECT id FROM employers WHERE user_id = auth.uid())
);

CREATE POLICY "Public can view active urgent jobs" ON urgent_jobs FOR SELECT TO public USING (status = 'active');
CREATE POLICY "Employers can manage their urgent jobs" ON urgent_jobs FOR ALL USING (
    employer_id IN (SELECT id FROM employers WHERE user_id = auth.uid())
);

-- Функция для updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Триггеры для автообновления
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employers_updated_at BEFORE UPDATE ON employers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_job_postings_updated_at BEFORE UPDATE ON job_postings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_urgent_jobs_updated_at BEFORE UPDATE ON urgent_jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMIT;

-- Успех!
SELECT 'Clean HoReCa schema deployed to production! 🚀🍽️' AS status;