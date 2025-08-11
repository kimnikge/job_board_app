-- 20250811122000_create_company_badge_function.sql
-- Добавление функции для создания корпоративных бейджей (R4)

CREATE OR REPLACE FUNCTION public.create_company_badge(
    p_company_id uuid,
    p_name text,
    p_description text,
    p_icon_url text DEFAULT NULL,
    p_category text DEFAULT 'Company',
    p_level text DEFAULT 'Bronze',
    p_skill_bonuses jsonb DEFAULT '{}'::jsonb
)
RETURNS TABLE(
    id uuid,
    name text,
    description text,
    icon_url text,
    category text,
    level text,
    is_company_generated boolean,
    company_id uuid,
    created_at timestamptz
) AS $$
DECLARE
    new_badge_id uuid;
    skill_entry jsonb;
BEGIN
    -- Проверяем права компании на создание бейджей
    IF NOT EXISTS (
        SELECT 1 FROM public.employers 
        WHERE id = p_company_id AND can_create_badges = true
    ) THEN
        RAISE EXCEPTION 'Company % is not authorized to create badges', p_company_id;
    END IF;

    -- Проверяем уникальность названия бейджа в рамках компании
    IF EXISTS (
        SELECT 1 FROM public.badges 
        WHERE name = p_name 
        AND company_id = p_company_id 
        AND is_company_generated = true
    ) THEN
        RAISE EXCEPTION 'Badge with name % already exists for company %', p_name, p_company_id;
    END IF;

    -- Создаем новый бейдж
    INSERT INTO public.badges (
        name,
        description,
        icon_url,
        category,
        level,
        is_company_generated,
        company_id
    ) VALUES (
        p_name,
        p_description,
        p_icon_url,
        p_category,
        p_level,
        true,
        p_company_id
    ) RETURNING badges.id INTO new_badge_id;

    -- Добавляем связи с навыками если переданы
    IF jsonb_typeof(p_skill_bonuses) = 'object' THEN
        FOR skill_entry IN SELECT * FROM jsonb_each(p_skill_bonuses) LOOP
            INSERT INTO public.badge_skill_links (
                badge_id,
                skill_name,
                delta
            ) VALUES (
                new_badge_id,
                skill_entry.key,
                (skill_entry.value)::int
            );
        END LOOP;
    END IF;

    -- Возвращаем созданный бейдж
    RETURN QUERY
    SELECT 
        b.id,
        b.name,
        b.description,
        b.icon_url,
        b.category,
        b.level,
        b.is_company_generated,
        b.company_id,
        b.created_at
    FROM public.badges b
    WHERE b.id = new_badge_id;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Комментарий для документации
COMMENT ON FUNCTION public.create_company_badge(uuid, text, text, text, text, text, jsonb) IS 
'Создает корпоративный бейдж с возможностью указания бонусов к навыкам. Только для авторизованных компаний.';

-- Права доступа (только для аутентифицированных пользователей)
GRANT EXECUTE ON FUNCTION public.create_company_badge(uuid, text, text, text, text, text, jsonb) TO authenticated;
