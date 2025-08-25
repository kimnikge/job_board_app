-- R6: Advanced Gamification
-- Добавление уровней, редких, временных и командных бейджей

-- 1. Добавить поля level, is_rare, is_temporary, valid_until в badges
ALTER TABLE badges
ADD COLUMN level TEXT CHECK (level IN ('Bronze', 'Silver', 'Gold', 'Platinum')) DEFAULT 'Bronze',
ADD COLUMN is_rare BOOLEAN DEFAULT FALSE,
ADD COLUMN is_temporary BOOLEAN DEFAULT FALSE,
ADD COLUMN valid_until TIMESTAMP NULL;

-- 2. Создать таблицу командных бейджей
CREATE TABLE IF NOT EXISTS team_badges (
    id BIGSERIAL PRIMARY KEY,
    team_id BIGINT NOT NULL,
    badge_id BIGINT NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
    awarded_at TIMESTAMP DEFAULT NOW(),
    reason TEXT,
    CONSTRAINT fk_team FOREIGN KEY(team_id) REFERENCES teams(id) ON DELETE CASCADE
);

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_badges_level ON badges(level);
CREATE INDEX IF NOT EXISTS idx_badges_rare ON badges(is_rare);
CREATE INDEX IF NOT EXISTS idx_team_badges_team_id ON team_badges(team_id);
