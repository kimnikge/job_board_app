-- =============================================================================
-- ОБНОВЛЕНИЕ ПЛАТЕЖНОЙ СИСТЕМЫ ДЛЯ FREEMIUM МОДЕЛИ
-- Дата: 7 сентября 2025
-- Описание: Добавляем поддержку freemium с автоназначением бесплатных планов
-- =============================================================================

-- Создаем таблицу планов подписки (простая структура)
CREATE TABLE IF NOT EXISTS subscription_plans (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL UNIQUE, -- 'free', 'basic', 'premium'
    display_name text NOT NULL,
    description text,
    
    -- Лимиты функций
    max_job_postings integer DEFAULT 0,
    max_urgent_postings integer DEFAULT 0,
    max_featured_postings integer DEFAULT 0,
    custom_badges boolean DEFAULT false,
    analytics_access boolean DEFAULT false,
    priority_support boolean DEFAULT false,
    
    -- Стоимость
    price_monthly decimal(10,2) DEFAULT 0.00,
    price_yearly decimal(10,2) DEFAULT 0.00,
    currency text DEFAULT 'KZT',
    
    -- Статус
    is_active boolean DEFAULT true,
    is_public boolean DEFAULT true, -- показывать ли в публичном списке
    
    -- Метаданные
    features jsonb DEFAULT '[]'::jsonb, -- список фич в JSON
    restrictions jsonb DEFAULT '{}'::jsonb, -- ограничения в JSON
    
    created_at timestamp DEFAULT now(),
    updated_at timestamp DEFAULT now()
);

-- Логи использования функций (для мониторинга и будущих ограничений)
CREATE TABLE IF NOT EXISTS usage_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    action_type text NOT NULL, -- 'job_post', 'urgent_post', 'featured_post', 'badge_create'
    resource_id uuid, -- ID связанного ресурса (вакансии, бейджа и т.д.)
    metadata jsonb DEFAULT '{}'::jsonb, -- дополнительные данные
    created_at timestamp DEFAULT now()
);

-- Обновляем существующую таблицу company_subscriptions
ALTER TABLE company_subscriptions 
ADD COLUMN IF NOT EXISTS plan_id uuid REFERENCES subscription_plans(id),
ADD COLUMN IF NOT EXISTS activated_by uuid REFERENCES auth.users(id), -- кто активировал (админ)
ADD COLUMN IF NOT EXISTS notes text; -- заметки админа

-- Добавляем индексы для новых таблиц
CREATE INDEX IF NOT EXISTS idx_subscription_plans_active ON subscription_plans(is_active);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_public ON subscription_plans(is_public);
CREATE INDEX IF NOT EXISTS idx_usage_logs_company ON usage_logs(company_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_action ON usage_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_usage_logs_date ON usage_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_company_subscriptions_plan ON company_subscriptions(plan_id);

-- Включаем RLS для новых таблиц
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;

-- RLS политики для subscription_plans
CREATE POLICY "Everyone can view public subscription plans" ON subscription_plans
    FOR SELECT USING (is_public = true AND is_active = true);

CREATE POLICY "Admins can manage all subscription plans" ON subscription_plans
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE telegram_id = (auth.jwt() ->> 'telegram_id')::bigint 
            AND role = 'admin'
        )
    );

-- RLS политики для usage_logs
CREATE POLICY "Companies can view own usage logs" ON usage_logs
    FOR SELECT USING (
        company_id IN (
            SELECT id FROM companies 
            WHERE telegram_id = (auth.jwt() ->> 'telegram_id')::bigint
        )
    );

CREATE POLICY "Admins can view all usage logs" ON usage_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE telegram_id = (auth.jwt() ->> 'telegram_id')::bigint 
            AND role = 'admin'
        )
    );

CREATE POLICY "System can insert usage logs" ON usage_logs
    FOR INSERT WITH CHECK (true); -- Разрешаем системе логировать

-- =============================================================================
-- НАЧАЛЬНЫЕ ДАННЫЕ
-- =============================================================================

