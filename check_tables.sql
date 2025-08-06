-- Проверяем созданные таблицы новой архитектуры
SELECT 
    table_name,
    CASE 
        WHEN table_name IN ('specializations', 'city_districts', 'venue_types') THEN 'Справочники'
        WHEN table_name IN ('companies', 'job_postings', 'urgent_jobs', 'resumes', 'applications') THEN 'Основные таблицы'
        WHEN table_name IN ('candidate_profiles', 'employer_profiles') THEN 'Профили пользователей'
        WHEN table_name IN ('notifications', 'notification_types', 'user_notification_settings') THEN 'Система уведомлений'
        WHEN table_name = 'automation_logs' THEN 'Автоматизация'
        ELSE 'Другие'
    END as category
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
ORDER BY category, table_name;
