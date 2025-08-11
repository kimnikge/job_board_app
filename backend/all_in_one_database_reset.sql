-- all_in_one_database_reset.sql
-- ПОЛНЫЙ СБРОС И ПЕРЕСОЗДАНИЕ БАЗЫ ДАННЫХ ОДНИМ ФАЙЛОМ

-- ===========================================
-- ЭТАП 1: ПОЛНАЯ ОЧИСТКА
-- ===========================================

-- Отключаем RLS для очистки
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT schemaname, tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'ALTER TABLE IF EXISTS ' || quote_ident(r.schemaname) || '.' || quote_ident(r.tablename) || ' DISABLE ROW LEVEL SECURITY';
    END LOOP;
END $$;

-- Удаляем все политики
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON ' || quote_ident(r.schemaname) || '.' || quote_ident(r.tablename);
    END LOOP;
END $$;

-- Удаляем все триггеры
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT trigger_name, event_object_table FROM information_schema.triggers WHERE trigger_schema = 'public') LOOP
        EXECUTE 'DROP TRIGGER IF EXISTS ' || quote_ident(r.trigger_name) || ' ON public.' || quote_ident(r.event_object_table);
    END LOOP;
END $$;

-- Удаляем все функции
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT n.nspname, p.proname, pg_get_function_identity_arguments(p.oid) as args
        FROM pg_proc p 
        JOIN pg_namespace n ON p.pronamespace = n.oid 
        WHERE n.nspname = 'public' AND p.prokind = 'f'
    ) LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS ' || quote_ident(r.nspname) || '.' || quote_ident(r.proname) || '(' || r.args || ') CASCADE';
    END LOOP;
END $$;

-- Удаляем все таблицы
DROP TABLE IF EXISTS public.user_badges CASCADE;
DROP TABLE IF EXISTS public.badge_skill_links CASCADE;
DROP TABLE IF EXISTS public.badges CASCADE;
DROP TABLE IF EXISTS public.skills CASCADE;
DROP TABLE IF EXISTS public.work_logs CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.job_applications CASCADE;
DROP TABLE IF EXISTS public.urgent_jobs CASCADE;
DROP TABLE IF EXISTS public.job_postings CASCADE;
DROP TABLE IF EXISTS public.company_reviews CASCADE;
DROP TABLE IF EXISTS public.user_profiles CASCADE;
DROP TABLE IF EXISTS public.employers CASCADE;
DROP TABLE IF EXISTS public.venue_types CASCADE;
DROP TABLE IF EXISTS public.specializations CASCADE;
DROP TABLE IF EXISTS public.city_districts CASCADE;

-- Удаляем енумы
DROP TYPE IF EXISTS public.badge_category CASCADE;
DROP TYPE IF EXISTS public.badge_level CASCADE;
DROP TYPE IF EXISTS public.notification_type CASCADE;
DROP TYPE IF EXISTS public.application_status CASCADE;

-- ===========================================
-- ЭТАП 2: СОЗДАНИЕ НОВОЙ СТРУКТУРЫ
-- ===========================================

-- Создаем енумы
CREATE TYPE public.badge_category AS ENUM ('Hard Skills', 'Soft Skills', 'Experience', 'Recommendations', 'Special Projects', 'Loyalty', 'Team Contribution', 'Other');
CREATE TYPE public.badge_level AS ENUM ('Bronze', 'Silver', 'Gold', 'Platinum');
CREATE TYPE public.notification_type AS ENUM ('badge_awarded', 'job_matched', 'application_status', 'system');
CREATE TYPE public.application_status AS ENUM ('pending', 'accepted', 'rejected', 'withdrawn');

