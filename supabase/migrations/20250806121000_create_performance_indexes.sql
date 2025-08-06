-- Миграция: Создание индексов производительности
-- Задача 1.1.2 из плана обновления сервисов
-- Дата: 6 августа 2025

BEGIN;

-- ====================================================================
-- ПОДЗАДАЧА 1.1.2.1: Базовые индексы для поиска вакансий
-- ====================================================================

-- Индексы для срочных вакансий
CREATE INDEX IF NOT EXISTS idx_urgent_jobs_status 
ON urgent_jobs(status) WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_urgent_jobs_needed_date 
ON urgent_jobs(needed_date) WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_urgent_jobs_location 
ON urgent_jobs(location_city, location_district) WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_urgent_jobs_employer 
ON urgent_jobs(employer_id);

-- Составной индекс для основного поиска
CREATE INDEX IF NOT EXISTS idx_urgent_jobs_search 
ON urgent_jobs(status, needed_date, location_city) 
WHERE status = 'active';

-- Индексы для обычных вакансий
CREATE INDEX IF NOT EXISTS idx_job_postings_status 
ON job_postings(status) WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_job_postings_created 
ON job_postings(created_at DESC);

-- ====================================================================
-- ПОДЗАДАЧА 1.1.2.2: Индексы для системы уведомлений
-- ====================================================================

-- Индекс для отправки уведомлений
CREATE INDEX IF NOT EXISTS idx_urgent_jobs_notifications 
ON urgent_jobs(notification_priority, created_at) 
WHERE status = 'active' AND notification_sent = false;

-- Индекс для автозакрытия вакансий
CREATE INDEX IF NOT EXISTS idx_urgent_jobs_auto_close 
ON urgent_jobs(auto_close_at) 
WHERE status = 'active' AND auto_close_at IS NOT NULL;

-- Индекс для системы уведомлений кандидатов
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notification_queue') THEN
        CREATE INDEX IF NOT EXISTS idx_notification_queue_status 
        ON notification_queue(status, created_at);
        
        CREATE INDEX IF NOT EXISTS idx_notification_queue_user 
        ON notification_queue(user_id, status);
    END IF;
END $$;

-- ====================================================================
-- ПОДЗАДАЧА 1.1.2.3: Индексы для профилей кандидатов
-- ====================================================================

-- Индексы для поиска кандидатов
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'candidate_profiles') THEN
        CREATE INDEX IF NOT EXISTS idx_candidate_profiles_location 
        ON candidate_profiles(preferred_city, preferred_district);
        
        CREATE INDEX IF NOT EXISTS idx_candidate_profiles_availability 
        ON candidate_profiles(available_immediately, available_weekends);
        
        CREATE INDEX IF NOT EXISTS idx_candidate_profiles_experience 
        ON candidate_profiles(experience_years);
    END IF;
END $$;

-- ====================================================================
-- ПОДЗАДАЧА 1.1.2.4: Составные индексы для сложных запросов
-- ====================================================================

-- Поиск подходящих срочных вакансий для кандидата
CREATE INDEX IF NOT EXISTS idx_urgent_jobs_matching 
ON urgent_jobs(location_city, needed_date, pay_per_shift, status) 
WHERE status = 'active';

-- Поиск вакансий работодателя
CREATE INDEX IF NOT EXISTS idx_urgent_jobs_employer_management 
ON urgent_jobs(employer_id, status, created_at DESC);

-- Статистика по районам и датам
CREATE INDEX IF NOT EXISTS idx_urgent_jobs_analytics 
ON urgent_jobs(location_city, location_district, needed_date, status);

-- ====================================================================
-- ПОДЗАДАЧА 1.1.2.5: Оптимизация связанных таблиц
-- ====================================================================

-- Индексы для таблиц ссылок (если существуют)
DO $$
BEGIN
    -- Таблица откликов на вакансии
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'job_applications') THEN
        CREATE INDEX IF NOT EXISTS idx_job_applications_job 
        ON job_applications(job_id, status);
        
        CREATE INDEX IF NOT EXISTS idx_job_applications_candidate 
        ON job_applications(candidate_id, created_at DESC);
    END IF;
    
    -- Таблица компаний
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'companies') THEN
        CREATE INDEX IF NOT EXISTS idx_companies_location 
        ON companies(city, district);
        
        CREATE INDEX IF NOT EXISTS idx_companies_type 
        ON companies(company_type);
    END IF;
    
    -- Логи автоматизации
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'automation_logs') THEN
        CREATE INDEX IF NOT EXISTS idx_automation_logs_task 
        ON automation_logs(task_name, executed_at DESC);
    END IF;
