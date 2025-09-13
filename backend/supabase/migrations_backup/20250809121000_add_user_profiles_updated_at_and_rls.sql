-- 20250809121000_add_user_profiles_updated_at_and_rls.sql
-- Добавляем (если отсутствует) триггер updated_at для user_profiles и базовые RLS политики владения.

-- Проверка и создание столбца updated_at (если вдруг отсутствует)
ALTER TABLE IF EXISTS public.user_profiles
    ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- Общая функция set_updated_at уже создавалась в baseline, создаём на случай отсутствия
CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS trigger AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END; $$ LANGUAGE plpgsql;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_user_profiles') THEN
        CREATE TRIGGER set_updated_at_user_profiles
        BEFORE UPDATE ON public.user_profiles
        FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
    END IF;
END $$;

-- Включаем RLS (если не включён)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    -- SELECT
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_profiles' AND policyname = 'user_profiles_select_own') THEN
        CREATE POLICY user_profiles_select_own ON public.user_profiles FOR SELECT USING (auth.uid() = auth_user_id);
    END IF;
    -- UPDATE
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_profiles' AND policyname = 'user_profiles_update_own') THEN
        CREATE POLICY user_profiles_update_own ON public.user_profiles FOR UPDATE USING (auth.uid() = auth_user_id) WITH CHECK (auth.uid() = auth_user_id);
    END IF;
    -- DELETE
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_profiles' AND policyname = 'user_profiles_delete_own') THEN
        CREATE POLICY user_profiles_delete_own ON public.user_profiles FOR DELETE USING (auth.uid() = auth_user_id);
    END IF;
END $$;

-- (Не добавляем INSERT политику: создание записи управляется провиженингом на signup.)
