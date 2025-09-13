-- Создание таблицы специализаций
-- 20250909_create_specializations.sql

-- Создаем таблицу специализаций
CREATE TABLE IF NOT EXISTS specializations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  category VARCHAR(50) DEFAULT 'general',
  is_popular BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Добавляем индексы для производительности
CREATE INDEX IF NOT EXISTS idx_specializations_category ON specializations(category);
CREATE INDEX IF NOT EXISTS idx_specializations_popular ON specializations(is_popular);
CREATE INDEX IF NOT EXISTS idx_specializations_active ON specializations(is_active);

-- Заполняем таблицу данными
INSERT INTO specializations (name, category, is_popular) VALUES
  -- Кухня
  ('Повар', 'kitchen', true),
  ('Су-шеф', 'kitchen', true),
  ('Шеф-повар', 'kitchen', false),
  ('Помощник повара', 'kitchen', true),
  ('Пекарь', 'kitchen', false),
  ('Кондитер', 'kitchen', false),
  ('Повар холодного цеха', 'kitchen', false),
  ('Повар горячего цеха', 'kitchen', false),
  
  -- Зал
  ('Официант', 'service', true),
  ('Бармен', 'service', true),
  ('Администратор зала', 'service', true),
  ('Хостес', 'service', false),
  ('Сомелье', 'service', false),
  ('Бариста', 'service', false),
  
  -- Управление
  ('Управляющий', 'management', true),
  ('Менеджер', 'management', false),
  ('Директор ресторана', 'management', false),
  ('Старший смены', 'management', false),
  
  -- Подсобные работники
  ('Посудомойщик', 'support', false),
  ('Уборщик', 'support', false),
  ('Грузчик', 'support', false),
  ('Мойщик', 'support', false),
  
  -- Доставка
  ('Курьер', 'delivery', false),
  ('Водитель доставки', 'delivery', false),
  
  -- Другие
  ('Кассир', 'other', false),
  ('Охранник', 'other', false),
  ('Технический персонал', 'other', false);

-- Создаем триггер для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_specializations_updated_at 
    BEFORE UPDATE ON specializations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Добавляем RLS политики (если включена RLS)
-- ALTER TABLE specializations ENABLE ROW LEVEL SECURITY;

-- Политика чтения для всех
-- CREATE POLICY "specializations_select" ON specializations
--   FOR SELECT USING (true);

-- Политика создания для аутентифицированных пользователей
-- CREATE POLICY "specializations_insert" ON specializations
--   FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Политика обновления для администраторов
-- CREATE POLICY "specializations_update" ON specializations
--   FOR UPDATE USING (
--     auth.jwt() ->> 'role' = 'admin' OR 
--     auth.jwt() ->> 'user_metadata' ->> 'role' = 'admin'
--   );

COMMENT ON TABLE specializations IS 'Справочник специализаций/профессий в общепите';
COMMENT ON COLUMN specializations.name IS 'Название специализации';
COMMENT ON COLUMN specializations.category IS 'Категория: kitchen, service, management, support, delivery, other';
COMMENT ON COLUMN specializations.is_popular IS 'Популярная специализация (показывать в топе)';
COMMENT ON COLUMN specializations.is_active IS 'Активная специализация (доступна для выбора)';
