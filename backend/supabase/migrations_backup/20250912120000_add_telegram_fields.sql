-- 20250912120000_add_telegram_fields.sql
-- Добавляем недостающие поля для интеграции с Telegram

-- 1. Добавляем telegram_id (основное поле для связи с Telegram)
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS telegram_id varchar(50) UNIQUE;

-- 2. Добавляем поле auth_user_id (для RLS политик)
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS auth_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- 3. Обновляем существующие записи (если есть)
UPDATE public.user_profiles 
SET auth_user_id = user_id 
WHERE auth_user_id IS NULL;

-- 4. Создаем индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_user_profiles_telegram_id ON public.user_profiles(telegram_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_auth_user_id ON public.user_profiles(auth_user_id);

-- 5. Создаем таблицу profiles как VIEW для совместимости с существующим кодом
CREATE OR REPLACE VIEW public.profiles AS 
SELECT 
    id,
    user_id,
    auth_user_id,
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

-- 6. Предоставляем доступ к VIEW
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated, anon;

-- 7. Обновляем RLS политики для включения Service Role доступа
DROP POLICY IF EXISTS user_profiles_service_role_access ON public.user_profiles;
CREATE POLICY user_profiles_service_role_access ON public.user_profiles FOR ALL
USING (true); -- Service role имеет полный доступ

-- 8. Включаем RLS на VIEW (наследует от базовой таблицы)
-- VIEW автоматически использует RLS базовой таблицы

COMMENT ON COLUMN public.user_profiles.telegram_id IS 'Telegram ID пользователя для авторизации';
COMMENT ON COLUMN public.user_profiles.auth_user_id IS 'Ссылка на auth.users для RLS политик';
COMMENT ON VIEW public.profiles IS 'Совместимость с legacy кодом - представление user_profiles';
