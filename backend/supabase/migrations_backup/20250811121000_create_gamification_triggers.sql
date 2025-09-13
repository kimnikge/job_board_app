-- 20250811121000_create_gamification_triggers.sql
-- Создание триггеров и функций для автоматической геймификации

-- Функция автоматической выдачи бейджей по количеству смен
CREATE OR REPLACE FUNCTION public.assign_shift_badges()
RETURNS TRIGGER AS $$
DECLARE
    total_shifts int;
    badge_record record;
BEGIN
    -- Подсчитываем общее количество смен пользователя
    SELECT COALESCE(SUM(shifts_count), 0) INTO total_shifts
    FROM public.work_logs 
    WHERE user_id = NEW.user_id;
    
    -- Проверяем условия для выдачи бейджей и выдаем если еще не выданы
    FOR badge_record IN (
        SELECT b.id, b.name, b.description
        FROM public.badges b
        WHERE b.name IN ('5 Shifts', '25 Shifts', '50 Shifts', '100 Shifts')
        AND NOT EXISTS (
            SELECT 1 FROM public.user_badges ub 
            WHERE ub.user_id = NEW.user_id AND ub.badge_id = b.id
        )
    ) LOOP
        -- Логика проверки условий
        IF (badge_record.name = '5 Shifts' AND total_shifts >= 5) OR
           (badge_record.name = '25 Shifts' AND total_shifts >= 25) OR  
           (badge_record.name = '50 Shifts' AND total_shifts >= 50) OR
           (badge_record.name = '100 Shifts' AND total_shifts >= 100) THEN
            
            -- Выдаем бейдж
            INSERT INTO public.user_badges (
                badge_id, 
                user_id, 
                employer_id, 
                source, 
                reason,
                work_log_id
            ) VALUES (
                badge_record.id,
                NEW.user_id,
                NEW.employer_id,
                'auto',
                'Достигнуто ' || badge_record.name || ' (общий счетчик: ' || total_shifts || ')',
                NEW.id
            );
            
            -- Логируем выдачу (для отладки)
            RAISE NOTICE 'Auto-awarded badge % to user % for % shifts', 
                badge_record.name, NEW.user_id, total_shifts;
        END IF;
    END LOOP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Функция для проверки ночных смен (работа после 22:00 или до 6:00)
CREATE OR REPLACE FUNCTION public.assign_night_badges()
RETURNS TRIGGER AS $$
DECLARE
    night_shifts_count int;
    badge_id uuid;
BEGIN
    -- Считаем количество work_logs где могли быть ночные смены
    -- Упрощенная логика: если period_to - period_from > 10 дней, считаем что были ночные
    SELECT COUNT(*) INTO night_shifts_count
    FROM public.work_logs
    WHERE user_id = NEW.user_id 
    AND (period_to::date - period_from::date) >= 10;
    
    -- Если накопилось достаточно "ночных" записей и бейдж еще не выдан
    IF night_shifts_count >= 3 THEN
        SELECT id INTO badge_id 
        FROM public.badges 
        WHERE name = 'Night Owl' 
        LIMIT 1;
        
        IF badge_id IS NOT NULL AND NOT EXISTS (
            SELECT 1 FROM public.user_badges 
            WHERE user_id = NEW.user_id AND badge_id = badge_id
        ) THEN
            INSERT INTO public.user_badges (
                badge_id, user_id, employer_id, source, reason, work_log_id
            ) VALUES (
                badge_id, NEW.user_id, NEW.employer_id, 'auto',
                'Опыт работы в ночные смены (' || night_shifts_count || ' периодов)', NEW.id
            );
            
            RAISE NOTICE 'Auto-awarded Night Owl badge to user %', NEW.user_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Функция пересчета calculated_level навыков при получении бейджа
CREATE OR REPLACE FUNCTION public.recalc_user_skills_on_badge()
RETURNS TRIGGER AS $$
DECLARE
    skill_link record;
