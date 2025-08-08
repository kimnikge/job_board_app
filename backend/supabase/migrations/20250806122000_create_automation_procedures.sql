-- Миграция: Создание процедур автоматизации
-- Задача 1.1.3 из плана обновления сервисов
-- Дата: 6 августа 2025

BEGIN;

-- ====================================================================
-- ПОДЗАДАЧА 1.1.3.1: Процедура автозакрытия просроченных вакансий
-- ====================================================================

CREATE OR REPLACE FUNCTION auto_close_expired_urgent_jobs()
RETURNS TABLE(closed_count integer, details text) 
AS $$
DECLARE
    closed_jobs integer := 0;
    result_text text;
BEGIN
    -- Закрываем просроченные срочные вакансии
    WITH updated_jobs AS (
        UPDATE urgent_jobs 
        SET status = 'expired',
            updated_at = NOW()
        WHERE status = 'active' 
        AND (
            needed_date < CURRENT_DATE 
            OR (auto_close_at IS NOT NULL AND auto_close_at <= NOW())
        )
        RETURNING id, title, venue_name
    )
    SELECT COUNT(*) INTO closed_jobs FROM updated_jobs;
    
    result_text := format('Автоматически закрыто %s просроченных срочных вакансий', closed_jobs);
    
    -- Логируем операцию
    INSERT INTO automation_logs (task_name, executed_at, success, details, affected_rows)
    VALUES ('auto_close_expired_jobs', NOW(), true, result_text, closed_jobs);
    
    RETURN QUERY SELECT closed_jobs, result_text;
    
EXCEPTION
    WHEN OTHERS THEN
        INSERT INTO automation_logs (task_name, executed_at, success, details, affected_rows)
        VALUES ('auto_close_expired_jobs', NOW(), false, SQLERRM, 0);
        
        RETURN QUERY SELECT 0, format('Ошибка: %s', SQLERRM);
END;
$$ LANGUAGE plpgsql;

-- ====================================================================
-- ПОДЗАДАЧА 1.1.3.2: Процедура отправки уведомлений
-- ====================================================================

CREATE OR REPLACE FUNCTION process_urgent_job_notifications()
RETURNS TABLE(processed_count integer, details text)
AS $$
DECLARE
    notification_count integer := 0;
    result_text text;
BEGIN
    -- Создаем уведомления для новых срочных вакансий
    WITH new_notifications AS (
        INSERT INTO notification_queue (
            user_id, 
            message_type, 
            title, 
            content, 
            urgent_job_id,
            priority,
            created_at,
            status
        )
        SELECT 
            cp.user_id,
            'urgent_job_match',
            format('Срочная вакансия: %s', uj.title),
            format('Требуется %s в %s. Оплата: %s %s за смену. Дата: %s', 
                   uj.title, uj.venue_name, uj.pay_per_shift, uj.currency, uj.needed_date),
            uj.id,
            uj.notification_priority,
            NOW(),
            'pending'
        FROM urgent_jobs uj
        CROSS JOIN candidate_profiles cp
        WHERE uj.status = 'active' 
        AND uj.notification_sent = false
        AND uj.needed_date >= CURRENT_DATE
        AND (
            cp.preferred_city IS NULL 
            OR cp.preferred_city = uj.location_city
        )
        AND (
            cp.available_immediately = true
            OR uj.needed_date > CURRENT_DATE
        )
        RETURNING id
    )
    SELECT COUNT(*) INTO notification_count FROM new_notifications;
    
    -- Помечаем вакансии как отправленные
    UPDATE urgent_jobs 
    SET notification_sent = true, updated_at = NOW()
    WHERE status = 'active' 
    AND notification_sent = false
    AND needed_date >= CURRENT_DATE;
    
    result_text := format('Создано %s уведомлений для срочных вакансий', notification_count);
    
    -- Логируем операцию
    INSERT INTO automation_logs (task_name, executed_at, success, details, affected_rows)
    VALUES ('process_urgent_notifications', NOW(), true, result_text, notification_count);
    
    RETURN QUERY SELECT notification_count, result_text;
    
EXCEPTION
    WHEN OTHERS THEN
        INSERT INTO automation_logs (task_name, executed_at, success, details, affected_rows)
        VALUES ('process_urgent_notifications', NOW(), false, SQLERRM, 0);
        
        RETURN QUERY SELECT 0, format('Ошибка: %s', SQLERRM);
END;
$$ LANGUAGE plpgsql;

