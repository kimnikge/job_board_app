#!/bin/bash

# Создание таблиц через cURL
echo "🏗️  Создаем таблицы через cURL..."

SUPABASE_URL="https://kuyudpxqlrinkcxvorom.supabase.co"
SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1eXVkcHhxbHJpbmtjeHZvcm9tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODk2ODE5OSwiZXhwIjoyMDY0NTQ0MTk5fQ.yJIhTRV-TqzFDy0sQTgcfCa7Xw7b8IHZMO2-s3OtS3g"

# Команда 1: Создание user_profiles
echo "⚡ Создаем user_profiles..."
curl -X POST "${SUPABASE_URL}/rest/v1/rpc/exec_sql" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${SERVICE_KEY}" \
  -H "apikey: ${SERVICE_KEY}" \
  -d '{
    "sql": "CREATE TABLE IF NOT EXISTS user_profiles (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE, role varchar(20) NOT NULL CHECK (role IN (\"candidate\", \"employer\", \"admin\")), first_name varchar(100), last_name varchar(100), phone varchar(20), email varchar(255), specialization_id integer REFERENCES specializations(id), experience_years integer DEFAULT 0, preferred_district_id integer REFERENCES city_districts(id), preferred_salary_min integer DEFAULT 0, preferred_salary_max integer DEFAULT 0, available_immediately boolean DEFAULT false, available_weekends boolean DEFAULT false, has_own_transport boolean DEFAULT false, ready_for_urgent boolean DEFAULT false, has_health_book boolean DEFAULT false, has_food_safety_cert boolean DEFAULT false, avatar_url text, bio text, telegram_username varchar(100), created_at timestamp with time zone DEFAULT NOW(), updated_at timestamp with time zone DEFAULT NOW());"
  }'

echo -e "\n⚡ Создаем companies..."
curl -X POST "${SUPABASE_URL}/rest/v1/rpc/exec_sql" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${SERVICE_KEY}" \
  -H "apikey: ${SERVICE_KEY}" \
  -d '{
    "sql": "CREATE TABLE IF NOT EXISTS companies (id serial PRIMARY KEY, name varchar(200) NOT NULL, industry varchar(100), description text, logo text, website varchar(255), phone varchar(20), email varchar(255), address text, district_id integer REFERENCES city_districts(id), venue_type_id integer REFERENCES venue_types(id), verified boolean DEFAULT false, employees_count varchar(50), working_hours varchar(100), location varchar(255), created_at timestamp with time zone DEFAULT NOW(), updated_at timestamp with time zone DEFAULT NOW());"
  }'

echo -e "\n⚡ Создаем urgent_jobs..."
curl -X POST "${SUPABASE_URL}/rest/v1/rpc/exec_sql" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${SERVICE_KEY}" \
  -H "apikey: ${SERVICE_KEY}" \
  -d '{
    "sql": "CREATE TABLE IF NOT EXISTS urgent_jobs (id serial PRIMARY KEY, title varchar(200) NOT NULL, company_id integer REFERENCES companies(id) ON DELETE CASCADE, venue_name varchar(200) NOT NULL, specialization_id integer REFERENCES specializations(id), district_id integer REFERENCES city_districts(id), venue_type_id integer REFERENCES venue_types(id), description text, requirements text, needed_date date NOT NULL, needed_time time, duration_hours integer DEFAULT 8, pay_per_shift integer NOT NULL, address text, contact_phone varchar(20), contact_person varchar(100), status varchar(20) DEFAULT \"active\" CHECK (status IN (\"active\", \"filled\", \"cancelled\")), created_at timestamp with time zone DEFAULT NOW(), updated_at timestamp with time zone DEFAULT NOW());"
  }'

echo -e "\n🎉 Команды отправлены!"