BEGIN
    -- Находим все связи нового бейджа с навыками
    FOR skill_link IN (
        SELECT skill_name, delta
        FROM public.badge_skill_links
        WHERE badge_id = NEW.badge_id
    ) LOOP
        -- Обновляем или создаем навык
        INSERT INTO public.skills (user_id, name, category, base_level, calculated_level)
        VALUES (
            NEW.user_id,
            skill_link.skill_name,
            'other', -- дефолтная категория
            0, -- base_level по умолчанию
            skill_link.delta -- начальный calculated_level
        )
        ON CONFLICT (user_id, name) DO UPDATE SET
            calculated_level = skills.base_level + (
                SELECT COALESCE(SUM(bsl.delta), 0)
                FROM public.user_badges ub
                JOIN public.badge_skill_links bsl ON ub.badge_id = bsl.badge_id
                WHERE ub.user_id = NEW.user_id 
                AND bsl.skill_name = skill_link.skill_name
            ),
            updated_at = now();
            
        RAISE NOTICE 'Updated skill % for user % (delta: %)', 
            skill_link.skill_name, NEW.user_id, skill_link.delta;
    END LOOP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Создаем триггеры
CREATE TRIGGER work_log_shift_badges_trigger
    AFTER INSERT OR UPDATE ON public.work_logs
    FOR EACH ROW 
    EXECUTE FUNCTION public.assign_shift_badges();

CREATE TRIGGER work_log_night_badges_trigger
    AFTER INSERT OR UPDATE ON public.work_logs
    FOR EACH ROW 
    EXECUTE FUNCTION public.assign_night_badges();

CREATE TRIGGER user_badges_skill_recalc_trigger
    AFTER INSERT ON public.user_badges
    FOR EACH ROW 
    EXECUTE FUNCTION public.recalc_user_skills_on_badge();

-- Обновляем RPC функцию recalc_skills для ручного пересчета
CREATE OR REPLACE FUNCTION public.recalc_skills(p_user_id uuid)
RETURNS SETOF public.skills AS $$
DECLARE
    skill_record record;
BEGIN
    -- Пересчитываем calculated_level для всех навыков пользователя
    FOR skill_record IN (
        SELECT DISTINCT name FROM public.skills WHERE user_id = p_user_id
        UNION
        SELECT DISTINCT skill_name as name FROM public.badge_skill_links bsl
        JOIN public.user_badges ub ON bsl.badge_id = ub.badge_id
        WHERE ub.user_id = p_user_id
    ) LOOP
        -- Обновляем calculated_level
        UPDATE public.skills SET
            calculated_level = base_level + COALESCE((
                SELECT SUM(bsl.delta)
                FROM public.user_badges ub
                JOIN public.badge_skill_links bsl ON ub.badge_id = bsl.badge_id
                WHERE ub.user_id = p_user_id 
                AND bsl.skill_name = skill_record.name
            ), 0),
            updated_at = now()
        WHERE user_id = p_user_id AND name = skill_record.name;
        
        -- Создаем навык если не существует
        INSERT INTO public.skills (user_id, name, category, base_level, calculated_level)
        SELECT 
            p_user_id,
            skill_record.name,
            'other',
            0,
            COALESCE((
                SELECT SUM(bsl.delta)
                FROM public.user_badges ub
                JOIN public.badge_skill_links bsl ON ub.badge_id = bsl.badge_id
                WHERE ub.user_id = p_user_id 
                AND bsl.skill_name = skill_record.name
            ), 0)
        WHERE NOT EXISTS (
            SELECT 1 FROM public.skills 
            WHERE user_id = p_user_id AND name = skill_record.name
        );
    END LOOP;
    
    -- Возвращаем обновленные навыки
    RETURN QUERY 
    SELECT * FROM public.skills 
    WHERE user_id = p_user_id 
    ORDER BY calculated_level DESC, name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Функция для ручной выдачи бейджа (для работодателей)
CREATE OR REPLACE FUNCTION public.award_manual_badge(
    p_badge_id uuid,
    p_user_id uuid, 
    p_employer_id uuid,
    p_reason text DEFAULT NULL
) RETURNS uuid AS $$
DECLARE
    awarded_by_id uuid;
    new_award_id uuid;
