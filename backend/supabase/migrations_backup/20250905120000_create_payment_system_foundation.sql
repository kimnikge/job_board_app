-- =============================================================================
-- СОЗДАНИЕ БАЗОВОЙ СТРУКТУРЫ ПЛАТЕЖНОЙ СИСТЕМЫ
-- Дата: 5 сентября 2025
-- Описание: Минимальная структура для будущего включения монетизации
-- =============================================================================

-- Системные настройки монетизации
CREATE TABLE IF NOT EXISTS monetization_settings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    key text NOT NULL UNIQUE,
    value jsonb NOT NULL,
    description text,
    updated_at timestamp DEFAULT now(),
    updated_by uuid REFERENCES auth.users(id)
);

-- Тарифные планы по городам
CREATE TABLE IF NOT EXISTS pricing_plans (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    city_name text NOT NULL,
    region text DEFAULT 'Kazakhstan',
    
    -- Настройки для обычных вакансий
    regular_job_price decimal(10,2) DEFAULT 0.00,
    regular_job_duration_days integer DEFAULT 30,
    
    -- Настройки для срочных вакансий
    urgent_job_price decimal(10,2) DEFAULT 0.00,
    urgent_job_duration_hours integer DEFAULT 24,
    
    -- Настройки для премиум функций
    featured_job_price decimal(10,2) DEFAULT 0.00,
    top_placement_price decimal(10,2) DEFAULT 0.00,
    
    -- Валюта (по умолчанию тенге)
    currency text DEFAULT 'KZT',
    
    -- Статус
    is_active boolean DEFAULT false,
    created_at timestamp DEFAULT now(),
    updated_at timestamp DEFAULT now()
);

-- Подписки компаний (для будущего использования)
CREATE TABLE IF NOT EXISTS company_subscriptions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    pricing_plan_id uuid REFERENCES pricing_plans(id),
    
    -- Тип подписки
    subscription_type text CHECK (subscription_type IN ('free', 'basic', 'premium')) DEFAULT 'free',
    
    -- Статус и период
    status text CHECK (status IN ('active', 'paused', 'cancelled', 'expired')) DEFAULT 'active',
    started_at timestamp DEFAULT now(),
    expires_at timestamp,
    
    -- Лимиты (для бесплатного плана)
    regular_jobs_limit integer DEFAULT 999999, -- пока без лимитов
    urgent_jobs_limit integer DEFAULT 999999,
    featured_jobs_limit integer DEFAULT 999999,
    
    -- Использовано в текущем периоде
    regular_jobs_used integer DEFAULT 0,
    urgent_jobs_used integer DEFAULT 0,
    featured_jobs_used integer DEFAULT 0,
    
    created_at timestamp DEFAULT now(),
    updated_at timestamp DEFAULT now()
);

-- Транзакции (для будущего использования)
CREATE TABLE IF NOT EXISTS payment_transactions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL REFERENCES companies(id),
    subscription_id uuid REFERENCES company_subscriptions(id),
    
    -- Детали платежа
    amount decimal(10,2) NOT NULL,
    currency text DEFAULT 'KZT',
    payment_method text CHECK (payment_method IN ('kaspi_pay', 'bank_card', 'bank_transfer', 'manual')),
    
    -- Статус транзакции
    status text CHECK (status IN ('pending', 'completed', 'failed', 'refunded', 'cancelled')) DEFAULT 'pending',
    
    -- Внешние ID (для интеграций)
    external_transaction_id text,
    payment_provider text,
    
    -- Описание
    description text,
    service_type text, -- 'regular_job', 'urgent_job', 'featured_job', 'subscription'
    job_id uuid, -- ссылка на конкретную вакансию если применимо
    
    -- Временные метки
    paid_at timestamp,
    created_at timestamp DEFAULT now(),
    updated_at timestamp DEFAULT now()
);

-- =============================================================================
-- ИНДЕКСЫ ДЛЯ ПРОИЗВОДИТЕЛЬНОСТИ
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_pricing_plans_city ON pricing_plans(city_name);
CREATE INDEX IF NOT EXISTS idx_pricing_plans_active ON pricing_plans(is_active);
CREATE INDEX IF NOT EXISTS idx_company_subscriptions_company ON company_subscriptions(company_id);
CREATE INDEX IF NOT EXISTS idx_company_subscriptions_status ON company_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_company ON payment_transactions(company_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status);

