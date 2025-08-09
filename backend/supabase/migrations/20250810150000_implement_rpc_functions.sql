-- 20250810150000_implement_rpc_functions.sql
-- Реализация функций recalc_skills и get_user_profile_full (устранение техдолга R1)

-- Обновляем функцию пересчёта навыков
CREATE OR REPLACE FUNCTION public.recalc_skills(p_user_id uuid)
RETURNS SETOF public.skills AS $$
DECLARE
    skill_record RECORD;
    badge_delta INTEGER;
BEGIN
    -- Пересчитываем calculated_level для каждого навыка пользователя
    FOR skill_record IN 
        SELECT id, name, base_level FROM public.skills WHERE user_id = p_user_id
    LOOP
        -- Суммируем дельты от всех бейджей для этого навыка
        SELECT COALESCE(SUM(bsl.delta), 0) INTO badge_delta
        FROM public.badges b
        JOIN public.badge_skill_links bsl ON b.id = bsl.badge_id
        WHERE b.user_id = p_user_id 
        AND bsl.skill_name = skill_record.name;
        
        -- Обновляем calculated_level (base_level + дельты от бейджей)
        -- Ограничиваем диапазон 0-100
        UPDATE public.skills 
        SET calculated_level = GREATEST(0, LEAST(100, skill_record.base_level + badge_delta)),
            updated_at = now()
        WHERE id = skill_record.id;
    END LOOP;
    
    -- Возвращаем обновлённые навыки
    RETURN QUERY 
    SELECT * FROM public.skills 
    WHERE user_id = p_user_id 
    ORDER BY updated_at DESC;
END; 
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Обновляем функцию получения полного профиля
CREATE OR REPLACE FUNCTION public.get_user_profile_full(p_user_id uuid)
RETURNS jsonb AS $$
DECLARE
    profile_data jsonb;
    skills_data jsonb;
    badges_data jsonb;
    work_logs_data jsonb;
    stats_data jsonb;
BEGIN
    -- Получаем основной профиль
    SELECT to_jsonb(up) INTO profile_data 
    FROM public.user_profiles up 
    WHERE up.id = p_user_id;
    
    -- Получаем навыки
    SELECT jsonb_agg(to_jsonb(s)) INTO skills_data
    FROM public.skills s 
    WHERE s.user_id = p_user_id
    ORDER BY s.updated_at DESC;
    
    -- Получаем бейджи с информацией о работодателе
    SELECT jsonb_agg(
        jsonb_build_object(
            'id', b.id,
            'name', b.name,
            'icon_url', b.icon_url,
            'description', b.description,
            'source', b.source,
            'awarded_at', b.awarded_at,
            'employer_name', COALESCE(e.name, 'Неизвестно')
        )
    ) INTO badges_data
    FROM public.badges b 
    LEFT JOIN public.employers e ON b.employer_id = e.id
    WHERE b.user_id = p_user_id
    ORDER BY b.awarded_at DESC;
    
    -- Получаем журнал работы с информацией о работодателе
    SELECT jsonb_agg(
        jsonb_build_object(
            'id', wl.id,
            'period_from', wl.period_from,
            'period_to', wl.period_to,
            'shifts_count', wl.shifts_count,
            'total_hours', wl.total_hours,
            'employer_name', COALESCE(e.name, 'Неизвестно'),
            'employer_logo', e.logo_url
        )
    ) INTO work_logs_data
    FROM public.work_logs wl
    LEFT JOIN public.employers e ON wl.employer_id = e.id
    WHERE wl.user_id = p_user_id
    ORDER BY wl.period_from DESC;
    
    -- Вычисляем агрегированную статистику
    SELECT jsonb_build_object(
        'total_shifts', COALESCE(SUM(wl.shifts_count), 0),
        'total_hours', COALESCE(SUM(wl.total_hours), 0),
        'badges_count', (
            SELECT COUNT(*) FROM public.badges WHERE user_id = p_user_id
        ),
        'average_skill_level', (
            SELECT COALESCE(ROUND(AVG(calculated_level)), 0) 
            FROM public.skills WHERE user_id = p_user_id
        )
    ) INTO stats_data
    FROM public.work_logs wl
    WHERE wl.user_id = p_user_id;
    
    -- Возвращаем агрегированный JSON
    RETURN jsonb_build_object(
        'profile', COALESCE(profile_data, '{}'::jsonb),
        'skills', COALESCE(skills_data, '[]'::jsonb),
        'badges', COALESCE(badges_data, '[]'::jsonb),
        'work_logs', COALESCE(work_logs_data, '[]'::jsonb),
        'stats', COALESCE(stats_data, '{}'::jsonb),
        'generated_at', to_jsonb(now())
    );