-- Создаем основные таблицы
CREATE TABLE public.employers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    description text,
    logo_url text,
    contact_email text,
    contact_phone text,
    address text,
    website text,
    industry text,
    size_range text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.user_profiles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email text UNIQUE NOT NULL,
    full_name text NOT NULL,
    phone text,
    date_of_birth date,
    gender text CHECK (gender IN ('male', 'female', 'other')),
    location text,
    bio text,
    avatar_url text,
    resume_url text,
    telegram_username text,
    preferred_salary_min integer,
    preferred_salary_max integer,
    preferred_work_type text CHECK (preferred_work_type IN ('full-time', 'part-time', 'freelance', 'contract')),
    preferred_locations text[],
    skills_tags text[],
    experience_years integer DEFAULT 0,
    total_rating real DEFAULT 0,
    total_reviews integer DEFAULT 0,
    is_available boolean DEFAULT true,
    last_activity timestamptz DEFAULT now(),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.work_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
    employer_id uuid REFERENCES public.employers(id) ON DELETE CASCADE NOT NULL,
    period_from date NOT NULL,
    period_to date NOT NULL,
    shifts_count integer NOT NULL DEFAULT 0,
    total_hours real NOT NULL DEFAULT 0,
    hourly_rate real,
    performance_rating real CHECK (performance_rating >= 1 AND performance_rating <= 5),
    employer_notes text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.skills (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
    name text NOT NULL,
    base_level integer CHECK (base_level >= 0 AND base_level <= 100) DEFAULT 0,
    calculated_level integer CHECK (calculated_level >= 0 AND calculated_level <= 100) DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(user_id, name)
);