-- =============================================================================
-- RLS ПОЛИТИКИ БЕЗОПАСНОСТИ
-- =============================================================================

-- Включаем RLS для всех таблиц
ALTER TABLE monetization_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

-- Политики для monetization_settings (только админы)
CREATE POLICY "Only admins can view monetization settings" ON monetization_settings
    FOR SELECT USING (auth.jwt() ->> 'user_role' = 'admin');

CREATE POLICY "Only admins can modify monetization settings" ON monetization_settings
    FOR ALL USING (auth.jwt() ->> 'user_role' = 'admin');

-- Политики для pricing_plans (админы все, компании только просмотр активных)
CREATE POLICY "Admins can manage all pricing plans" ON pricing_plans
    FOR ALL USING (auth.jwt() ->> 'user_role' = 'admin');

CREATE POLICY "Companies can view active pricing plans" ON pricing_plans
    FOR SELECT USING (is_active = true);

-- Политики для company_subscriptions (компании видят только свои)
CREATE POLICY "Companies can view own subscriptions" ON company_subscriptions
    FOR SELECT USING (
        company_id IN (
            SELECT id FROM companies 
            WHERE telegram_id = (auth.jwt() ->> 'telegram_id')::bigint
        )
    );

CREATE POLICY "Admins can view all subscriptions" ON company_subscriptions
    FOR SELECT USING (auth.jwt() ->> 'user_role' = 'admin');

-- Политики для payment_transactions (компании видят только свои)
CREATE POLICY "Companies can view own transactions" ON payment_transactions
    FOR SELECT USING (
        company_id IN (
            SELECT id FROM companies 
            WHERE telegram_id = (auth.jwt() ->> 'telegram_id')::bigint
        )
    );

CREATE POLICY "Admins can view all transactions" ON payment_transactions
    FOR SELECT USING (auth.jwt() ->> 'user_role' = 'admin');

-- =============================================================================
-- НАЧАЛЬНЫЕ ДАННЫЕ
-- =============================================================================

-- Системные настройки (монетизация выключена)
INSERT INTO monetization_settings (key, value, description) VALUES
('payment_system_enabled', 'false', 'Включение/выключение системы оплаты'),
('free_period_enabled', 'true', 'Бесплатный период для всех пользователей'),
('kaspi_pay_enabled', 'false', 'Включение оплаты через Kaspi Pay'),
('bank_cards_enabled', 'false', 'Включение оплаты банковскими картами'),
('default_free_limits', '{"regular_jobs": 999999, "urgent_jobs": 999999, "featured_jobs": 999999}', 'Лимиты для бесплатного периода');

-- Тарифные планы для Астаны (пока бесплатно)
INSERT INTO pricing_plans (city_name, region, regular_job_price, urgent_job_price, featured_job_price, top_placement_price, is_active) VALUES
('Астана', 'Нур-Султан', 0.00, 0.00, 0.00, 0.00, true),
('Алматы', 'Алматы', 0.00, 0.00, 0.00, 0.00, true),
('Шымкент', 'Туркестанская область', 0.00, 0.00, 0.00, 0.00, true),
('Караганда', 'Карагандинская область', 0.00, 0.00, 0.00, 0.00, true),
('Актобе', 'Актюбинская область', 0.00, 0.00, 0.00, 0.00, true);

-- =============================================================================
-- RPC ФУНКЦИИ ДЛЯ РАБОТЫ С МОНЕТИЗАЦИЕЙ
-- =============================================================================

-- Проверка, включена ли система оплаты
CREATE OR REPLACE FUNCTION is_payment_system_enabled()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN (
        SELECT (value->>'payment_system_enabled')::boolean 
        FROM monetization_settings 
        WHERE key = 'payment_system_enabled'
    );
END;
$$;

