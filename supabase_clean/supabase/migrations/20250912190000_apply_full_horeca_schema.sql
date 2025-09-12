-- Применяем полную HoReCa схему из MANUAL_MIGRATION_COMBINED.sql
-- Быстрое применение всех недостающих полей и функций

-- Сначала удаляем таблицы чтобы пересоздать их с правильной структурой
DROP TABLE IF EXISTS public.job_postings CASCADE;
DROP TABLE IF EXISTS public.urgent_jobs CASCADE;
DROP TABLE IF EXISTS public.employers CASCADE;

-- Таблица работодателей (компаний)
CREATE TABLE public.employers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL,
  company_description text,
  company_type text CHECK (company_type IN ('restaurant', 'cafe', 'bar', 'hotel', 'catering', 'other')),
  website_url text,
  contact_email text,
  contact_phone text,
  address text,
  city_id decimal(4,1),
  logo_url text,
  is_verified boolean DEFAULT false,
  rating numeric(2,1) CHECK (rating >= 0 AND rating <= 5),
  reviews_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Создание основной таблицы вакансий
CREATE TABLE public.job_postings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Основная информация о вакансии
  title text NOT NULL,
  description text NOT NULL,
  
  -- Связи
  company_id uuid REFERENCES public.employers(id) ON DELETE CASCADE,
  creator_id uuid REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  city_id decimal(4,1), -- Ссылка на cities.id
  
  -- Категория и позиция (специфично для HoReCa)
  category text CHECK (category IN ('service', 'kitchen', 'management', 'cleaning', 'other')) NOT NULL,
  position_type text CHECK (position_type IN ('waiter', 'bartender', 'cook', 'chef', 'cashier', 'cleaner', 'manager', 'host', 'other')) NOT NULL,
  
  -- Условия работы
  employment_type text CHECK (employment_type IN ('full_time', 'part_time', 'temporary', 'internship')) DEFAULT 'full_time',
  schedule_type text CHECK (schedule_type IN ('fixed', 'flexible', 'shift', 'night', 'weekend')) DEFAULT 'shift',
  
  -- Зарплата
  salary_min integer,
  salary_max integer,
  salary_type text CHECK (salary_type IN ('hourly', 'daily', 'monthly')) DEFAULT 'monthly',
  currency text DEFAULT 'KZT',
  
  -- Требования
  min_age integer,
  max_age integer,
  experience_required text CHECK (experience_required IN ('none', 'any', '1year+', '3years+', '5years+')) DEFAULT 'none',
  education_required text CHECK (education_required IN ('none', 'secondary', 'vocational', 'higher')) DEFAULT 'none',
  
  -- Дополнительные требования и навыки
  required_skills text[], -- Массив требуемых навыков
  preferred_skills text[], -- Массив желательных навыков
  languages_required text[], -- Требуемые языки
  
  -- Льготы и условия
  benefits text[], -- Массив льгот (питание, форма, скидки и тд)
  work_conditions text, -- Условия труда (график, особенности)
  
  -- Локация
  address text NOT NULL,
  district text, -- Район города
  metro_station text, -- Ближайшая станция метро (для Алматы)
  
  -- Контактная информация
  contact_method text CHECK (contact_method IN ('application', 'phone', 'telegram', 'email')) DEFAULT 'application',
  contact_person text,
  contact_phone text,
  contact_telegram text,
  contact_email text,
  
  -- Статус и приоритет
  status text CHECK (status IN ('draft', 'active', 'paused', 'filled', 'expired')) DEFAULT 'active',
  is_urgent boolean DEFAULT false, -- Отличается от urgent_jobs - это просто приоритет
  is_featured boolean DEFAULT false, -- Рекламируемые вакансии
  
  -- Сроки
  application_deadline date,
  start_date date,
  
  -- Статистика
  views_count integer DEFAULT 0,
  applications_count integer DEFAULT 0,
  
  -- Временные метки
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Создаем таблицу срочных вакансий с упрощенной структурой
CREATE TABLE public.urgent_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Основная информация
  title text NOT NULL,
  description text NOT NULL,
  
  -- Связи
  company_id uuid REFERENCES public.employers(id) ON DELETE CASCADE,
  creator_id uuid REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  city_id decimal(4,1), -- Ссылка на cities.id
  
  -- Локация
  address text NOT NULL,
  district text,
  
  -- Тип работы (упрощенная схема для срочных)
  position_type text CHECK (position_type IN ('waiter', 'bartender', 'cook', 'cleaner', 'cashier', 'host', 'other')) NOT NULL,
  
  -- Время работы (критично для срочных)
  needed_date date NOT NULL,
  needed_time_start time NOT NULL,
  needed_time_end time NOT NULL,
  
  -- Оплата (всегда за смену для срочных)
  payment_per_shift integer NOT NULL,
  instant_payment boolean DEFAULT true,
  
  -- Требования (минимальные для скорости)
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
  
  -- Статус срочной вакансии
  status text CHECK (status IN ('active', 'filled', 'expired', 'cancelled')) DEFAULT 'active',
  
  -- Приоритет уведомлений
  priority text CHECK (priority IN ('low', 'normal', 'high', 'critical')) DEFAULT 'normal',
  
  -- Метаданные
  views_count integer DEFAULT 0,
  applications_count integer DEFAULT 0,
  
  -- Временные метки
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Индексы для оптимизации поиска job_postings
CREATE INDEX idx_job_postings_status_city ON public.job_postings(status, city_id) WHERE status = 'active';
CREATE INDEX idx_job_postings_category_position ON public.job_postings(category, position_type);
CREATE INDEX idx_job_postings_salary ON public.job_postings(salary_min, salary_max) WHERE salary_min IS NOT NULL;
CREATE INDEX idx_job_postings_created ON public.job_postings(created_at DESC);
CREATE INDEX idx_job_postings_urgent ON public.job_postings(is_urgent, created_at DESC) WHERE is_urgent = true;
CREATE INDEX idx_job_postings_skills ON public.job_postings USING gin(required_skills);