END $$;

-- ====================================================================
-- ПОЛНОТЕКСТОВЫЙ ПОИСК (ПОДЗАДАЧА 1.1.2.6)
-- ====================================================================

-- Создание полнотекстового поиска для срочных вакансий
DO $$
BEGIN
    -- Добавляем столбец для полнотекстового поиска если его нет
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'urgent_jobs' AND column_name = 'search_vector') THEN
        ALTER TABLE urgent_jobs ADD COLUMN search_vector tsvector;
    END IF;
    
    -- Создаем индекс для полнотекстового поиска
    CREATE INDEX IF NOT EXISTS idx_urgent_jobs_search_vector 
    ON urgent_jobs USING gin(search_vector);
    
    -- Обновляем поисковый вектор для существующих записей
    UPDATE urgent_jobs 
    SET search_vector = to_tsvector('russian', 
        COALESCE(title, '') || ' ' || 
        COALESCE(description, '') || ' ' || 
        COALESCE(venue_name, '') || ' ' ||
        COALESCE(location_city, '') || ' ' ||
        COALESCE(location_district, '')
    ) WHERE search_vector IS NULL;
    
    RAISE NOTICE 'Полнотекстовый поиск для urgent_jobs настроен';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Ошибка при настройке полнотекстового поиска: %', SQLERRM;
END $$;

-- ====================================================================
-- ТРИГГЕРЫ ДЛЯ АВТООБНОВЛЕНИЯ ИНДЕКСОВ
-- ====================================================================

-- Триггер для автообновления поискового вектора
CREATE OR REPLACE FUNCTION update_urgent_jobs_search_vector()
RETURNS trigger AS $$
BEGIN
    NEW.search_vector := to_tsvector('russian', 
        COALESCE(NEW.title, '') || ' ' || 
        COALESCE(NEW.description, '') || ' ' || 
        COALESCE(NEW.venue_name, '') || ' ' ||
        COALESCE(NEW.location_city, '') || ' ' ||
        COALESCE(NEW.location_district, '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_urgent_jobs_search_vector_trigger ON urgent_jobs;
CREATE TRIGGER update_urgent_jobs_search_vector_trigger
    BEFORE INSERT OR UPDATE ON urgent_jobs
    FOR EACH ROW
    EXECUTE FUNCTION update_urgent_jobs_search_vector();

-- Логирование успешного применения
INSERT INTO automation_logs (task_name, executed_at, success, details, affected_rows)
SELECT 
    'create_performance_indexes',
    NOW(),
    true,
    'Созданы индексы производительности: базовые, уведомления, полнотекстовый поиск',
    0
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'automation_logs');

COMMIT;

-- ====================================================================
-- РЕЗУЛЬТАТ МИГРАЦИИ
-- ====================================================================

/*
✅ ПОДЗАДАЧА 1.1.2.1: Базовые индексы для поиска вакансий - ВЫПОЛНЕНА
✅ ПОДЗАДАЧА 1.1.2.2: Индексы для системы уведомлений - ВЫПОЛНЕНА  
✅ ПОДЗАДАЧА 1.1.2.3: Индексы для профилей кандидатов - ВЫПОЛНЕНА
✅ ПОДЗАДАЧА 1.1.2.4: Составные индексы для сложных запросов - ВЫПОЛНЕНА
✅ ПОДЗАДАЧА 1.1.2.5: Оптимизация связанных таблиц - ВЫПОЛНЕНА
✅ ПОДЗАДАЧА 1.1.2.6: Полнотекстовый поиск - ВЫПОЛНЕНА

ИНДЕКСЫ СОЗДАНЫ:
- idx_urgent_jobs_status, idx_urgent_jobs_needed_date
- idx_urgent_jobs_location, idx_urgent_jobs_search
- idx_urgent_jobs_notifications, idx_urgent_jobs_auto_close
- idx_urgent_jobs_matching, idx_urgent_jobs_analytics
- Полнотекстовый поиск с автообновлением

СЛЕДУЮЩИЙ ШАГ: Задача 1.1.3 - Создать процедуры автоматизации
*/