-- Получение тарифного плана для города
CREATE OR REPLACE FUNCTION get_pricing_plan_for_city(p_city_name text)
RETURNS TABLE(
    plan_id uuid,
    regular_price decimal,
    urgent_price decimal,
    featured_price decimal,
    top_placement_price decimal,
    currency text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pp.id,
        pp.regular_job_price,
        pp.urgent_job_price,
        pp.featured_job_price,
        pp.top_placement_price,
        pp.currency
    FROM pricing_plans pp
    WHERE pp.city_name = p_city_name 
    AND pp.is_active = true
    LIMIT 1;
END;
$$;

-- Создание бесплатной подписки для новой компании
CREATE OR REPLACE FUNCTION create_free_subscription_for_company(p_company_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    subscription_id uuid;
    free_limits jsonb;
BEGIN
    -- Получаем настройки бесплатных лимитов
    SELECT value INTO free_limits 
    FROM monetization_settings 
    WHERE key = 'default_free_limits';

    -- Создаем бесплатную подписку
    INSERT INTO company_subscriptions (
        company_id,
        subscription_type,
        status,
        regular_jobs_limit,
        urgent_jobs_limit,
        featured_jobs_limit
    ) VALUES (
        p_company_id,
        'free',
        'active',
        (free_limits->>'regular_jobs')::integer,
        (free_limits->>'urgent_jobs')::integer,
        (free_limits->>'featured_jobs')::integer
    ) RETURNING id INTO subscription_id;

    RETURN subscription_id;
END;
$$;

-- Проверка, может ли компания опубликовать вакансию
CREATE OR REPLACE FUNCTION can_company_post_job(
    p_company_id uuid, 
    p_job_type text -- 'regular', 'urgent', 'featured'
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    subscription_record company_subscriptions%ROWTYPE;
    payment_enabled boolean;
BEGIN
    -- Если система оплаты отключена, разрешаем всем
    SELECT is_payment_system_enabled() INTO payment_enabled;
    IF NOT payment_enabled THEN
        RETURN true;
    END IF;

    -- Получаем активную подписку компании
    SELECT * INTO subscription_record
    FROM company_subscriptions
    WHERE company_id = p_company_id 
    AND status = 'active'
    AND (expires_at IS NULL OR expires_at > now())
    ORDER BY created_at DESC
    LIMIT 1;

    -- Если подписки нет, возвращаем false
    IF subscription_record.id IS NULL THEN
        RETURN false;
    END IF;

    -- Проверяем лимиты в зависимости от типа
    CASE p_job_type
        WHEN 'regular' THEN
            RETURN subscription_record.regular_jobs_used < subscription_record.regular_jobs_limit;
        WHEN 'urgent' THEN
            RETURN subscription_record.urgent_jobs_used < subscription_record.urgent_jobs_limit;
        WHEN 'featured' THEN
            RETURN subscription_record.featured_jobs_used < subscription_record.featured_jobs_limit;
        ELSE
            RETURN false;
    END CASE;
END;
$$;

-- =============================================================================
-- ТРИГГЕРЫ
-- =============================================================================

-- Автоматическое создание бесплатной подписки при создании компании
CREATE OR REPLACE FUNCTION trigger_create_company_subscription()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Создаем бесплатную подписку для новой компании
    PERFORM create_free_subscription_for_company(NEW.id);
    RETURN NEW;
END;
$$;

CREATE TRIGGER after_company_created
    AFTER INSERT ON companies
    FOR EACH ROW
    EXECUTE FUNCTION trigger_create_company_subscription();

-- Обновление updated_at при изменениях
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE TRIGGER update_monetization_settings_updated_at BEFORE UPDATE ON monetization_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pricing_plans_updated_at BEFORE UPDATE ON pricing_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_company_subscriptions_updated_at BEFORE UPDATE ON company_subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payment_transactions_updated_at BEFORE UPDATE ON payment_transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- КОММЕНТАРИИ К ТАБЛИЦАМ
-- =============================================================================

COMMENT ON TABLE monetization_settings IS 'Системные настройки монетизации с возможностью включения/выключения';
COMMENT ON TABLE pricing_plans IS 'Тарифные планы по городам и регионам';
COMMENT ON TABLE company_subscriptions IS 'Подписки компаний (сейчас все бесплатные)';
COMMENT ON TABLE payment_transactions IS 'История транзакций (для будущего использования)';

COMMENT ON FUNCTION is_payment_system_enabled() IS 'Проверяет, включена ли система оплаты глобально';
COMMENT ON FUNCTION get_pricing_plan_for_city(text) IS 'Возвращает тарифный план для указанного города';
COMMENT ON FUNCTION can_company_post_job(uuid, text) IS 'Проверяет, может ли компания опубликовать вакансию (учитывает лимиты и настройки)';

-- =============================================================================
-- ЗАВЕРШЕНИЕ
-- =============================================================================

-- Логируем создание структуры
INSERT INTO simple_logs (message, details) VALUES 
('Payment system foundation created', 
 jsonb_build_object(
    'tables_created', 4,
    'functions_created', 3,
    'payment_enabled', false,
    'free_mode', true,
    'cities_configured', 5
 ));
