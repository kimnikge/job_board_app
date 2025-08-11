-- gamification_triggers_fixed.sql
-- ИСПРАВЛЕННАЯ ВЕРСИЯ: Создание триггеров и функций для автоматической системы геймификации

-- Сначала удаляем существующие функции и триггеры если есть
DROP TRIGGER IF EXISTS trigger_award_badges_on_work_log ON public.work_logs;
DROP FUNCTION IF EXISTS public.check_and_award_badges_for_work_log() CASCADE;
DROP FUNCTION IF EXISTS public.auto_award_badge(text, uuid, uuid, text, uuid) CASCADE;
DROP FUNCTION IF EXISTS public.recalculate_user_skills(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.get_user_profile_full(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.award_manual_badge(uuid, uuid, uuid, text) CASCADE;

-- ===========================================
-- ФУНКЦИИ ДЛЯ АВТОМАТИЧЕСКОЙ ВЫДАЧИ БЕЙДЖЕЙ
-- ===========================================

-- Функция для автоматической выдачи бейджа (предотвращает дубликаты)
CREATE OR REPLACE FUNCTION public.auto_award_badge(
    p_badge_name text,
    p_user_id uuid,
    p_employer_id uuid DEFAULT NULL,
    p_reason text DEFAULT 'Автоматически выдан системой',
    p_work_log_id uuid DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    badge_uuid uuid;
    existing_award_id uuid;
BEGIN
    -- Находим ID бейджа по имени
    SELECT id INTO badge_uuid 
    FROM public.badges 
    WHERE name = p_badge_name AND is_company_generated = false
    LIMIT 1;
    
    IF badge_uuid IS NULL THEN
        RAISE WARNING 'Badge not found: %', p_badge_name;
        RETURN false;
    END IF;
    
    -- Проверяем, не выдан ли уже этот бейдж данному пользователю от данного работодателя
    SELECT id INTO existing_award_id 
    FROM public.user_badges 
    WHERE badge_id = badge_uuid 
    AND user_id = p_user_id 
    AND (p_employer_id IS NULL OR employer_id = p_employer_id);
    
    IF existing_award_id IS NOT NULL THEN
        -- Бейдж уже выдан
        RETURN false;
    END IF;
    
    -- Выдаем бейдж
    INSERT INTO public.user_badges (
        badge_id, 
        user_id, 
        employer_id, 
        awarded_at, 
        reason, 
        source,
        work_log_id
    ) VALUES (
        badge_uuid, 
        p_user_id, 
        p_employer_id, 
        now(), 
        p_reason, 
        'auto',
        p_work_log_id
    );
    
    RETURN true;
END;
$$;

-- Функция для пересчета навыков пользователя с учетом бейджей
CREATE OR REPLACE FUNCTION public.recalculate_user_skills(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    skill_record RECORD;
    total_bonus integer;
BEGIN
    -- Для каждого навыка пользователя пересчитываем calculated_level
    FOR skill_record IN 
        SELECT id, name, base_level 
        FROM public.skills 
        WHERE user_id = p_user_id
    LOOP
        -- Считаем суммарный бонус от всех бейджей пользователя
        SELECT COALESCE(SUM(bsl.delta), 0) INTO total_bonus
        FROM public.user_badges ub
        JOIN public.badge_skill_links bsl ON ub.badge_id = bsl.badge_id
        WHERE ub.user_id = p_user_id 
        AND bsl.skill_name = skill_record.name;
        
        -- Обновляем calculated_level (не более 100)
        UPDATE public.skills 
        SET 
            calculated_level = LEAST(100, skill_record.base_level + total_bonus),
            updated_at = now()
        WHERE id = skill_record.id;
    END LOOP;
END;
$$;

-- Функция для проверки и выдачи бейджей на основе work_logs
CREATE OR REPLACE FUNCTION public.check_and_award_badges_for_work_log()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_total_shifts integer;
    user_total_hours real;
    user_work_logs_count integer;
    employer_total_shifts integer;
    performance_avg real;
BEGIN
    -- Считаем общую статистику пользователя
    SELECT 
        COALESCE(SUM(shifts_count), 0),
        COALESCE(SUM(total_hours), 0),
        COUNT(*)
    INTO user_total_shifts, user_total_hours, user_work_logs_count
    FROM public.work_logs 
    WHERE user_id = NEW.user_id;
    
    -- Считаем статистику с текущим работодателем
    SELECT 
        COALESCE(SUM(shifts_count), 0),
        COALESCE(AVG(performance_rating), 0)
    INTO employer_total_shifts, performance_avg
    FROM public.work_logs 
    WHERE user_id = NEW.user_id AND employer_id = NEW.employer_id;
    
    -- ===========================================
    -- EXPERIENCE BADGES (на основе общего опыта)
    -- ===========================================
    
    -- First Steps (Bronze) - первый work_log
    IF user_work_logs_count = 1 THEN
        PERFORM public.auto_award_badge(
            'First Steps', 
            NEW.user_id, 
            NEW.employer_id,
            'Первый опыт работы на платформе',
            NEW.id
        );
    END IF;
    
    -- Growing Professional (Silver) - 50+ смен
    IF user_total_shifts >= 50 THEN
        PERFORM public.auto_award_badge(
            'Growing Professional', 
            NEW.user_id, 
            NULL,
            'Накоплен опыт: ' || user_total_shifts::text || ' смен',
            NEW.id
        );
    END IF;
    
    -- Seasoned Worker (Gold) - 200+ смен
    IF user_total_shifts >= 200 THEN
        PERFORM public.auto_award_badge(
            'Seasoned Worker', 
            NEW.user_id, 
            NULL,
            'Опытный специалист: ' || user_total_shifts::text || ' смен',
            NEW.id
        );
    END IF;
    
    -- Industry Veteran (Platinum) - 500+ смен
    IF user_total_shifts >= 500 THEN
        PERFORM public.auto_award_badge(
            'Industry Veteran', 
            NEW.user_id, 
            NULL,
            'Ветеран индустрии: ' || user_total_shifts::text || ' смен',
            NEW.id
        );
    END IF;
    
    -- ===========================================
    -- LOYALTY BADGES (на основе работы с конкретным работодателем)
    -- ===========================================
    
    -- Newcomer (Bronze) - первая работа с работодателем
    IF employer_total_shifts = NEW.shifts_count THEN
        PERFORM public.auto_award_badge(
            'Newcomer', 
            NEW.user_id, 
            NEW.employer_id,
            'Начало сотрудничества с работодателем',
            NEW.id
        );
    END IF;
    
    -- Regular Member (Silver) - 20+ смен с одним работодателем
    IF employer_total_shifts >= 20 THEN
        PERFORM public.auto_award_badge(
            'Regular Member', 
            NEW.user_id, 
            NEW.employer_id,
            'Регулярное сотрудничество: ' || employer_total_shifts::text || ' смен',
            NEW.id
        );
    END IF;
    
    -- Loyal Partner (Gold) - 50+ смен с одним работодателем
    IF employer_total_shifts >= 50 THEN
        PERFORM public.auto_award_badge(
            'Loyal Partner', 
            NEW.user_id, 
            NEW.employer_id,
            'Преданный партнер: ' || employer_total_shifts::text || ' смен',
            NEW.id
        );
    END IF;
    
    -- Platform Ambassador (Platinum) - 100+ смен с одним работодателем
    IF employer_total_shifts >= 100 THEN
        PERFORM public.auto_award_badge(
            'Platform Ambassador', 
            NEW.user_id, 
            NEW.employer_id,
            'Амбассадор: ' || employer_total_shifts::text || ' смен',
            NEW.id
        );
    END IF;
    
    -- ===========================================
    -- PERFORMANCE BADGES (на основе рейтинга)
    -- ===========================================
    
    -- Проверяем рейтинг только если есть данные
    IF NEW.performance_rating IS NOT NULL AND performance_avg > 0 THEN
        
        -- Excellence Seeker (Gold) - средний рейтинг 4.5+
        IF performance_avg >= 4.5 AND employer_total_shifts >= 10 THEN
            PERFORM public.auto_award_badge(
                'Excellence Seeker', 
                NEW.user_id, 
                NEW.employer_id,
                'Стремление к совершенству: рейтинг ' || ROUND(performance_avg::numeric, 1)::text,
                NEW.id
            );
        END IF;
        
        -- Exceptional Performer (Platinum) - средний рейтинг 4.8+
        IF performance_avg >= 4.8 AND employer_total_shifts >= 20 THEN
            PERFORM public.auto_award_badge(
                'Exceptional Performer', 
                NEW.user_id, 
                NEW.employer_id,
                'Исключительные достижения: рейтинг ' || ROUND(performance_avg::numeric, 1)::text,
                NEW.id
            );
        END IF;
        
    END IF;
    
    -- ===========================================
    -- ПЕРЕСЧИТЫВАЕМ НАВЫКИ ПОСЛЕ ВЫДАЧИ БЕЙДЖЕЙ
    -- ===========================================
    PERFORM public.recalculate_user_skills(NEW.user_id);
    
    RETURN NEW;
END;
$$;

-- ===========================================
-- СОЗДАНИЕ ТРИГГЕРОВ
-- ===========================================

-- Создаем триггер на добавление/обновление work_logs
CREATE TRIGGER trigger_award_badges_on_work_log
    AFTER INSERT OR UPDATE ON public.work_logs
    FOR EACH ROW
    EXECUTE FUNCTION public.check_and_award_badges_for_work_log();

-- ===========================================
-- RPC ФУНКЦИИ ДЛЯ ФРОНТЕНДА
-- ===========================================

-- Функция для получения полного профиля пользователя с бейджами и навыками
CREATE OR REPLACE FUNCTION public.get_user_profile_full(p_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result json;
BEGIN
    SELECT json_build_object(
        'profile', (
            SELECT json_build_object(
                'id', id,
                'email', email,
                'full_name', full_name,
                'phone', phone,
                'location', location,
                'bio', bio,
                'avatar_url', avatar_url,
                'experience_years', experience_years,
                'total_rating', total_rating,
                'is_available', is_available,
                'created_at', created_at
            )
            FROM public.user_profiles 
            WHERE id = p_user_id
        ),
        'badges', (
            SELECT COALESCE(json_agg(
                json_build_object(
                    'id', ub.id,
                    'badge', json_build_object(
                        'name', b.name,
                        'description', b.description,
                        'icon_url', b.icon_url,
                        'category', b.category,
                        'level', b.level
                    ),
                    'awarded_at', ub.awarded_at,
                    'reason', ub.reason,
                    'source', ub.source,
                    'employer_name', e.name
                )
            ), '[]'::json)
            FROM public.user_badges ub
            JOIN public.badges b ON ub.badge_id = b.id
            LEFT JOIN public.employers e ON ub.employer_id = e.id
            WHERE ub.user_id = p_user_id
            ORDER BY ub.awarded_at DESC
        ),
        'skills', (
            SELECT COALESCE(json_agg(
                json_build_object(
                    'name', name,
                    'base_level', base_level,
                    'calculated_level', calculated_level,
                    'badge_bonus', calculated_level - base_level
                )
            ), '[]'::json)
            FROM public.skills
            WHERE user_id = p_user_id
            ORDER BY calculated_level DESC
        ),
        'stats', (
            SELECT json_build_object(
                'total_badges', COUNT(ub.id),
                'bronze_badges', COUNT(ub.id) FILTER (WHERE b.level = 'Bronze'),
                'silver_badges', COUNT(ub.id) FILTER (WHERE b.level = 'Silver'),
                'gold_badges', COUNT(ub.id) FILTER (WHERE b.level = 'Gold'),
                'platinum_badges', COUNT(ub.id) FILTER (WHERE b.level = 'Platinum'),
                'total_shifts', COALESCE(SUM(wl.shifts_count), 0),
                'total_hours', COALESCE(SUM(wl.total_hours), 0),
                'avg_rating', COALESCE(AVG(wl.performance_rating), 0)
            )
            FROM public.user_badges ub
            JOIN public.badges b ON ub.badge_id = b.id
            LEFT JOIN public.work_logs wl ON wl.user_id = p_user_id
            WHERE ub.user_id = p_user_id
        )
    ) INTO result;
    
    RETURN result;
END;
$$;

-- Функция для ручной выдачи бейджа работодателем
CREATE OR REPLACE FUNCTION public.award_manual_badge(
    p_badge_id uuid,
    p_user_id uuid,
    p_employer_id uuid,
    p_reason text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result json;
    badge_name text;
BEGIN
    -- Проверяем существование бейджа
    SELECT name INTO badge_name
    FROM public.badges
    WHERE id = p_badge_id;
    
    IF badge_name IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Badge not found');
    END IF;
    
    -- Проверяем, не выдан ли уже бейдж
    IF EXISTS (
        SELECT 1 FROM public.user_badges 
        WHERE badge_id = p_badge_id 
        AND user_id = p_user_id 
        AND employer_id = p_employer_id
    ) THEN
        RETURN json_build_object('success', false, 'error', 'Badge already awarded');
    END IF;
    
    -- Выдаем бейдж
    INSERT INTO public.user_badges (
        badge_id, user_id, employer_id, awarded_by, reason, source
    ) VALUES (
        p_badge_id, p_user_id, p_employer_id, p_employer_id, p_reason, 'manual'
    );
    
    -- Пересчитываем навыки
    PERFORM public.recalculate_user_skills(p_user_id);
    
    RETURN json_build_object(
        'success', true, 
        'message', 'Badge "' || badge_name || '" awarded successfully'
    );
END;
$$;

-- Успешное завершение создания триггеров
SELECT 'Gamification triggers and functions created successfully! (FIXED VERSION)' as status;
