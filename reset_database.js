/**
 * Скрипт для полного пересоздания базы данных
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// Загружаем переменные окружения
const supabaseUrl = 'https://kuyudpxqlrinkcxvorom.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1eXVkcHhxbHJpbmtjeHZvcm9tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODk2ODE5OSwiZXhwIjoyMDY0NTQ0MTk5fQ.yJIhTRV-TqzFDy0sQTgcfCa7Xw7b8IHZMO2-s3OtS3g'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function resetDatabase() {
  console.log('🗄️ Начинаем полное пересоздание базы данных...')
  
  try {
    // Читаем SQL файл миграции
    const migrationPath = path.join(process.cwd(), 'supabase/migrations/20250808000000_complete_database_reset.sql')
    const sqlContent = fs.readFileSync(migrationPath, 'utf8')
    
    console.log('📄 SQL миграция загружена, размер:', sqlContent.length, 'символов')
    
    // Разбиваем на части для выполнения
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
    
    console.log('📋 Найдено SQL команд:', statements.length)
    
    // Выполняем каждую команду
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      if (statement.trim()) {
        console.log(`⚡ Выполняем команду ${i + 1}/${statements.length}`)
        
        const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' })
        
        if (error) {
          console.error(`❌ Ошибка в команде ${i + 1}:`, error.message)
          // Продолжаем выполнение остальных команд
        } else {
          console.log(`✅ Команда ${i + 1} выполнена успешно`)
        }
      }
    }
    
    console.log('🎉 База данных пересоздана!')
    
    // Проверяем созданные таблицы
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .neq('table_name', 'schema_migrations')
    
    if (tablesError) {
      console.error('❌ Ошибка проверки таблиц:', tablesError)
    } else {
      console.log('📊 Созданные таблицы:', tables.map(t => t.table_name).join(', '))
    }
    
  } catch (error) {
    console.error('💥 Критическая ошибка:', error)
  }
}

// Альтернативный способ через прямой SQL
async function resetDatabaseDirect() {
  console.log('🗄️ Альтернативный способ - прямое выполнение SQL...')
  
  const basicSQL = `
-- Удаляем все пользовательские таблицы
DROP TABLE IF EXISTS urgent_job_responses CASCADE;
DROP TABLE IF EXISTS job_applications CASCADE; 
DROP TABLE IF EXISTS urgent_jobs CASCADE;
DROP TABLE IF EXISTS job_postings CASCADE;
DROP TABLE IF EXISTS companies CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS venue_types CASCADE;
DROP TABLE IF EXISTS specializations CASCADE;
DROP TABLE IF EXISTS city_districts CASCADE;
DROP TABLE IF EXISTS notification_queue CASCADE;
DROP TABLE IF EXISTS notification_settings CASCADE;
DROP TABLE IF EXISTS automation_logs CASCADE;
DROP TABLE IF EXISTS daily_statistics CASCADE;

-- Создаем районы Астаны
CREATE TABLE city_districts (
    id serial PRIMARY KEY,
    name varchar(100) NOT NULL UNIQUE,
    description text,
    metro_stations text[],
    coordinates point,
    created_at timestamp with time zone DEFAULT NOW(),
    updated_at timestamp with time zone DEFAULT NOW()
);

-- Создаем специализации
CREATE TABLE specializations (
    id serial PRIMARY KEY,
    name varchar(100) NOT NULL UNIQUE,
    description text,
    category varchar(50) DEFAULT 'general',
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT NOW(),
    updated_at timestamp with time zone DEFAULT NOW()
);

-- Создаем типы заведений
CREATE TABLE venue_types (
    id serial PRIMARY KEY,
    name varchar(100) NOT NULL UNIQUE,
    description text,
    typical_specializations integer[],
    created_at timestamp with time zone DEFAULT NOW(),
    updated_at timestamp with time zone DEFAULT NOW()
);

-- Создаем профили пользователей
CREATE TABLE user_profiles (
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

-- Создаем компании
CREATE TABLE companies (
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
    
    created_at timestamp with time zone DEFAULT NOW(),
    updated_at timestamp with time zone DEFAULT NOW()
);

-- Создаем срочные вакансии
CREATE TABLE urgent_jobs (
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
  `
  
  try {
    // Выполняем базовый SQL
    const { error } = await supabase.rpc('exec_sql', { sql: basicSQL })
    
    if (error) {
      console.error('❌ Ошибка создания таблиц:', error)
    } else {
      console.log('✅ Базовые таблицы созданы!')
    }
    
  } catch (error) {
    console.error('💥 Ошибка:', error)
  }
}

// Запускаем пересоздание
resetDatabaseDirect()
