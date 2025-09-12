-- 20250913120000_create_job_postings_table.sql
-- Создание основной таблицы вакансий для HoReCa индустрии

-- Создаем основную таблицу вакансий
CREATE TABLE IF NOT EXISTS public.job_postings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Основная информация о вакансии
  title text NOT NULL,
  description text NOT NULL,
  
  -- Связи с другими таблицами
  company_id uuid REFERENCES public.employers(id) ON DELETE CASCADE,
  creator_id uuid REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  city_id decimal(4,1) REFERENCES public.cities(id),
  
  -- Локация и контакты
  address text,
  district text,
  contact_phone text,
  contact_telegram text,
  
  -- Условия работы
  position_category text CHECK (position_category IN ('kitchen', 'service', 'bar', 'admin', 'cleaning', 'security', 'management', 'other')) DEFAULT 'other',
  employment_type text CHECK (employment_type IN ('full-time', 'part-time', 'contract', 'temporary', 'internship')) DEFAULT 'full-time',
  schedule_type text CHECK (schedule_type IN ('day', 'evening', 'night', 'shift', 'flexible', 'weekend-only')) DEFAULT 'day',
  
  -- Оплата
  salary_min integer,
  salary_max integer,
  salary_currency text DEFAULT 'KZT',
  salary_period text CHECK (salary_period IN ('hour', 'day', 'week', 'month')) DEFAULT 'month',
  
  -- Требования
  experience_required text CHECK (experience_required IN ('none', 'junior', 'middle', 'senior')) DEFAULT 'none',
  age_min integer,
  age_max integer,
  education_required text,
  languages_required text[],
  skills_required text[],
  
  -- Дополнительные условия
  benefits text[],
  has_accommodation boolean DEFAULT false,
  has_meals boolean DEFAULT false,
  has_transport boolean DEFAULT false,
  
  -- Срочность и статус
  is_urgent boolean DEFAULT false,
  urgent_deadline timestamptz,
  
  -- Статус публикации
  status text CHECK (status IN ('draft', 'active', 'paused', 'expired', 'closed')) DEFAULT 'draft',
  
  -- Метаданные
  views_count integer DEFAULT 0,
  applications_count integer DEFAULT 0,
  
  -- Временные метки
  published_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Индексы для оптимизации запросов
CREATE INDEX idx_job_postings_status_published ON public.job_postings(status, published_at DESC) WHERE status = 'active';
CREATE INDEX idx_job_postings_city_category ON public.job_postings(city_id, position_category);
CREATE INDEX idx_job_postings_salary ON public.job_postings(salary_min, salary_max) WHERE salary_min IS NOT NULL;
CREATE INDEX idx_job_postings_urgent ON public.job_postings(is_urgent, urgent_deadline) WHERE is_urgent = true;
CREATE INDEX idx_job_postings_company ON public.job_postings(company_id);
CREATE INDEX idx_job_postings_creator ON public.job_postings(creator_id);

-- Включаем RLS
ALTER TABLE public.job_postings ENABLE ROW LEVEL SECURITY;

-- RLS политики

-- Все могут читать активные вакансии
CREATE POLICY job_postings_select_active ON public.job_postings 
FOR SELECT USING (status = 'active' AND published_at IS NOT NULL);

-- Создатели могут видеть свои вакансии
CREATE POLICY job_postings_select_own ON public.job_postings 
FOR SELECT USING (
  creator_id = (SELECT id FROM public.user_profiles WHERE auth_user_id = auth.uid())
);

-- Создатели могут создавать вакансии (если у них роль employer)
CREATE POLICY job_postings_insert_employers ON public.job_postings 
FOR INSERT WITH CHECK (
  creator_id = (SELECT id FROM public.user_profiles WHERE auth_user_id = auth.uid()) AND
  (SELECT role FROM public.user_profiles WHERE auth_user_id = auth.uid()) IN ('employer', 'admin')
);

-- Создатели могут редактировать свои вакансии
CREATE POLICY job_postings_update_own ON public.job_postings 
FOR UPDATE USING (
  creator_id = (SELECT id FROM public.user_profiles WHERE auth_user_id = auth.uid())
);

-- Создатели могут удалять свои вакансии
CREATE POLICY job_postings_delete_own ON public.job_postings 
FOR DELETE USING (
  creator_id = (SELECT id FROM public.user_profiles WHERE auth_user_id = auth.uid())
);

-- Триггер для обновления updated_at
CREATE TRIGGER set_updated_at_job_postings
  BEFORE UPDATE ON public.job_postings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Триггер для автоматической установки published_at при смене статуса на active
CREATE OR REPLACE FUNCTION public.set_published_at() RETURNS trigger AS $$
BEGIN
  IF NEW.status = 'active' AND OLD.status != 'active' AND NEW.published_at IS NULL THEN
    NEW.published_at = now();
  END IF;
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

CREATE TRIGGER job_postings_set_published_at
  BEFORE UPDATE ON public.job_postings
  FOR EACH ROW EXECUTE FUNCTION public.set_published_at();

-- Комментарии к таблице
COMMENT ON TABLE public.job_postings IS 'Основная таблица вакансий для HoReCa индустрии';
COMMENT ON COLUMN public.job_postings.position_category IS 'Категория позиции: кухня, зал, бар, админ и т.д.';
COMMENT ON COLUMN public.job_postings.is_urgent IS 'Флаг срочной вакансии для быстрого отклика';
COMMENT ON COLUMN public.job_postings.urgent_deadline IS 'Крайний срок для срочных вакансий';