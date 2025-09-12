-- Исправляем доступ к таблице user_profiles для Edge Functions
-- Выполните этот запрос в Supabase SQL Editor

-- 1. Проверяем текущие политики
SELECT schemaname, tablename, policyname, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'user_profiles';

-- 2. Убеждаемся, что RLS включен
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- 3. Удаляем старые политики и создаем новые
DROP POLICY IF EXISTS "Service role full access" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_service_role_access" ON public.user_profiles;

-- 4. Создаем политику для полного доступа Service Role
CREATE POLICY "service_role_access" ON public.user_profiles
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

-- 5. Предоставляем доступ всем ролям
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_profiles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_profiles TO authenticated;
GRANT ALL ON public.user_profiles TO service_role;

-- 6. Проверяем результат
SELECT schemaname, tablename, policyname, roles, cmd 
FROM pg_policies 
WHERE tablename = 'user_profiles';
