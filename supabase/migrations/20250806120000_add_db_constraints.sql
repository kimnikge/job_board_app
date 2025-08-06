-- Добавление ограничений целостности для безопасности БД
-- Дата: 6 августа 2025
-- Задача 1.1.1: Добавить ограничения целостности

BEGIN;

-- ====================================================================
-- ПОДЗАДАЧА 1.1.1.1: CHECK ограничения для urgent_jobs
-- ====================================================================

-- Ограничения статуса срочных вакансий
ALTER TABLE urgent_jobs 
ADD CONSTRAINT IF NOT EXISTS check_urgent_jobs_status 
CHECK (status IN ('active', 'filled', 'expired', 'cancelled'));

-- Ограничения приоритета уведомлений (1-5)
ALTER TABLE urgent_jobs 
ADD CONSTRAINT IF NOT EXISTS check_urgent_jobs_priority 
CHECK (notification_priority BETWEEN 1 AND 5);

-- Ограничения положительной оплаты за смену
ALTER TABLE urgent_jobs 
ADD CONSTRAINT IF NOT EXISTS check_urgent_jobs_pay_positive 
CHECK (pay_per_shift > 0);

-- Ограничения валидной даты (не в прошлом)
ALTER TABLE urgent_jobs 
ADD CONSTRAINT IF NOT EXISTS check_urgent_jobs_needed_date 
CHECK (needed_date >= CURRENT_DATE);

-- Ограничения автозакрытия (должно быть в будущем)
ALTER TABLE urgent_jobs 
ADD CONSTRAINT IF NOT EXISTS check_urgent_jobs_auto_close 
CHECK (auto_close_at > created_at);

-- ====================================================================
-- ПОДЗАДАЧА 1.1.1.2: Обязательные поля NOT NULL
-- ====================================================================

-- Срочные вакансии - обязательные поля
ALTER TABLE urgent_jobs 
ALTER COLUMN title SET NOT NULL,
ALTER COLUMN venue_name SET NOT NULL,
ALTER COLUMN needed_date SET NOT NULL,
ALTER COLUMN pay_per_shift SET NOT NULL,
ALTER COLUMN employer_id SET NOT NULL,
ALTER COLUMN status SET NOT NULL;

-- Установка значений по умолчанию
ALTER TABLE urgent_jobs 
ALTER COLUMN status SET DEFAULT 'active',
ALTER COLUMN notification_priority SET DEFAULT 3,
ALTER COLUMN currency SET DEFAULT 'KZT',
ALTER COLUMN auto_close_at SET DEFAULT (NOW() + INTERVAL '24 hours');

-- Обычные вакансии - обязательные поля
ALTER TABLE job_postings 
ALTER COLUMN title SET NOT NULL,
ALTER COLUMN description SET NOT NULL,
ALTER COLUMN employer_id SET NOT NULL;

-- ====================================================================
-- ПОДЗАДАЧА 1.1.1.3: Валидация валютных кодов (KZT, USD, RUB)
-- ====================================================================

-- Ограничения валютных кодов для срочных вакансий
ALTER TABLE urgent_jobs 
ADD CONSTRAINT IF NOT EXISTS check_urgent_jobs_currency 
CHECK (currency IN ('KZT', 'USD', 'RUB'));

-- Ограничения валютных кодов для обычных вакансий (если есть поле)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'job_postings' AND column_name = 'currency') THEN
        EXECUTE 'ALTER TABLE job_postings 
                 ADD CONSTRAINT IF NOT EXISTS check_job_postings_currency 
                 CHECK (currency IN (''KZT'', ''USD'', ''RUB''))';
    END IF;
END $$;

-- ====================================================================
-- ДОПОЛНИТЕЛЬНЫЕ ОГРАНИЧЕНИЯ ДЛЯ НАДЕЖНОСТИ
-- ====================================================================

-- Проверка корректности времени смены
ALTER TABLE urgent_jobs 
ADD CONSTRAINT IF NOT EXISTS check_urgent_jobs_shift_time 
CHECK (shift_duration IS NULL OR shift_duration > INTERVAL '1 hour');

-- Проверка номера телефона (базовая)
ALTER TABLE urgent_jobs 
ADD CONSTRAINT IF NOT EXISTS check_urgent_jobs_phone_format 
CHECK (contact_phone IS NULL OR LENGTH(contact_phone) >= 10);

-- Проверка приоритета уведомлений для обычных вакансий
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'job_postings' AND column_name = 'priority') THEN
        EXECUTE 'ALTER TABLE job_postings 
                 ADD CONSTRAINT IF NOT EXISTS check_job_postings_priority 
                 CHECK (priority BETWEEN 1 AND 5)';
    END IF;
END $$;

COMMIT;

-- ====================================================================
-- РЕЗУЛЬТАТ
-- ====================================================================

/*
✅ ВЫПОЛНЕНО:
- CHECK ограничения для статуса, приоритета, оплаты
- Обязательные поля NOT NULL
- Валидация валютных кодов (KZT, USD, RUB)
- Дополнительные проверки безопасности

🎯 СЛЕДУЮЩИЙ ШАГ: Задача 1.1.2 - Создать индексы производительности
*/
