/**
 * Создание недостающих таблиц через HTTP API
 */

async function createMissingTables() {
  console.log('🏗️  Создаем недостающие таблицы через HTTP API...')
  
  const supabaseUrl = 'https://kuyudpxqlrinkcxvorom.supabase.co'
  const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1eXVkcHhxbHJpbmtjeHZvcm9tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODk2ODE5OSwiZXhwIjoyMDY0NTQ0MTk5fQ.yJIhTRV-TqzFDy0sQTgcfCa7Xw7b8IHZMO2-s3OtS3g'
  
  // SQL команды для создания таблиц
  const createUserProfilesSQL = `
CREATE TABLE IF NOT EXISTS user_profiles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    role varchar(20) NOT NULL CHECK (role IN ('candidate', 'employer', 'admin')),
    first_name varchar(100),
    last_name varchar(100),
    phone varchar(20),
    email varchar(255),
    specialization_id integer REFERENCES specializations(id),
    experience_years integer DEFAULT 0,
    preferred_district_id integer REFERENCES city_districts(id),
    preferred_salary_min integer DEFAULT 0,
    preferred_salary_max integer DEFAULT 0,
    available_immediately boolean DEFAULT false,
    available_weekends boolean DEFAULT false,
    has_own_transport boolean DEFAULT false,
    ready_for_urgent boolean DEFAULT false,
    has_health_book boolean DEFAULT false,
    has_food_safety_cert boolean DEFAULT false,
    avatar_url text,
    bio text,
    telegram_username varchar(100),
    created_at timestamp with time zone DEFAULT NOW(),
    updated_at timestamp with time zone DEFAULT NOW()
);`

  const createCompaniesSQL = `
CREATE TABLE IF NOT EXISTS companies (
    id serial PRIMARY KEY,
    name varchar(200) NOT NULL,
    industry varchar(100),
    description text,
    logo text,
    website varchar(255),
    phone varchar(20),
    email varchar(255),
    address text,
    district_id integer REFERENCES city_districts(id),
    venue_type_id integer REFERENCES venue_types(id),
    verified boolean DEFAULT false,
    employees_count varchar(50),
    working_hours varchar(100),
    location varchar(255),
    created_at timestamp with time zone DEFAULT NOW(),
    updated_at timestamp with time zone DEFAULT NOW()
);`

  const createUrgentJobsSQL = `
CREATE TABLE IF NOT EXISTS urgent_jobs (
    id serial PRIMARY KEY,
    title varchar(200) NOT NULL,
    company_id integer REFERENCES companies(id) ON DELETE CASCADE,
    venue_name varchar(200) NOT NULL,
    specialization_id integer REFERENCES specializations(id),
    district_id integer REFERENCES city_districts(id),
    venue_type_id integer REFERENCES venue_types(id),
    description text,
    requirements text,
    needed_date date NOT NULL,
    needed_time time,
    duration_hours integer DEFAULT 8,
    pay_per_shift integer NOT NULL,
    address text,
    contact_phone varchar(20),
    contact_person varchar(100),
    status varchar(20) DEFAULT 'active' CHECK (status IN ('active', 'filled', 'cancelled')),
    created_at timestamp with time zone DEFAULT NOW(),
    updated_at timestamp with time zone DEFAULT NOW()
);`

  const sqlCommands = [
    { name: 'user_profiles', sql: createUserProfilesSQL },
    { name: 'companies', sql: createCompaniesSQL },
    { name: 'urgent_jobs', sql: createUrgentJobsSQL }
  ]
  
  for (const { name, sql } of sqlCommands) {
    try {
      console.log(`⚡ Создаем таблицу ${name}...`)
      
      const response = await fetch(`${supabaseUrl}/rest/v1/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${serviceKey}`,
          'apikey': serviceKey
        },
        body: JSON.stringify({ query: sql })
      })
      
      if (response.ok) {
        console.log(`✅ Таблица ${name} создана`)
      } else {
        const error = await response.text()
        console.log(`⚠️  Таблица ${name}: ${error}`)
      }
    } catch (error) {
      console.log(`❌ Ошибка создания ${name}: ${error.message}`)
    }
  }
}

