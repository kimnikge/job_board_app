-- Проверка структуры таблицы user_profiles
-- Выполните этот код в SQL Editor Supabase Dashboard

-- 1. Посмотрим структуру таблицы
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Также посмотрим все таблицы, которые есть
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;