-- Создаем базовые планы подписки
INSERT INTO subscription_plans (
    name, 
    display_name, 
    description,
    max_job_postings,
    max_urgent_postings,
    max_featured_postings,
    custom_badges,
    analytics_access,
    priority_support,
    price_monthly,
    features
) VALUES 
-- Бесплатный план (пока без ограничений для freemium периода)
(
    'free',
    'Бесплатный',
    'Базовый функционал для начала работы',
    999999, -- пока без ограничений
    999999,
    999999,
    false,
    false,
    false,
    0.00,
    '["Размещение вакансий", "Поиск кандидатов", "Базовая статистика"]'::jsonb
),
-- Базовый план (для будущего)
(
    'basic',
    'Базовый',
    'Расширенные возможности для активных работодателей',
    50,
    10,
    5,
    true,
    true,
    false,
    9900.00,
    '["До 50 вакансий в месяц", "До 10 срочных вакансий", "Кастомные бейджи", "Аналитика"]'::jsonb
),
-- Премиум план (для будущего)
(
    'premium',
    'Премиум',
    'Полный функционал для крупных работодателей',
    999999,
    999999,
    999999,
    true,
    true,
    true,
    19900.00,
    '["Безлимитные вакансии", "Приоритетная поддержка", "Расширенная аналитика", "API доступ"]'::jsonb
);

-- Создаем базовые настройки монетизации
INSERT INTO monetization_settings (key, value, description) VALUES 
('payments_enabled', 'false', 'Включены ли платежи в системе'),
('freemium_mode', 'true', 'Режим freemium - все функции бесплатно'),
('default_plan', 'free', 'План по умолчанию для новых пользователей'),
('grace_period_days', '7', 'Льготный период после истечения подписки'),
('notification_days_before_expiry', '3', 'За сколько дней уведомлять об истечении')
ON CONFLICT (key) DO NOTHING;

-- =============================================================================
-- ФУНКЦИИ И ТРИГГЕРЫ
-- =============================================================================

-- Функция для автоматического назначения Free плана новым компаниям
CREATE OR REPLACE FUNCTION assign_free_plan_to_new_company()
RETURNS TRIGGER AS $$
DECLARE
    free_plan_id uuid;
