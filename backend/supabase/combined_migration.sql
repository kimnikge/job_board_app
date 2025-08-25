-- === Тестовые данные для проверки R3 ===

-- 1. Добавим тестовый бейдж
INSERT INTO public.badges (name, description, icon_url, category, level, is_company_generated)
VALUES ('50 Shifts', 'Отработано 50 смен', 'https://example.com/badge50.png', 'Experience', 'Bronze', false);

-- 2. Добавим тестовый навык пользователю с id=1
INSERT INTO public.skills (user_id, name, base_level, calculated_level)
VALUES (1, 'Barista', 10, 10);

-- 3. Добавим work_log для пользователя с id=1
INSERT INTO public.work_logs (user_id, employer_id, position, shifts_count, started_at, ended_at)
VALUES (1, 1, 'Бариста', 50, '2025-08-01', '2025-08-24');

-- === Базовая функция автоматической выдачи бейджа ===
CREATE OR REPLACE FUNCTION check_and_award_badges_for_work_log() RETURNS trigger AS $$
DECLARE
    badge_id BIGINT;
BEGIN
    -- Пример: если shifts_count >= 50, выдать бейдж "50 Shifts"
    SELECT id INTO badge_id FROM badges WHERE name = '50 Shifts' LIMIT 1;
    IF NEW.shifts_count >= 50 AND badge_id IS NOT NULL THEN
        INSERT INTO user_badges (badge_id, user_id, employer_id, awarded_by, awarded_at, reason, source)
        VALUES (badge_id, NEW.user_id, NEW.employer_id, NEW.user_id, now(), 'За 50 смен', 'auto');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- === Функция пересчёта навыков (заглушка) ===
CREATE OR REPLACE FUNCTION recalc_user_skills(user_id INTEGER) RETURNS void AS $$
BEGIN
    -- Здесь будет логика пересчёта calculated_level (пример: просто копируем base_level)
    UPDATE skills SET calculated_level = base_level WHERE user_id = recalc_user_skills.user_id;
END;
$$ LANGUAGE plpgsql;

-- 1. Таблица глобальных шаблонов бейджей
CREATE TABLE public.badges (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    icon_url TEXT,
    category TEXT,
    level TEXT, -- Bronze/Silver/Gold/Platinum
    is_company_generated BOOLEAN DEFAULT FALSE,
    company_id INTEGER REFERENCES employers(user_id)
);

-- 2. Таблица присвоенных бейджей пользователям
CREATE TABLE public.user_badges (
    id BIGSERIAL PRIMARY KEY,
    badge_id BIGINT REFERENCES badges(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    employer_id INTEGER REFERENCES employers(user_id),
    awarded_by INTEGER, -- id пользователя/админа, выдавшего бейдж
    awarded_at TIMESTAMP DEFAULT now(),
    reason TEXT,
    source TEXT
);

-- 3. Таблица связей бейджей с навыками
CREATE TABLE public.badge_skill_links (
    id BIGSERIAL PRIMARY KEY,
    badge_id BIGINT REFERENCES badges(id) ON DELETE CASCADE,
    skill_name TEXT NOT NULL,
    delta INTEGER NOT NULL
);

-- 4. Таблица навыков пользователя
CREATE TABLE public.skills (
    id BIGSERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    base_level INTEGER DEFAULT 0,
    calculated_level INTEGER DEFAULT 0
);

-- 5. Таблица логов работы пользователя
CREATE TABLE public.work_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    employer_id INTEGER REFERENCES employers(user_id),
    position TEXT,
    shifts_count INTEGER,
    started_at DATE,
    ended_at DATE
);

-- 6. Пример функции для автоматической выдачи бейджей (заглушка)
CREATE OR REPLACE FUNCTION check_and_award_badges_for_work_log() RETURNS trigger AS $$
BEGIN
    -- Здесь будет логика автоматической выдачи бейджей
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Триггер на выдачу бейджей при добавлении work_log
CREATE TRIGGER trigger_award_badges_on_work_log
AFTER INSERT OR UPDATE ON work_logs
FOR EACH ROW EXECUTE FUNCTION check_and_award_badges_for_work_log();

-- 8. Пример функции для пересчёта навыков (заглушка)
CREATE OR REPLACE FUNCTION recalc_user_skills(user_id INTEGER) RETURNS void AS $$
BEGIN
    -- Здесь будет логика пересчёта calculated_level
END;
$$ LANGUAGE plpgsql;