END; 
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Создаём функцию автоматической выдачи бейджей (базовая версия)
CREATE OR REPLACE FUNCTION public.auto_award_badges(p_user_id uuid)
RETURNS jsonb AS $$
DECLARE
    total_shifts INTEGER;
    new_badges jsonb := '[]'::jsonb;
    badge_exists BOOLEAN;
BEGIN
    -- Получаем общее количество смен пользователя
    SELECT COALESCE(SUM(shifts_count), 0) INTO total_shifts
    FROM public.work_logs 
    WHERE user_id = p_user_id;
    
    -- Бейдж "Надёжный сотрудник" за 50+ смен
    IF total_shifts >= 50 THEN
        -- Проверяем, нет ли уже такого бейджа
        SELECT EXISTS(
            SELECT 1 FROM public.badges 
            WHERE user_id = p_user_id AND name = 'Надёжный сотрудник'
        ) INTO badge_exists;
        
        IF NOT badge_exists THEN
            INSERT INTO public.badges (user_id, name, icon_url, description, source)
            VALUES (
                p_user_id, 
                'Надёжный сотрудник', 
                '⭐', 
                'Отработал более 50 смен', 
                'auto'
            );
            
            new_badges := new_badges || jsonb_build_object(
                'name', 'Надёжный сотрудник',
                'reason', 'За ' || total_shifts || ' отработанных смен'
            );
        END IF;
    END IF;
    
    -- Бейдж "Профессионал" за 100+ смен
    IF total_shifts >= 100 THEN
        SELECT EXISTS(
            SELECT 1 FROM public.badges 
            WHERE user_id = p_user_id AND name = 'Профессионал'
        ) INTO badge_exists;
        
        IF NOT badge_exists THEN
            INSERT INTO public.badges (user_id, name, icon_url, description, source)
            VALUES (
                p_user_id, 
                'Профессионал', 
                '💎', 
                'Отработал более 100 смен', 
                'auto'
            );
            
            new_badges := new_badges || jsonb_build_object(
                'name', 'Профессионал',
                'reason', 'За ' || total_shifts || ' отработанных смен'
            );
        END IF;
    END IF;
    
    RETURN jsonb_build_object(
        'total_shifts', total_shifts,
        'new_badges', new_badges,
        'checked_at', to_jsonb(now())
    );
END; 
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Создаём триггер для автоматической выдачи бейджей при добавлении work_logs
CREATE OR REPLACE FUNCTION trigger_auto_award_badges()
RETURNS TRIGGER AS $$
BEGIN
    -- Выполняем проверку бейджей в фоне (не блокируем основную операцию)
    PERFORM public.auto_award_badges(NEW.user_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Устанавливаем триггер (только если не существует)
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'work_logs_auto_badges'
    ) THEN
        CREATE TRIGGER work_logs_auto_badges
        AFTER INSERT ON public.work_logs
        FOR EACH ROW
        EXECUTE FUNCTION trigger_auto_award_badges();
    END IF;
END $$;

-- Комментарии для документации
COMMENT ON FUNCTION public.recalc_skills(uuid) IS 'Пересчитывает уровни навыков с учётом дельт от бейджей';
COMMENT ON FUNCTION public.get_user_profile_full(uuid) IS 'Возвращает полный профиль пользователя с навыками, бейджами и опытом';
COMMENT ON FUNCTION public.auto_award_badges(uuid) IS 'Автоматически выдаёт бейджи по достижениям пользователя';

-- DOWN (для отката):
-- DROP TRIGGER IF EXISTS work_logs_auto_badges ON public.work_logs;
-- DROP FUNCTION IF EXISTS trigger_auto_award_badges();
-- DROP FUNCTION IF EXISTS public.auto_award_badges(uuid);
-- Функции recalc_skills и get_user_profile_full оставляем (возврат к заглушкам через отдельную миграцию)