BEGIN
    -- Получаем ID бесплатного плана
    SELECT id INTO free_plan_id 
    FROM subscription_plans 
    WHERE name = 'free' AND is_active = true
    LIMIT 1;
    
    -- Если бесплатный план найден, создаем подписку
    IF free_plan_id IS NOT NULL THEN
        INSERT INTO company_subscriptions (
            company_id,
            plan_id,
            subscription_type,
            status,
            started_at
        ) VALUES (
            NEW.id,
            free_plan_id,
            'free',
            'active',
            now()
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Триггер для автоназначения Free плана
DROP TRIGGER IF EXISTS trigger_assign_free_plan ON companies;
CREATE TRIGGER trigger_assign_free_plan
    AFTER INSERT ON companies
    FOR EACH ROW
    EXECUTE FUNCTION assign_free_plan_to_new_company();

-- Функция для проверки лимитов (пока возвращает true для всех)
CREATE OR REPLACE FUNCTION check_usage_limit(
    p_company_id uuid,
    p_action_type text,
    p_period_days integer DEFAULT 30
) RETURNS jsonb AS $$
DECLARE
    subscription_record record;
    usage_count integer;
    limit_field text;
    current_limit integer;
    result jsonb;
BEGIN
    -- Получаем активную подписку компании
    SELECT cs.*, sp.*
    INTO subscription_record
    FROM company_subscriptions cs
    JOIN subscription_plans sp ON cs.plan_id = sp.id
    WHERE cs.company_id = p_company_id 
    AND cs.status = 'active'
    LIMIT 1;
    
    -- Если подписки нет, возвращаем разрешение (freemium)
    IF subscription_record IS NULL THEN
        RETURN jsonb_build_object(
            'allowed', true,
            'limit', 999999,
            'used', 0,
            'remaining', 999999,
            'message', 'No subscription found - freemium mode'
        );
    END IF;
    
    -- Определяем поле лимита
    CASE p_action_type
        WHEN 'job_post' THEN limit_field := 'max_job_postings';
        WHEN 'urgent_post' THEN limit_field := 'max_urgent_postings';
        WHEN 'featured_post' THEN limit_field := 'max_featured_postings';
        ELSE limit_field := 'max_job_postings';
    END CASE;
    
    -- Получаем лимит из плана
    EXECUTE format('SELECT %I FROM subscription_plans WHERE id = $1', limit_field)
    INTO current_limit
    USING subscription_record.plan_id;
    
    -- Считаем использование за период
    SELECT COUNT(*)
    INTO usage_count
    FROM usage_logs
    WHERE company_id = p_company_id
    AND action_type = p_action_type
    AND created_at >= (now() - (p_period_days || ' days')::interval);
    
    -- Формируем результат
    result := jsonb_build_object(
        'allowed', usage_count < current_limit,
        'limit', current_limit,
        'used', usage_count,
        'remaining', GREATEST(0, current_limit - usage_count),
        'plan_name', subscription_record.name
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Функция для логирования использования
CREATE OR REPLACE FUNCTION log_usage(
    p_company_id uuid,
    p_action_type text,
    p_resource_id uuid DEFAULT NULL,
    p_metadata jsonb DEFAULT '{}'::jsonb
) RETURNS uuid AS $$
DECLARE
    log_id uuid;
BEGIN
    INSERT INTO usage_logs (company_id, action_type, resource_id, metadata)
    VALUES (p_company_id, p_action_type, p_resource_id, p_metadata)
    RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- VIEWS ДЛЯ УДОБСТВА
-- =============================================================================

-- Представление для администраторов - статистика подписок
CREATE OR REPLACE VIEW admin_subscription_stats AS
SELECT 
    sp.name as plan_name,
    sp.display_name,
    COUNT(cs.id) as active_subscriptions,
    COUNT(cs.id) FILTER (WHERE cs.created_at >= now() - interval '30 days') as new_this_month,
    SUM(sp.price_monthly) as monthly_revenue_potential
FROM subscription_plans sp
LEFT JOIN company_subscriptions cs ON cs.plan_id = sp.id AND cs.status = 'active'
GROUP BY sp.id, sp.name, sp.display_name, sp.price_monthly
ORDER BY sp.price_monthly;

-- Представление для компаний - их использование
CREATE OR REPLACE VIEW company_usage_summary AS
SELECT 
    c.id as company_id,
    c.name as company_name,
    cs.subscription_type,
    sp.display_name as plan_name,
    COUNT(ul.id) FILTER (WHERE ul.action_type = 'job_post' AND ul.created_at >= now() - interval '30 days') as jobs_posted_30d,
    COUNT(ul.id) FILTER (WHERE ul.action_type = 'urgent_post' AND ul.created_at >= now() - interval '30 days') as urgent_posts_30d,
    sp.max_job_postings,
    sp.max_urgent_postings,
    cs.status as subscription_status
FROM companies c
LEFT JOIN company_subscriptions cs ON cs.company_id = c.id AND cs.status = 'active'
LEFT JOIN subscription_plans sp ON cs.plan_id = sp.id
LEFT JOIN usage_logs ul ON ul.company_id = c.id
GROUP BY c.id, c.name, cs.subscription_type, sp.display_name, sp.max_job_postings, sp.max_urgent_postings, cs.status;

-- Комментарии к таблицам
COMMENT ON TABLE subscription_plans IS 'Планы подписок с лимитами и ценами';
COMMENT ON TABLE usage_logs IS 'Логи использования функций для подсчета лимитов';
COMMENT ON COLUMN subscription_plans.features IS 'JSON массив с описанием возможностей плана';
COMMENT ON COLUMN subscription_plans.restrictions IS 'JSON объект с ограничениями плана';
COMMENT ON COLUMN usage_logs.metadata IS 'Дополнительные данные о действии в JSON формате';