-- ====================================================================
-- ПОДЗАДАЧА 1.1.3.3: Процедура очистки старых данных
-- ====================================================================

CREATE OR REPLACE FUNCTION cleanup_old_data(days_to_keep integer DEFAULT 30)
RETURNS TABLE(cleaned_count integer, details text)
AS $$
DECLARE
    total_cleaned integer := 0;
    jobs_cleaned integer := 0;
    notifications_cleaned integer := 0;
    logs_cleaned integer := 0;
    cutoff_date date;
    result_text text;
BEGIN
    cutoff_date := CURRENT_DATE - days_to_keep;
    
    -- Очищаем старые завершенные срочные вакансии
    DELETE FROM urgent_jobs 
    WHERE status IN ('filled', 'expired', 'cancelled')
    AND updated_at < cutoff_date;
    GET DIAGNOSTICS jobs_cleaned = ROW_COUNT;
    
    -- Очищаем старые обработанные уведомления
    DELETE FROM notification_queue 
    WHERE status IN ('sent', 'failed')
    AND created_at < cutoff_date;
    GET DIAGNOSTICS notifications_cleaned = ROW_COUNT;
    
    -- Очищаем старые логи (кроме важных ошибок)
    DELETE FROM automation_logs 
    WHERE executed_at < cutoff_date
    AND success = true;
    GET DIAGNOSTICS logs_cleaned = ROW_COUNT;
    
    total_cleaned := jobs_cleaned + notifications_cleaned + logs_cleaned;
    result_text := format('Очищено: %s вакансий, %s уведомлений, %s логов за %s дней', 
                         jobs_cleaned, notifications_cleaned, logs_cleaned, days_to_keep);
    
    -- Логируем операцию
    INSERT INTO automation_logs (task_name, executed_at, success, details, affected_rows)
    VALUES ('cleanup_old_data', NOW(), true, result_text, total_cleaned);
    
    RETURN QUERY SELECT total_cleaned, result_text;
    
EXCEPTION
    WHEN OTHERS THEN
        INSERT INTO automation_logs (task_name, executed_at, success, details, affected_rows)
        VALUES ('cleanup_old_data', NOW(), false, SQLERRM, 0);
        
        RETURN QUERY SELECT 0, format('Ошибка: %s', SQLERRM);
END;
$$ LANGUAGE plpgsql;

-- ====================================================================
-- ПОДЗАДАЧА 1.1.3.4: Процедура обновления статистики
-- ====================================================================

CREATE OR REPLACE FUNCTION update_job_statistics()
RETURNS TABLE(stats_updated boolean, details text)
AS $$
DECLARE
    active_urgent_jobs integer;
    filled_today integer;
    avg_response_time interval;
    result_text text;
BEGIN
    -- Собираем статистику по срочным вакансиям
    SELECT COUNT(*) INTO active_urgent_jobs
    FROM urgent_jobs 
    WHERE status = 'active' AND needed_date >= CURRENT_DATE;
    
    SELECT COUNT(*) INTO filled_today
    FROM urgent_jobs 
    WHERE status = 'filled' 
    AND updated_at::date = CURRENT_DATE;
    
    -- Средний времени отклика (если есть данные об откликах)
    SELECT AVG(updated_at - created_at) INTO avg_response_time
    FROM urgent_jobs 
    WHERE status = 'filled' 
    AND updated_at::date >= CURRENT_DATE - 7;
    
    -- Создаем или обновляем запись статистики
    INSERT INTO daily_statistics (
        date, 
        active_urgent_jobs, 
        filled_jobs_today,
        avg_response_time,
        created_at
    ) VALUES (
        CURRENT_DATE,
        active_urgent_jobs,
        filled_today,
        avg_response_time,
        NOW()
    ) ON CONFLICT (date) DO UPDATE SET
        active_urgent_jobs = EXCLUDED.active_urgent_jobs,
        filled_jobs_today = EXCLUDED.filled_jobs_today,
        avg_response_time = EXCLUDED.avg_response_time,
        updated_at = NOW()
    WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'daily_statistics');
    
    result_text := format('Статистика обновлена: %s активных, %s заполнено сегодня', 
                         active_urgent_jobs, filled_today);
    
    -- Логируем операцию
    INSERT INTO automation_logs (task_name, executed_at, success, details, affected_rows)
    VALUES ('update_statistics', NOW(), true, result_text, 1);
    
    RETURN QUERY SELECT true, result_text;
    