BEGIN
    -- Получаем ID текущего пользователя (тот кто выдает бейдж)
    SELECT id INTO awarded_by_id 
    FROM public.user_profiles 
    WHERE auth_user_id = auth.uid();
    
    IF awarded_by_id IS NULL THEN
        RAISE EXCEPTION 'Unauthorized: unable to identify awarding user';
    END IF;
    
    -- Проверяем что бейдж существует
    IF NOT EXISTS (SELECT 1 FROM public.badges WHERE id = p_badge_id) THEN
        RAISE EXCEPTION 'Badge not found: %', p_badge_id;
    END IF;
    
    -- Проверяем что пользователь существует
    IF NOT EXISTS (SELECT 1 FROM public.user_profiles WHERE id = p_user_id) THEN
        RAISE EXCEPTION 'User not found: %', p_user_id;
    END IF;
    
    -- Проверяем что бейдж еще не выдан этому пользователю
    IF EXISTS (
        SELECT 1 FROM public.user_badges 
        WHERE badge_id = p_badge_id AND user_id = p_user_id
    ) THEN
        RAISE EXCEPTION 'Badge already awarded to this user';
    END IF;
    
    -- Выдаем бейдж
    INSERT INTO public.user_badges (
        badge_id, user_id, employer_id, awarded_by, source, reason
    ) VALUES (
        p_badge_id, p_user_id, p_employer_id, awarded_by_id, 'manual', p_reason
    ) RETURNING id INTO new_award_id;
    
    RETURN new_award_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Функция получения полного профиля (обновленная)
CREATE OR REPLACE FUNCTION public.get_user_profile_full(p_user_id uuid)
RETURNS jsonb AS $$
DECLARE
    profile_data jsonb;
    skills_data jsonb;
    badges_data jsonb;
    work_logs_data jsonb;
BEGIN
    -- Получаем основной профиль
    SELECT to_jsonb(up.*) INTO profile_data 
    FROM public.user_profiles up 
    WHERE up.id = p_user_id;
    
    -- Получаем навыки
    SELECT COALESCE(jsonb_agg(to_jsonb(s.*)), '[]'::jsonb) INTO skills_data
    FROM public.skills s 
    WHERE s.user_id = p_user_id
    ORDER BY s.calculated_level DESC, s.name;
    
    -- Получаем бейджи с деталями
    SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
            'id', ub.id,
            'badge_id', ub.badge_id,
            'name', b.name,
            'description', b.description,
            'icon_url', b.icon_url,
            'category', b.category,
            'level', b.level,
            'source', ub.source,
            'awarded_at', ub.awarded_at,
            'reason', ub.reason,
            'employer_name', e.name
        ) ORDER BY ub.awarded_at DESC
    ), '[]'::jsonb) INTO badges_data
    FROM public.user_badges ub
    JOIN public.badges b ON ub.badge_id = b.id
    LEFT JOIN public.employers e ON ub.employer_id = e.id
    WHERE ub.user_id = p_user_id;
    
    -- Получаем историю работы
    SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
            'id', wl.id,
            'employer_name', e.name,
            'employer_logo', e.logo_url,
            'period_from', wl.period_from,
            'period_to', wl.period_to,
            'shifts_count', wl.shifts_count,
            'total_hours', wl.total_hours
        ) ORDER BY wl.period_to DESC
    ), '[]'::jsonb) INTO work_logs_data
    FROM public.work_logs wl
    JOIN public.employers e ON wl.employer_id = e.id
    WHERE wl.user_id = p_user_id;
    
    -- Возвращаем агрегированный результат
    RETURN jsonb_build_object(
        'profile', profile_data,
        'skills', skills_data,
        'badges', badges_data,
        'work_logs', work_logs_data,
        'stats', jsonb_build_object(
            'total_badges', jsonb_array_length(badges_data),
            'total_skills', jsonb_array_length(skills_data),
            'total_shifts', (
                SELECT COALESCE(SUM(shifts_count), 0) 
                FROM public.work_logs WHERE user_id = p_user_id
            ),
            'total_hours', (
                SELECT COALESCE(SUM(total_hours), 0) 
                FROM public.work_logs WHERE user_id = p_user_id
            )
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
