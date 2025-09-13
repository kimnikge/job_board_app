-- 20250809122000_create_profile_videos_bucket.sql
-- Создание приватного bucket profile_videos + RLS политики на storage.objects
-- Идемпотентно: вставка bucket IF NOT EXISTS через ON CONFLICT

-- Создаём bucket (таблица storage.buckets)
INSERT INTO storage.buckets (id, name, public) VALUES ('profile_videos','profile_videos', false)
ON CONFLICT (id) DO NOTHING;

-- Политики для storage.objects привязанные к bucket_id='profile_videos'
-- SELECT свои файлы
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname='profile_videos_select_own' AND tablename='objects'
    ) THEN
        CREATE POLICY profile_videos_select_own ON storage.objects FOR SELECT
            USING (bucket_id = 'profile_videos' AND owner = auth.uid());
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname='profile_videos_insert_own' AND tablename='objects'
    ) THEN
        CREATE POLICY profile_videos_insert_own ON storage.objects FOR INSERT
            WITH CHECK (bucket_id = 'profile_videos' AND owner = auth.uid());
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname='profile_videos_delete_own' AND tablename='objects'
    ) THEN
        CREATE POLICY profile_videos_delete_own ON storage.objects FOR DELETE
            USING (bucket_id = 'profile_videos' AND owner = auth.uid());
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname='profile_videos_update_own' AND tablename='objects'
    ) THEN
        CREATE POLICY profile_videos_update_own ON storage.objects FOR UPDATE
            USING (bucket_id = 'profile_videos' AND owner = auth.uid())
            WITH CHECK (bucket_id = 'profile_videos' AND owner = auth.uid());
    END IF;
END $$;

-- NOTE: В Supabase RLS для storage.objects уже включён по умолчанию.
-- DOWN: DELETE FROM storage.objects WHERE bucket_id='profile_videos'; DELETE FROM storage.buckets WHERE id='profile_videos';