EXCEPTION
    WHEN OTHERS THEN
        INSERT INTO automation_logs (task_name, executed_at, success, details, affected_rows)
        VALUES ('update_statistics', NOW(), false, SQLERRM, 0);
        
        RETURN QUERY SELECT false, format('Ошибка: %s', SQLERRM);
END;
$$ LANGUAGE plpgsql;

-- ====================================================================
-- ПОДЗАДАЧА 1.1.3.5: Мастер-процедура ежедневного обслуживания
-- ====================================================================

CREATE OR REPLACE FUNCTION daily_maintenance()
RETURNS TABLE(operation text, success boolean, details text)
AS $$
DECLARE
    op_record record;
BEGIN
    -- Выполняем все ежедневные операции
    
    -- 1. Закрытие просроченных вакансий
    FOR op_record IN 
        SELECT 'auto_close_expired' as operation, * FROM auto_close_expired_urgent_jobs()
    LOOP
        RETURN QUERY SELECT op_record.operation, true, op_record.details;
    END LOOP;
    
    -- 2. Обработка уведомлений
    FOR op_record IN 
        SELECT 'process_notifications' as operation, * FROM process_urgent_job_notifications()
    LOOP
        RETURN QUERY SELECT op_record.operation, true, op_record.details;
    END LOOP;
    
    -- 3. Обновление статистики
    FOR op_record IN 
        SELECT 'update_statistics' as operation, * FROM update_job_statistics()
    LOOP
        RETURN QUERY SELECT op_record.operation, op_record.stats_updated, op_record.details;
    END LOOP;
    
    -- 4. Еженедельная очистка (только по воскресеньям)
    IF EXTRACT(dow FROM NOW()) = 0 THEN -- Воскресенье
        FOR op_record IN 
            SELECT 'cleanup_old_data' as operation, * FROM cleanup_old_data(30)
        LOOP
            RETURN QUERY SELECT op_record.operation, true, op_record.details;
        END LOOP;
    END IF;
    
    -- Финальный лог
    INSERT INTO automation_logs (task_name, executed_at, success, details, affected_rows)
    VALUES ('daily_maintenance_complete', NOW(), true, 'Ежедневное обслуживание завершено', 0);
    
END;
$$ LANGUAGE plpgsql;

-- ====================================================================
-- СОЗДАНИЕ ТАБЛИЦЫ СТАТИСТИКИ (если не существует)
-- ====================================================================

CREATE TABLE IF NOT EXISTS daily_statistics (
    id serial PRIMARY KEY,
    date date UNIQUE NOT NULL DEFAULT CURRENT_DATE,
    active_urgent_jobs integer DEFAULT 0,
    filled_jobs_today integer DEFAULT 0,
    avg_response_time interval,
    created_at timestamp with time zone DEFAULT NOW(),
    updated_at timestamp with time zone DEFAULT NOW()
);

-- Логирование успешного применения
INSERT INTO automation_logs (task_name, executed_at, success, details, affected_rows)
SELECT 
    'create_automation_procedures',
    NOW(),
    true,
    'Созданы процедуры автоматизации: автозакрытие, уведомления, очистка, статистика',
    0
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'automation_logs');

COMMIT;

-- ====================================================================
-- РЕЗУЛЬТАТ МИГРАЦИИ
-- ====================================================================

/*
✅ ПОДЗАДАЧА 1.1.3.1: Процедура автозакрытия просроченных вакансий - ВЫПОЛНЕНА
✅ ПОДЗАДАЧА 1.1.3.2: Процедура отправки уведомлений - ВЫПОЛНЕНА  
✅ ПОДЗАДАЧА 1.1.3.3: Процедура очистки старых данных - ВЫПОЛНЕНА
✅ ПОДЗАДАЧА 1.1.3.4: Процедура обновления статистики - ВЫПОЛНЕНА
✅ ПОДЗАДАЧА 1.1.3.5: Мастер-процедура ежедневного обслуживания - ВЫПОЛНЕНА

СОЗДАННЫЕ ПРОЦЕДУРЫ:
- auto_close_expired_urgent_jobs() - автозакрытие просроченных вакансий
- process_urgent_job_notifications() - создание уведомлений для кандидатов
- cleanup_old_data(days) - очистка старых данных
- update_job_statistics() - обновление ежедневной статистики
- daily_maintenance() - комплексное ежедневное обслуживание

СЛЕДУЮЩИЙ ШАГ: Задача 1.1.4 - Настройка безопасности RLS
*/
