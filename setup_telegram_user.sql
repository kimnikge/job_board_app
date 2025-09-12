-- Простая миграция для добавления Telegram полей
-- Выполните этот код в SQL Editor Supabase Dashboard

-- 1. Добавляем telegram_id к user_profiles
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS telegram_id varchar(50);

-- 2. Создаем уникальный индекс на telegram_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_profiles_telegram_id 
ON public.user_profiles(telegram_id) 
WHERE telegram_id IS NOT NULL;

-- 3. Добавляем ваши тестовые данные
-- Замените значения на ваши реальные данные из Telegram:
INSERT INTO public.user_profiles (
    id,
    user_id,
    telegram_id,
    role,
    first_name,
    last_name,
    telegram_username,
    ready_for_urgent,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    gen_random_uuid(), -- Временный user_id, позже создадим auth пользователя
    'YOUR_TELEGRAM_ID_HERE', -- Замените на ваш реальный Telegram ID
    'candidate',
    'Ваше имя', -- Замените на ваше имя
    'Ваша фамилия', -- Замените на вашу фамилию  
    'ваш_username', -- Замените на ваш @username
    false,
    NOW(),
    NOW()
) ON CONFLICT (telegram_id) DO NOTHING;

-- 4. Создаем VIEW profiles для совместимости
DROP VIEW IF EXISTS public.profiles;
CREATE VIEW public.profiles AS 
SELECT 
    id,
    user_id,
    telegram_id,
    first_name,
    last_name,
    telegram_username,
    avatar_url,
    role AS user_type,
    phone,
    email,
    ready_for_urgent,
    created_at,
    updated_at
FROM public.user_profiles;

-- 5. Временно отключаем RLS для тестирования
ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;

-- Проверка: посмотрим что получилось
SELECT telegram_id, first_name, last_name, telegram_username 
FROM public.user_profiles 
WHERE telegram_id IS NOT NULL;
