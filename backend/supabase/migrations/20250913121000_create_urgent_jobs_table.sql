-- 20250913121000_create_urgent_jobs_table.sql
-- Создание специальной таблицы для срочных вакансий (уникальная фишка платформы)

-- Создаем таблицу срочных вакансий с упрощенной структурой
CREATE TABLE IF NOT EXISTS public.urgent_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Основная информация
  title text NOT NULL,
  description text NOT NULL,
  
  -- Связи
  company_id uuid REFERENCES public.employers(id) ON DELETE CASCADE,
  creator_id uuid REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  city_id decimal(4,1) REFERENCES public.cities(id),
  
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

-- Индексы для быстрого поиска срочных вакансий
CREATE INDEX idx_urgent_jobs_active_deadline ON public.urgent_jobs(status, application_deadline) WHERE status = 'active';
CREATE INDEX idx_urgent_jobs_date_time ON public.urgent_jobs(needed_date, needed_time_start);
CREATE INDEX idx_urgent_jobs_city_position ON public.urgent_jobs(city_id, position_type);
CREATE INDEX idx_urgent_jobs_priority ON public.urgent_jobs(priority, created_at DESC);
CREATE INDEX idx_urgent_jobs_payment ON public.urgent_jobs(payment_per_shift DESC);

-- Включаем RLS
ALTER TABLE public.urgent_jobs ENABLE ROW LEVEL SECURITY;

-- RLS политики

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

-- Триггеры

-- Обновление updated_at
CREATE TRIGGER set_updated_at_urgent_jobs
  BEFORE UPDATE ON public.urgent_jobs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Автоматическое закрытие просроченных срочных вакансий
CREATE OR REPLACE FUNCTION public.expire_urgent_jobs() RETURNS trigger AS $$
BEGIN
  -- Закрываем просроченные вакансии
  UPDATE public.urgent_jobs 
  SET status = 'expired', updated_at = now()
  WHERE status = 'active' 
    AND application_deadline < now();
  
  RETURN NULL;
END; $$ LANGUAGE plpgsql;

-- Создаем триггер для периодической проверки (можно вызывать через cron)
CREATE OR REPLACE FUNCTION public.check_urgent_jobs_expiry() RETURNS void AS $$
BEGIN
  UPDATE public.urgent_jobs 
  SET status = 'expired', updated_at = now()
  WHERE status = 'active' 
    AND (application_deadline < now() OR positions_filled >= positions_needed);
END; $$ LANGUAGE plpgsql;

-- Функция для автоматического заполнения позиций
CREATE OR REPLACE FUNCTION public.fill_urgent_position() RETURNS trigger AS $$
BEGIN
  -- Если все позиции заполнены, меняем статус
  IF NEW.positions_filled >= NEW.positions_needed THEN
    NEW.status = 'filled';
  END IF;
  
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

CREATE TRIGGER urgent_jobs_auto_fill
  BEFORE UPDATE ON public.urgent_jobs
  FOR EACH ROW 
  WHEN (NEW.positions_filled != OLD.positions_filled)
  EXECUTE FUNCTION public.fill_urgent_position();

-- Комментарии
COMMENT ON TABLE public.urgent_jobs IS 'Срочные вакансии - уникальная фишка платформы для мгновенного поиска персонала';
COMMENT ON COLUMN public.urgent_jobs.needed_date IS 'Дата когда нужен сотрудник';
COMMENT ON COLUMN public.urgent_jobs.needed_time_start IS 'Время начала смены';
COMMENT ON COLUMN public.urgent_jobs.application_deadline IS 'Крайний срок подачи заявок (обычно за 1-2 часа до смены)';
COMMENT ON COLUMN public.urgent_jobs.instant_payment IS 'Оплата сразу после смены';
COMMENT ON COLUMN public.urgent_jobs.positions_needed IS 'Сколько человек нужно';
COMMENT ON COLUMN public.urgent_jobs.positions_filled IS 'Сколько уже нашли';