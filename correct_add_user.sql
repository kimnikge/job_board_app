-- Правильное добавление пользователя Kimnikge
-- Основано на реальной структуре таблицы user_profiles
-- Выполните этот код в SQL Editor Supabase Dashboard

-- 1. Добавляем поле telegram_id (основное для интеграции)
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS telegram_id varchar(50);

-- 2. Добавляем поле telegram_username для совместимости
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS telegram_username varchar(100);

-- 3. Добавляем поле ready_for_urgent для срочных вакансий  
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS ready_for_urgent boolean DEFAULT false;

-- 4. Создаем уникальный индекс на telegram_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_profiles_telegram_id 
ON public.user_profiles(telegram_id) 
WHERE telegram_id IS NOT NULL;

-- 5. Сначала проверяем, есть ли уже пользователь с таким telegram_id
DELETE FROM public.user_profiles WHERE telegram_id = '763612632';

-- 6. Теперь добавляем данные Kimnikge (без user_id пока что)
INSERT INTO public.user_profiles (
    id,
    user_id,
    telegram_id,
    telegram_username,
    full_name,
    user_type,
    ready_for_urgent,
    is_active,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    NULL, -- Оставляем NULL пока что, auth user будет создан через Edge Function
    '763612632',
    'Kimnikge',
    'KNG',
    'worker',
    false,
    true,
    NOW(),
    NOW()
);

-- 7. Создаем VIEW profiles для совместимости со старым кодом
DROP VIEW IF EXISTS public.profiles;
CREATE VIEW public.profiles AS 
SELECT 
    id,
    user_id,
    telegram_id,
    full_name AS first_name,  -- Маппим full_name в first_name
    NULL AS last_name,        -- last_name будет NULL
    telegram_username,
    avatar_url,
    user_type,
    phone,
    email,
    ready_for_urgent,
    created_at,
    updated_at
FROM public.user_profiles;

-- 8. Предоставляем права на VIEW
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated, anon, service_role;

-- 9. Временно отключаем RLS для тестирования
ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;

-- 10. Проверяем результат
SELECT telegram_id, full_name, telegram_username, user_type, ready_for_urgent
FROM public.user_profiles 
WHERE telegram_id = '763612632';

-- 11. Проверяем через VIEW
SELECT telegram_id, first_name, telegram_username, user_type
FROM public.profiles
WHERE telegram_id = '763612632';
