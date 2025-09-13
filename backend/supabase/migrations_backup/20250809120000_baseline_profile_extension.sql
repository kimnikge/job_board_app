-- 20250809120000_baseline_profile_extension.sql
-- Baseline миграция для расширенного профиля (skills, badges, work_logs и пр.)
-- Идемпотентный стиль: создаём только если не существует.

-- helper: создание расширения uuid-ossp / pgcrypto (в Supabase обычно pgcrypto уже есть)
DO $$ BEGIN
    CREATE EXTENSION IF NOT EXISTS "pgcrypto";
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- user_profiles (если требуется расширение существующей таблицы)
-- Добавляем недостающие столбцы с проверкой
ALTER TABLE IF EXISTS public.user_profiles
    ADD COLUMN IF NOT EXISTS short_bio text,
    ADD COLUMN IF NOT EXISTS video_url text,
    ADD COLUMN IF NOT EXISTS experience_years smallint DEFAULT 0;

-- employers
CREATE TABLE IF NOT EXISTS public.employers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    logo_url text,
    district_id smallint,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- skills
CREATE TABLE IF NOT EXISTS public.skills (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    name text NOT NULL,
    category text,
    base_level smallint NOT NULL DEFAULT 0,
    calculated_level smallint NOT NULL DEFAULT 0,
    updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS skills_user_id_name_key ON public.skills(user_id, name);
CREATE INDEX IF NOT EXISTS skills_user_id_idx ON public.skills(user_id);

-- badges
CREATE TABLE IF NOT EXISTS public.badges (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    employer_id uuid REFERENCES public.employers(id) ON DELETE SET NULL,
    name text NOT NULL,
    icon_url text,
    description text,
    source text NOT NULL DEFAULT 'manual',
    awarded_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS badges_user_id_awarded_at_idx ON public.badges(user_id, awarded_at DESC);

-- badge_skill_links
CREATE TABLE IF NOT EXISTS public.badge_skill_links (
    badge_id uuid NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
    skill_name text NOT NULL,
    delta smallint NOT NULL DEFAULT 0,
    PRIMARY KEY (badge_id, skill_name)
);

-- work_logs
CREATE TABLE IF NOT EXISTS public.work_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    employer_id uuid NOT NULL REFERENCES public.employers(id) ON DELETE CASCADE,
    period_from date NOT NULL,
    period_to date NOT NULL,
    shifts_count smallint NOT NULL DEFAULT 0,
    total_hours smallint NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS work_logs_user_employer_idx ON public.work_logs(user_id, employer_id);
CREATE INDEX IF NOT EXISTS work_logs_user_id_idx ON public.work_logs(user_id);

-- updated_at триггеры (generic)
CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS trigger AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END; $$ LANGUAGE plpgsql;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_skills'
    ) THEN
        CREATE TRIGGER set_updated_at_skills
        BEFORE UPDATE ON public.skills
        FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
    END IF;
END $$;

-- RLS включение
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badge_skill_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employers ENABLE ROW LEVEL SECURITY;

-- Политики (минимальные, позже уточняются)
DO $$ BEGIN
    -- skills
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'skills' AND policyname = 'skills_select_own') THEN
        CREATE POLICY skills_select_own ON public.skills FOR SELECT USING (user_id = (SELECT id FROM public.user_profiles WHERE auth_user_id = auth.uid()));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'skills' AND policyname = 'skills_modify_own') THEN
        CREATE POLICY skills_modify_own ON public.skills FOR ALL USING (user_id = (SELECT id FROM public.user_profiles WHERE auth_user_id = auth.uid()));
    END IF;

    -- badges
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'badges' AND policyname = 'badges_select_own') THEN
        CREATE POLICY badges_select_own ON public.badges FOR SELECT USING (user_id = (SELECT id FROM public.user_profiles WHERE auth_user_id = auth.uid()));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'badges' AND policyname = 'badges_insert_own') THEN
        CREATE POLICY badges_insert_own ON public.badges FOR INSERT WITH CHECK (user_id = (SELECT id FROM public.user_profiles WHERE auth_user_id = auth.uid()));
    END IF;

    -- work_logs
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'work_logs' AND policyname = 'work_logs_select_own') THEN
        CREATE POLICY work_logs_select_own ON public.work_logs FOR SELECT USING (user_id = (SELECT id FROM public.user_profiles WHERE auth_user_id = auth.uid()));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'work_logs' AND policyname = 'work_logs_insert_own') THEN
        CREATE POLICY work_logs_insert_own ON public.work_logs FOR INSERT WITH CHECK (user_id = (SELECT id FROM public.user_profiles WHERE auth_user_id = auth.uid()));
    END IF;

    -- employers (пока открыто на чтение)
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'employers' AND policyname = 'employers_select_all') THEN
        CREATE POLICY employers_select_all ON public.employers FOR SELECT USING (true);
    END IF;
END $$;

-- RPC заглушки
CREATE OR REPLACE FUNCTION public.recalc_skills(p_user_id uuid)
RETURNS SETOF public.skills AS $$
BEGIN
    -- TODO: реализовать перерасчёт с учётом badge_skill_links
    RETURN QUERY SELECT * FROM public.skills WHERE user_id = p_user_id;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_user_profile_full(p_user_id uuid)
RETURNS jsonb AS $$
DECLARE
    prof jsonb;
BEGIN
    SELECT to_jsonb(up) INTO prof FROM public.user_profiles up WHERE up.id = p_user_id;
    RETURN jsonb_build_object(
        'profile', prof,
        'skills', '[]'::jsonb,
        'badges', '[]'::jsonb,
        'work_logs', '[]'::jsonb
    );
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- DOWN (не автоматический, документируем вручную)
-- Для отката: DROP FUNCTION get_user_profile_full, recalc_skills; DROP TABLE ... в обратном порядке.