// Простой способ - выводим SQL для копирования в Dashboard
function outputSQLForDashboard() {
  console.log('\n📋 SQL ДЛЯ КОПИРОВАНИЯ В SUPABASE DASHBOARD:')
  console.log('=' * 60)
  console.log(`
-- Скопируйте и выполните в Supabase Dashboard > SQL Editor

-- 1. Создаем таблицу профилей пользователей
CREATE TABLE IF NOT EXISTS user_profiles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    role varchar(20) NOT NULL CHECK (role IN ('candidate', 'employer', 'admin')),
    first_name varchar(100),
    last_name varchar(100),
    phone varchar(20),
    email varchar(255),
    specialization_id integer REFERENCES specializations(id),
    experience_years integer DEFAULT 0,
    preferred_district_id integer REFERENCES city_districts(id),
    preferred_salary_min integer DEFAULT 0,
    preferred_salary_max integer DEFAULT 0,
    available_immediately boolean DEFAULT false,
    available_weekends boolean DEFAULT false,
    has_own_transport boolean DEFAULT false,
    ready_for_urgent boolean DEFAULT false,
    has_health_book boolean DEFAULT false,
    has_food_safety_cert boolean DEFAULT false,
    avatar_url text,
    bio text,
    telegram_username varchar(100),
    created_at timestamp with time zone DEFAULT NOW(),
    updated_at timestamp with time zone DEFAULT NOW()
);

-- 2. Создаем таблицу компаний
CREATE TABLE IF NOT EXISTS companies (
    id serial PRIMARY KEY,
    name varchar(200) NOT NULL,
    industry varchar(100),
    description text,
    logo text,
    website varchar(255),
    phone varchar(20),
    email varchar(255),
    address text,
    district_id integer REFERENCES city_districts(id),
    venue_type_id integer REFERENCES venue_types(id),
    verified boolean DEFAULT false,
    employees_count varchar(50),
    working_hours varchar(100),
    location varchar(255),
    created_at timestamp with time zone DEFAULT NOW(),
    updated_at timestamp with time zone DEFAULT NOW()
);

-- 3. Создаем таблицу срочных вакансий
CREATE TABLE IF NOT EXISTS urgent_jobs (
    id serial PRIMARY KEY,
    title varchar(200) NOT NULL,
    company_id integer REFERENCES companies(id) ON DELETE CASCADE,
    venue_name varchar(200) NOT NULL,
    specialization_id integer REFERENCES specializations(id),
    district_id integer REFERENCES city_districts(id),
    venue_type_id integer REFERENCES venue_types(id),
    description text,
    requirements text,
    needed_date date NOT NULL,
    needed_time time,
    duration_hours integer DEFAULT 8,
    pay_per_shift integer NOT NULL,
    address text,
    contact_phone varchar(20),
    contact_person varchar(100),
    status varchar(20) DEFAULT 'active' CHECK (status IN ('active', 'filled', 'cancelled')),
    created_at timestamp with time zone DEFAULT NOW(),
    updated_at timestamp with time zone DEFAULT NOW()
);

-- 4. Включаем RLS (Row Level Security)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE urgent_jobs ENABLE ROW LEVEL SECURITY;

-- 5. Создаем базовые политики RLS
CREATE POLICY "Public profiles are viewable by everyone" 
ON user_profiles FOR SELECT 
USING (true);

CREATE POLICY "Companies are viewable by everyone" 
ON companies FOR SELECT 
USING (true);

CREATE POLICY "Urgent jobs are viewable by everyone" 
ON urgent_jobs FOR SELECT 
USING (true);

-- 6. Заполняем тестовые данные компаний
INSERT INTO companies (name, industry, description, verified, employees_count, district_id, venue_type_id, location) VALUES
('Ресторан "Астана"', 'Ресторан высокой кухни', 'Премиальный ресторан с европейской кухней в центре города', true, '50-100', 1, 1, 'Есильский район'),
('Кафе "Достык"', 'Семейное кафе', 'Уютное семейное кафе с домашней кухней', true, '10-50', 2, 2, 'Алматинский район'),
('Пиццерия "Мама Мия"', 'Итальянская кухня', 'Аутентичная итальянская пиццерия', true, '20-50', 3, 3, 'Сарыаркинский район');

-- 7. Создаем тестовые профили пользователей
INSERT INTO user_profiles (role, first_name, last_name, specialization_id, experience_years, ready_for_urgent, available_immediately, has_own_transport, preferred_district_id) VALUES
('candidate', 'Айдар', 'Касымов', 1, 3, true, true, false, 1),
('candidate', 'Асель', 'Нурланова', 4, 2, false, true, true, 2),
('candidate', 'Данияр', 'Токтаров', 5, 5, true, false, true, 3);

-- 8. Создаем тестовые срочные вакансии
INSERT INTO urgent_jobs (title, company_id, venue_name, specialization_id, district_id, venue_type_id, description, needed_date, needed_time, pay_per_shift, address, contact_phone, status) VALUES
('Повар на утреннюю смену', 1, 'Ресторан "Астана"', 1, 1, 1, 'Требуется опытный повар на утреннюю смену. Работа с европейской кухней.', CURRENT_DATE, '09:00', 8000, 'ул. Республики, 15', '+7 701 123 4567', 'active'),
('Официант на вечернюю смену', 2, 'Кафе "Достык"', 4, 2, 2, 'Нужен дружелюбный официант на вечернюю смену. Опыт приветствуется.', CURRENT_DATE, '18:00', 5000, 'пр. Достык, 20', '+7 701 234 5678', 'active');

-- Готово! Проверьте таблицы командой:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;
  `)
  
  console.log('\n🔗 ССЫЛКА НА SUPABASE DASHBOARD:')
  console.log('https://supabase.com/dashboard/project/kuyudpxqlrinkcxvorom/sql/new')
}

outputSQLForDashboard()