-- Система бейджей
CREATE TABLE public.badges (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    description text,
    icon_url text NOT NULL,
    category public.badge_category NOT NULL,
    level public.badge_level,
    is_company_generated boolean DEFAULT false,
    company_id uuid REFERENCES public.employers(id) ON DELETE CASCADE,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.user_badges (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    badge_id uuid REFERENCES public.badges(id) ON DELETE CASCADE NOT NULL,
    user_id uuid REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
    employer_id uuid REFERENCES public.employers(id),
    awarded_by uuid REFERENCES public.user_profiles(id),
    awarded_at timestamptz DEFAULT now(),
    reason text,
    source text CHECK (source IN ('manual','auto')) DEFAULT 'manual',
    work_log_id uuid REFERENCES public.work_logs(id),
    UNIQUE(badge_id, user_id, employer_id)
);

CREATE TABLE public.badge_skill_links (
    badge_id uuid REFERENCES public.badges(id) ON DELETE CASCADE,
    skill_name text NOT NULL,
    delta smallint NOT NULL DEFAULT 0,
    PRIMARY KEY (badge_id, skill_name)
);

-- ===========================================
-- ЭТАП 3: ИНДЕКСЫ И RLS ПОЛИТИКИ
-- ===========================================

-- Индексы для производительности
CREATE INDEX idx_user_badges_user_id ON public.user_badges(user_id);
CREATE INDEX idx_user_badges_badge_id ON public.user_badges(badge_id);
CREATE INDEX idx_user_badges_employer_id ON public.user_badges(employer_id);
CREATE INDEX idx_user_badges_awarded_at ON public.user_badges(awarded_at);
CREATE INDEX idx_skills_user_id ON public.skills(user_id);
CREATE INDEX idx_work_logs_user_id ON public.work_logs(user_id);
CREATE INDEX idx_work_logs_employer_id ON public.work_logs(employer_id);
CREATE INDEX idx_work_logs_period ON public.work_logs(period_from, period_to);

-- Включаем RLS на всех таблицах
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badge_skill_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_logs ENABLE ROW LEVEL SECURITY;

-- Базовые RLS политики
CREATE POLICY "Public read access" ON public.badges FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.badge_skill_links FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.employers FOR SELECT USING (true);

-- Временные политики для разработки (позже ограничим)
CREATE POLICY "Development: allow all" ON public.user_profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Development: allow all" ON public.user_badges FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Development: allow all" ON public.skills FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Development: allow all" ON public.work_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Development: allow all" ON public.badges FOR INSERT WITH CHECK (true);
CREATE POLICY "Development: allow all" ON public.badge_skill_links FOR INSERT WITH CHECK (true);

-- ===========================================
-- ЭТАП 4: БАЗОВЫЕ БЕЙДЖИ
-- ===========================================

-- HARD SKILLS
INSERT INTO public.badges (name, description, icon_url, category, level) VALUES
('Hard Skills Novice', 'Освоение базовых технических навыков', '🔧', 'Hard Skills', 'Bronze'),
('Hard Skills Practitioner', 'Уверенное владение техническими навыками', '⚙️', 'Hard Skills', 'Silver'),
('Hard Skills Expert', 'Экспертное владение техническими навыками', '🛠️', 'Hard Skills', 'Gold'),
('Hard Skills Master', 'Мастерское владение техническими навыками', '👑', 'Hard Skills', 'Platinum');

-- SOFT SKILLS  
INSERT INTO public.badges (name, description, icon_url, category, level) VALUES
('Communication Starter', 'Развитие навыков общения', '💬', 'Soft Skills', 'Bronze'),
('Team Player', 'Эффективная работа в команде', '🤝', 'Soft Skills', 'Silver'),
('Leadership Potential', 'Проявление лидерских качеств', '👥', 'Soft Skills', 'Gold'),
('Inspirational Leader', 'Вдохновляющее лидерство', '⭐', 'Soft Skills', 'Platinum');

-- EXPERIENCE
INSERT INTO public.badges (name, description, icon_url, category, level) VALUES
('First Steps', 'Первый опыт работы', '👶', 'Experience', 'Bronze'),
('Growing Professional', 'Накопление профессионального опыта', '📈', 'Experience', 'Silver'),
('Seasoned Worker', 'Опытный специалист', '🎖️', 'Experience', 'Gold'),
('Industry Veteran', 'Ветеран индустрии', '🏆', 'Experience', 'Platinum');

-- RECOMMENDATIONS
INSERT INTO public.badges (name, description, icon_url, category, level) VALUES
('First Recommendation', 'Первая рекомендация от работодателя', '👍', 'Recommendations', 'Bronze'),
('Trusted Worker', 'Несколько положительных рекомендаций', '⭐', 'Recommendations', 'Silver'),
('Highly Recommended', 'Множество отличных рекомендаций', '🌟', 'Recommendations', 'Gold'),
('Reference Standard', 'Эталон для рекомендаций', '💎', 'Recommendations', 'Platinum');

-- SPECIAL PROJECTS
INSERT INTO public.badges (name, description, icon_url, category, level) VALUES
('Project Contributor', 'Участие в специальных проектах', '📋', 'Special Projects', 'Bronze'),
('Project Specialist', 'Специализация на сложных проектах', '🎯', 'Special Projects', 'Silver'),
('Project Leader', 'Руководство специальными проектами', '🚀', 'Special Projects', 'Gold'),
('Innovation Driver', 'Движущая сила инноваций', '💡', 'Special Projects', 'Platinum');

-- LOYALTY
INSERT INTO public.badges (name, description, icon_url, category, level) VALUES
('Newcomer', 'Присоединение к платформе', '🆕', 'Loyalty', 'Bronze'),
('Regular Member', 'Постоянный участник платформы', '📅', 'Loyalty', 'Silver'),
('Loyal Partner', 'Преданный партнер платформы', '💙', 'Loyalty', 'Gold'),
('Platform Ambassador', 'Амбассадор платформы', '👑', 'Loyalty', 'Platinum');

-- TEAM CONTRIBUTION
INSERT INTO public.badges (name, description, icon_url, category, level) VALUES
('Team Helper', 'Помощь коллегам по команде', '🤲', 'Team Contribution', 'Bronze'),
('Team Supporter', 'Активная поддержка команды', '💪', 'Team Contribution', 'Silver'),
('Team Champion', 'Чемпион командной работы', '🏅', 'Team Contribution', 'Gold'),
('Team Legend', 'Легенда командной работы', '🌟', 'Team Contribution', 'Platinum');

-- OTHER
INSERT INTO public.badges (name, description, icon_url, category, level) VALUES
('Initiative Taker', 'Проявление инициативы', '🎯', 'Other', 'Bronze'),
('Problem Solver', 'Решение нестандартных задач', '🧩', 'Other', 'Silver'),
('Excellence Seeker', 'Стремление к совершенству', '✨', 'Other', 'Gold'),
('Exceptional Performer', 'Исключительные достижения', '🏆', 'Other', 'Platinum');

-- ===========================================
-- ИТОГОВАЯ ПРОВЕРКА
-- ===========================================

-- Проверяем результат
SELECT 
    'Таблицы созданы' as status,
    COUNT(*) as count
FROM information_schema.tables 
WHERE table_schema = 'public'

UNION ALL

SELECT 
    'Бейджи добавлены',
    COUNT(*)
FROM public.badges

UNION ALL

SELECT 
    'Енумы созданы',
    COUNT(*)
FROM pg_type t 
WHERE t.typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
AND t.typtype = 'e';

-- Финальное сообщение
SELECT '🎉 База данных успешно пересоздана с системой геймификации!' as final_message;
