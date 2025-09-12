-- Добавление аккаунта Kimnikge в базу данных
-- Выполните этот код в SQL Editor Supabase Dashboard

-- 1. Добавляем telegram_id к user_profiles (если еще не добавлено)
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS telegram_id varchar(50);

-- 2. Создаем уникальный индекс на telegram_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_profiles_telegram_id 
ON public.user_profiles(telegram_id) 
WHERE telegram_id IS NOT NULL;

-- 3. Добавляем данные Kimnikge (без поля role, так как его нет в таблице)
INSERT INTO public.user_profiles (
    id,
    user_id,
    telegram_id,
    first_name,
    last_name,
    telegram_username,
    ready_for_urgent,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    gen_random_uuid(),
    '763612632',
    'KNG',
    NULL,
    'Kimnikge',
    false,
    NOW(),
    NOW()
) ON CONFLICT (telegram_id) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    telegram_username = EXCLUDED.telegram_username,
    updated_at = NOW();

-- 4. Создаем VIEW profiles для совместимости с существующим кодом
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
    'candidate' AS user_type, -- Устанавливаем по умолчанию
    phone,
    email,
    ready_for_urgent,
    created_at,
    updated_at
FROM public.user_profiles;

-- 5. Предоставляем права на VIEW
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated, anon, service_role;

-- 6. Временно отключаем RLS для тестирования
ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;

-- 7. Проверка результата
SELECT telegram_id, first_name, last_name, telegram_username
FROM public.user_profiles 
WHERE telegram_id = '763612632';

-- 8. Также проверим через VIEW
SELECT telegram_id, first_name, telegram_username, user_type
FROM public.profiles
WHERE telegram_id = '763612632';
