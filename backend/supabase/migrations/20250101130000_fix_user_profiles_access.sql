-- 20250101130000_fix_user_profiles_access.sql
-- Исправляем доступ к таблице user_profiles для Edge Functions

-- 1. Убеждаемся, что RLS включен
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- 2. Добавляем политику для полного доступа Service Role
DROP POLICY IF EXISTS "Service role full access" ON public.user_profiles;
CREATE POLICY "Service role full access" ON public.user_profiles
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

-- 3. Добавляем политику для анонимного доступа (только для чтения по telegram_id)
DROP POLICY IF EXISTS "Anonymous read by telegram_id" ON public.user_profiles;
CREATE POLICY "Anonymous read by telegram_id" ON public.user_profiles
FOR SELECT
TO anon
USING (telegram_id IS NOT NULL);

-- 4. Добавляем политику для анонимного создания записей (только с telegram_id)
DROP POLICY IF EXISTS "Anonymous insert with telegram_id" ON public.user_profiles;
CREATE POLICY "Anonymous insert with telegram_id" ON public.user_profiles
FOR INSERT
TO anon
WITH CHECK (telegram_id IS NOT NULL);

-- 5. Предоставляем доступ анонимному роли
GRANT SELECT, INSERT, UPDATE ON public.user_profiles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_profiles TO authenticated;
GRANT ALL ON public.user_profiles TO service_role;

-- 6. Проверяем существование индексов
CREATE INDEX IF NOT EXISTS idx_user_profiles_telegram_id ON public.user_profiles(telegram_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);

COMMENT ON POLICY "Service role full access" ON public.user_profiles IS 'Edge Functions имеют полный доступ к user_profiles';
COMMENT ON POLICY "Anonymous read by telegram_id" ON public.user_profiles IS 'Анонимные пользователи могут искать по telegram_id';
COMMENT ON POLICY "Anonymous insert with telegram_id" ON public.user_profiles IS 'Анонимные пользователи могут создавать записи с telegram_id';
