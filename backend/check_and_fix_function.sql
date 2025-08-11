-- Проверка и исправление прав для функции create_company_badge
-- Этот скрипт нужно выполнить в Supabase SQL Editor

-- 1. Проверяем что функция создана
SELECT 
    proname as function_name,
    pg_get_function_identity_arguments(oid) as arguments
FROM pg_proc 
WHERE proname = 'create_company_badge';

-- 2. Если роль authenticated не существует, создаем упрощенную версию прав
-- Просто даем права всем аутентифицированным пользователям через RLS
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
        -- Если роли нет, просто логируем это
        RAISE NOTICE 'Role authenticated does not exist, function will work with default permissions';
    ELSE
        -- Если роль есть, даем права
        GRANT EXECUTE ON FUNCTION public.create_company_badge(uuid, text, text, text, text, text, jsonb) TO authenticated;
    END IF;
END
$$;

-- 3. Альтернативно: даем права роли anon (которая точно есть в Supabase)
GRANT EXECUTE ON FUNCTION public.create_company_badge(uuid, text, text, text, text, text, jsonb) TO anon;

-- 4. Проверяем права доступа
SELECT 
    grantee, 
    privilege_type 
FROM information_schema.routine_privileges 
WHERE routine_name = 'create_company_badge';

-- 5. Тестируем функцию (должно выдать ошибку о том что компании нет, но это нормально)
-- SELECT * FROM create_company_badge(
--     '00000000-0000-0000-0000-000000000000'::uuid,
--     'Test Badge',
--     'Test Description'
-- );
