-- SQL-скрипт для инициализации всех необходимых таблиц для Supabase/Postgres

-- Пользователи
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('job_seeker', 'employer', 'moderator', 'admin')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP
);

-- Профили соискателей
CREATE TABLE IF NOT EXISTS job_seekers (
  user_id INTEGER PRIMARY KEY REFERENCES users(id),
  full_name VARCHAR(100),
  phone VARCHAR(20),
  avatar_url TEXT
);

-- Профили работодателей
CREATE TABLE IF NOT EXISTS employers (
  user_id INTEGER PRIMARY KEY REFERENCES users(id),
  company_name VARCHAR(100),
  company_logo TEXT,
  contact_phone VARCHAR(20)
);

-- Вакансии
CREATE TABLE IF NOT EXISTS job_postings (
  id SERIAL PRIMARY KEY,
  employer_id INTEGER NOT NULL REFERENCES users(id),
  title VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  salary_range VARCHAR(50),
  location VARCHAR(100),
  employment_type VARCHAR(50),
  is_active BOOLEAN DEFAULT TRUE,
  is_approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP
);

-- Категории вакансий
CREATE TABLE IF NOT EXISTS job_categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL
);

-- Связь вакансий с категориями
CREATE TABLE IF NOT EXISTS job_posting_categories (
  job_id INTEGER REFERENCES job_postings(id),
  category_id INTEGER REFERENCES job_categories(id),
  PRIMARY KEY (job_id, category_id)
);

-- Резюме
CREATE TABLE IF NOT EXISTS resumes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  full_name VARCHAR(100) NOT NULL,
  city VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  avatar TEXT,
  languages JSONB,
  hard_skills JSONB,
  education JSONB,
  avatar_url TEXT,
  work_experience JSONB,
  social_links JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Отклики на вакансии
CREATE TABLE IF NOT EXISTS applications (
  id SERIAL PRIMARY KEY,
  job_posting_id INTEGER NOT NULL REFERENCES job_postings(id),
  job_seeker_id INTEGER NOT NULL REFERENCES users(id),
  resume_id INTEGER NOT NULL REFERENCES resumes(id),
  message TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

-- История статусов откликов
CREATE TABLE IF NOT EXISTS application_status_history (
  id SERIAL PRIMARY KEY,
  application_id INTEGER REFERENCES applications(id),
  status VARCHAR(20) NOT NULL,
  changed_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Причины отклонения вакансий (для модерации)
CREATE TABLE IF NOT EXISTS moderation_rejects (
  id SERIAL PRIMARY KEY,
  job_posting_id INTEGER REFERENCES job_postings(id),
  moderator_id INTEGER REFERENCES users(id),
  reason TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