-- Индексы для быстрого поиска срочных вакансий
CREATE INDEX idx_urgent_jobs_active_deadline ON public.urgent_jobs(status, application_deadline) WHERE status = 'active';
CREATE INDEX idx_urgent_jobs_date_time ON public.urgent_jobs(needed_date, needed_time_start);
CREATE INDEX idx_urgent_jobs_city_position ON public.urgent_jobs(city_id, position_type);
CREATE INDEX idx_urgent_jobs_priority ON public.urgent_jobs(priority, created_at DESC);
CREATE INDEX idx_urgent_jobs_payment ON public.urgent_jobs(payment_per_shift DESC);

-- Включаем RLS (Row Level Security)
ALTER TABLE public.job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.urgent_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employers ENABLE ROW LEVEL SECURITY;

-- RLS политики для job_postings
-- Все могут читать активные вакансии
CREATE POLICY job_postings_select_active ON public.job_postings 
FOR SELECT USING (status = 'active');

-- Создатели могут видеть свои вакансии
CREATE POLICY job_postings_select_own ON public.job_postings 
FOR SELECT USING (creator_id = (SELECT id FROM public.user_profiles WHERE auth_user_id = auth.uid()));

-- Работодатели могут создавать вакансии
CREATE POLICY job_postings_insert_employers ON public.job_postings 
FOR INSERT WITH CHECK (
  creator_id = (SELECT id FROM public.user_profiles WHERE auth_user_id = auth.uid()) AND
  (SELECT role FROM public.user_profiles WHERE auth_user_id = auth.uid()) IN ('employer', 'admin')
);

-- Создатели могут редактировать свои вакансии
CREATE POLICY job_postings_update_own ON public.job_postings 
FOR UPDATE USING (creator_id = (SELECT id FROM public.user_profiles WHERE auth_user_id = auth.uid()));

-- Создатели могут удалять свои вакансии
CREATE POLICY job_postings_delete_own ON public.job_postings 
FOR DELETE USING (creator_id = (SELECT id FROM public.user_profiles WHERE auth_user_id = auth.uid()));

-- RLS политики для urgent_jobs
-- Все могут читать активные срочные вакансии
CREATE POLICY urgent_jobs_select_active ON public.urgent_jobs 
FOR SELECT USING (
  status = 'active' AND 
  application_deadline > now() AND
  positions_filled < positions_needed
);

-- Создатели могут видеть свои срочные вакансии
CREATE POLICY urgent_jobs_select_own ON public.urgent_jobs 
FOR SELECT USING (
  creator_id = (SELECT id FROM public.user_profiles WHERE auth_user_id = auth.uid())
);

-- Работодатели могут создавать срочные вакансии
CREATE POLICY urgent_jobs_insert_employers ON public.urgent_jobs 
FOR INSERT WITH CHECK (
  creator_id = (SELECT id FROM public.user_profiles WHERE auth_user_id = auth.uid()) AND
  (SELECT role FROM public.user_profiles WHERE auth_user_id = auth.uid()) IN ('employer', 'admin') AND
  application_deadline > now() AND
  needed_date >= CURRENT_DATE
);

-- Создатели могут редактировать свои срочные вакансии
CREATE POLICY urgent_jobs_update_own ON public.urgent_jobs 
FOR UPDATE USING (
  creator_id = (SELECT id FROM public.user_profiles WHERE auth_user_id = auth.uid())
);

-- Создатели могут удалять свои срочные вакансии
CREATE POLICY urgent_jobs_delete_own ON public.urgent_jobs 
FOR DELETE USING (
  creator_id = (SELECT id FROM public.user_profiles WHERE auth_user_id = auth.uid())
);

-- RLS политики для employers
CREATE POLICY employers_select_all ON public.employers FOR SELECT USING (true);
CREATE POLICY employers_insert_own ON public.employers FOR INSERT WITH CHECK (
  (SELECT role FROM public.user_profiles WHERE auth_user_id = auth.uid()) IN ('employer', 'admin')
);

-- Функция для обновления updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

-- Триггеры для обновления updated_at
CREATE TRIGGER set_updated_at_job_postings
  BEFORE UPDATE ON public.job_postings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_updated_at_urgent_jobs
  BEFORE UPDATE ON public.urgent_jobs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_updated_at_employers
  BEFORE UPDATE ON public.employers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Функция для автоматического закрытия просроченных срочных вакансий
CREATE OR REPLACE FUNCTION public.expire_urgent_jobs() RETURNS void AS $$
BEGIN
  UPDATE public.urgent_jobs 
  SET status = 'expired', updated_at = now()
  WHERE status = 'active' 
    AND (application_deadline < now() OR positions_filled >= positions_needed);
END; $$ LANGUAGE plpgsql;

-- Функция для автоматического заполнения позиций
CREATE OR REPLACE FUNCTION public.fill_urgent_position() RETURNS trigger AS $$
BEGIN
  IF NEW.positions_filled >= NEW.positions_needed THEN
    NEW.status = 'filled';
  END IF;
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

-- Триггер для автоматического заполнения
CREATE TRIGGER urgent_jobs_auto_fill
  BEFORE UPDATE ON public.urgent_jobs
  FOR EACH ROW 
  WHEN (NEW.positions_filled != OLD.positions_filled)
  EXECUTE FUNCTION public.fill_urgent_position();