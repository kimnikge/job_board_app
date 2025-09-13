-- Простая миграция без foreign key constraints
-- Создаем таблицы независимо друг от друга

-- Удаляем существующие таблицы
DROP TABLE IF EXISTS public.job_postings CASCADE;
DROP TABLE IF EXISTS public.urgent_jobs CASCADE;
DROP TABLE IF EXISTS public.employers CASCADE;

-- Таблица работодателей (без foreign keys)
CREATE TABLE public.employers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid, -- Просто uuid без constraint
  company_name text NOT NULL,
  company_description text,
  company_type text CHECK (company_type IN ('restaurant', 'cafe', 'bar', 'hotel', 'catering', 'other')),
  website_url text,
  contact_email text,
  contact_phone text,
  address text,
  city_id integer, -- Изменили на integer
  logo_url text,
  is_verified boolean DEFAULT false,
  rating numeric(2,1) CHECK (rating >= 0 AND rating <= 5),
  reviews_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Основная таблица вакансий (без foreign keys)
CREATE TABLE public.job_postings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Основная информация о вакансии
  title text NOT NULL,
  description text NOT NULL,
  
  -- Связи (просто ID без constraints)
  company_id uuid,
  creator_id uuid, 
  city_id integer,
  
  -- Категория и позиция (специфично для HoReCa)
  category text CHECK (category IN ('service', 'kitchen', 'management', 'cleaning', 'other')) NOT NULL DEFAULT 'service',
  position_type text CHECK (position_type IN ('waiter', 'bartender', 'cook', 'chef', 'cashier', 'cleaner', 'manager', 'host', 'other')) NOT NULL DEFAULT 'waiter',
  
  -- Условия работы
  employment_type text CHECK (employment_type IN ('full_time', 'part_time', 'temporary', 'internship')) DEFAULT 'full_time',
  schedule_type text CHECK (schedule_type IN ('fixed', 'flexible', 'shift', 'night', 'weekend')) DEFAULT 'shift',
  
  -- Зарплата
  salary_min integer,
  salary_max integer,
  salary_type text CHECK (salary_type IN ('hourly', 'daily', 'monthly')) DEFAULT 'monthly',
  salary_currency text DEFAULT 'KZT',
  
  -- Требования
  min_age integer,
  max_age integer,
  experience_required text CHECK (experience_required IN ('none', 'any', '1year+', '3years+', '5years+')) DEFAULT 'none',
  education_required text CHECK (education_required IN ('none', 'secondary', 'vocational', 'higher')) DEFAULT 'none',
  
  -- Дополнительные требования и навыки
  required_skills text[],
  preferred_skills text[],
  languages_required text[],
  
  -- Льготы и условия
  benefits text[],
  work_conditions text,
  
  -- Локация
  address text,
  district text,
  metro_station text,
  
  -- Контактная информация
  contact_method text CHECK (contact_method IN ('application', 'phone', 'telegram', 'email')) DEFAULT 'application',
  contact_person text,
  contact_phone text,
  contact_telegram text,
  contact_email text,
  
  -- Статус и приоритет
  status text CHECK (status IN ('draft', 'active', 'paused', 'filled', 'expired')) DEFAULT 'active',
  is_urgent boolean DEFAULT false,
  is_featured boolean DEFAULT false,
  is_active boolean DEFAULT true,
  
  -- Сроки
  application_deadline date,
  start_date date,
  expires_at timestamptz,
  
  -- Статистика
  views_count integer DEFAULT 0,
  applications_count integer DEFAULT 0,
  
  -- Временные метки
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Таблица срочных вакансий (без foreign keys)
CREATE TABLE public.urgent_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Основная информация
  title text NOT NULL,
  description text,
  
  -- Связи (просто ID без constraints)
  company_id uuid,
  creator_id uuid,
  city_id integer,
  
  -- Локация
  address text NOT NULL,
  district text,
  
  -- Тип работы
  position_type text CHECK (position_type IN ('waiter', 'bartender', 'cook', 'cleaner', 'cashier', 'host', 'other')) NOT NULL,
  
  -- Время работы
  needed_date date NOT NULL,
  needed_time_start time NOT NULL,
  needed_time_end time NOT NULL,
  
  -- Оплата
  payment_per_shift integer NOT NULL,
  payment_currency text DEFAULT 'KZT',
  instant_payment boolean DEFAULT true,
  
  -- Требования
  min_age integer,
  experience_required text CHECK (experience_required IN ('none', 'any', '1year+')) DEFAULT 'none',
  
  -- Срочность и дедлайны
  application_deadline timestamptz NOT NULL,
  positions_needed integer DEFAULT 1,
  positions_filled integer DEFAULT 0,
  
  -- Контакты для быстрой связи
  contact_method text CHECK (contact_method IN ('telegram', 'phone', 'both')) DEFAULT 'telegram',
  contact_telegram text,
  contact_phone text,
  contact_person text,
  
  -- Статус срочной вакансии
  status text CHECK (status IN ('active', 'filled', 'expired', 'cancelled')) DEFAULT 'active',
  urgency_level integer DEFAULT 1,
  
  -- Приоритет уведомлений
  priority text CHECK (priority IN ('low', 'normal', 'high', 'critical')) DEFAULT 'normal',
  
  -- Метаданные
  views_count integer DEFAULT 0,
  applications_count integer DEFAULT 0,
  is_active boolean DEFAULT true,
  
  -- Временные метки
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Создаем индексы
CREATE INDEX idx_job_postings_status ON public.job_postings(status);
CREATE INDEX idx_job_postings_city ON public.job_postings(city_id);
CREATE INDEX idx_job_postings_category ON public.job_postings(category, position_type);
CREATE INDEX idx_job_postings_active ON public.job_postings(is_active);
CREATE INDEX idx_job_postings_created ON public.job_postings(created_at DESC);

CREATE INDEX idx_urgent_jobs_status ON public.urgent_jobs(status);
CREATE INDEX idx_urgent_jobs_city ON public.urgent_jobs(city_id);
CREATE INDEX idx_urgent_jobs_date ON public.urgent_jobs(needed_date);
CREATE INDEX idx_urgent_jobs_active ON public.urgent_jobs(is_active);

CREATE INDEX idx_employers_user ON public.employers(user_id);

-- Включаем RLS
ALTER TABLE public.job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.urgent_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employers ENABLE ROW LEVEL SECURITY;

-- Простые RLS политики (без сложных связей)
-- Все могут читать активные вакансии
CREATE POLICY job_postings_select_all ON public.job_postings 
FOR SELECT USING (is_active = true);

CREATE POLICY urgent_jobs_select_all ON public.urgent_jobs 
FOR SELECT USING (is_active = true);

CREATE POLICY employers_select_all ON public.employers 
FOR SELECT USING (true);

-- Аутентифицированные пользователи могут создавать
CREATE POLICY job_postings_insert_auth ON public.job_postings 
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY urgent_jobs_insert_auth ON public.urgent_jobs 
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY employers_insert_auth ON public.employers 
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Функция для обновления updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Триггеры для автообновления updated_at
CREATE TRIGGER update_job_postings_updated_at 
    BEFORE UPDATE ON public.job_postings 
    FOR EACH ROW 
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_urgent_jobs_updated_at 
    BEFORE UPDATE ON public.urgent_jobs 
    FOR EACH ROW 
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_employers_updated_at 
    BEFORE UPDATE ON public.employers 
    FOR EACH ROW 
    EXECUTE FUNCTION public.update_updated_at_column();