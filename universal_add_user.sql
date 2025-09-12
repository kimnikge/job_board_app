-- Универсальное добавление пользователя Kimnikge
-- Выполните этот код частями в SQL Editor Supabase Dashboard

-- ЧАСТЬ 1: Добавляем недостающие поля (если их нет)
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS telegram_id varchar(50);

ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS first_name varchar(100);

ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS last_name varchar(100);

ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS telegram_username varchar(100);

ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS role varchar(20) DEFAULT 'candidate';

ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS ready_for_urgent boolean DEFAULT false;

-- ЧАСТЬ 2: Создаем индекс
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_profiles_telegram_id 
ON public.user_profiles(telegram_id) 
WHERE telegram_id IS NOT NULL;

-- ЧАСТЬ 3: Добавляем данные Kimnikge
INSERT INTO public.user_profiles (
    id,
    user_id,
    telegram_id,
    first_name,
    last_name,
    telegram_username,
    role,
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
    'candidate',
    false,
    NOW(),
    NOW()
) ON CONFLICT (telegram_id) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    telegram_username = EXCLUDED.telegram_username,
    role = EXCLUDED.role,
    updated_at = NOW();

-- ЧАСТЬ 4: Проверяем результат
SELECT telegram_id, first_name, last_name, telegram_username, role
FROM public.user_profiles 
WHERE telegram_id = '763612632';
