# 👥 Создание тестового пользователя в Supabase

Чтобы протестировать авторизацию с реальными данными:

## 1. Создание пользователя через Supabase Dashboard:
1. Откройте https://supabase.com/dashboard/project/kuyudpxqlrinkcxvorom
2. Перейдите в Authentication → Users
3. Создайте нового пользователя:
   - Email: test@example.com
   - Password: 123456
   - Confirm: true

## 2. Или создайте через SQL:
```sql
-- Через psql:
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'test@example.com',
  '$2a$10$Ky6OQoJJq5dQrU6j0...',  -- Хеш для пароля "123456" 
  now(),
  now(),
  now(),
  '',
  '',
  '',
  ''
);
```

## 3. Тестовые данные для быстрого входа:
- Email: test@example.com
- Password: 123456

## 4. Проверка в demo режиме:
Если в файле .env стоит VITE_USE_DEMO_MODE=false, но Supabase не подключен, 
то используется demo режим с любыми данными для входа.
