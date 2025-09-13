-- Миграция: Добавление системы городов
-- Дата: 2025-09-07
-- Описание: Простая система городов без геолокации

-- Создаем таблицу городов с поддержкой официальных кодов регионов
-- Используем DECIMAL для ID чтобы поддержать дробную нумерацию (16.1, 16.2 и т.д.)
CREATE TABLE IF NOT EXISTS cities (
  id DECIMAL(4,1) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  region VARCHAR(100) NOT NULL,
  region_code VARCHAR(2) NOT NULL,
  is_popular BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Создаем таблицу запросов на добавление городов
CREATE TABLE city_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_name TEXT NOT NULL,
  region TEXT NOT NULL,
  requester_email TEXT,
  requester_user_id UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'pending', -- pending, approved, rejected
  admin_comment TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  processed_at TIMESTAMP,
  processed_by UUID REFERENCES auth.users(id)
);

-- Добавляем города Казахстана согласно официальной нумерации регионов
-- Принцип: областной центр = код региона, другие города = код.1, код.2 и т.д.
INSERT INTO cities (id, name, region, region_code, is_popular) VALUES
  -- Города республиканского значения
  (1, 'Астана', 'город Астана', '01', true),
  (2, 'Алматы', 'город Алматы', '02', true),
  (17, 'Шымкент', 'город Шымкент', '17', true),
  
  -- Акмолинская область (03)
  (3, 'Кокшетау', 'Акмолинская область', '03', true),          -- областной центр
  (3.1, 'Степногорск', 'Акмолинская область', '03', false),
  
  -- Актюбинская область (04)
  (4, 'Актобе', 'Актюбинская область', '04', true),           -- областной центр
  
  -- Алматинская область (05)
  (5, 'Талдыкорган', 'Алматинская область', '05', true),      -- областной центр
  (5.1, 'Капчагай', 'Алматинская область', '05', false),
  
  -- Атырауская область (06)
  (6, 'Атырау', 'Атырауская область', '06', true),            -- областной центр
  
  -- Западно-Казахстанская область (07)
  (7, 'Уральск', 'Западно-Казахстанская область', '07', true), -- областной центр
  
  -- Жамбылская область (08)
  (8, 'Тараз', 'Жамбылская область', '08', true),             -- областной центр
  
  -- Карагандинская область (09)
  (9, 'Караганда', 'Карагандинская область', '09', true),     -- областной центр
  (9.1, 'Темиртау', 'Карагандинская область', '09', false),
  (9.2, 'Жезказган', 'Карагандинская область', '09', false),
  (9.3, 'Балхаш', 'Карагандинская область', '09', false),
  (9.4, 'Сарань', 'Карагандинская область', '09', false),
  
  -- Костанайская область (10)
  (10, 'Костанай', 'Костанайская область', '10', true),       -- областной центр
  (10.1, 'Рудный', 'Костанайская область', '10', false),
  (10.2, 'Лисаковск', 'Костанайская область', '10', false),
  
  -- Кызылординская область (11)
  (11, 'Кызылорда', 'Кызылординская область', '11', true),    -- областной центр
  
  -- Мангистауская область (12)
  (12, 'Актау', 'Мангистауская область', '12', true),         -- областной центр
  (12.1, 'Жанаозен', 'Мангистауская область', '12', false),
  
  -- Туркестанская область (13)
  (13, 'Туркестан', 'Туркестанская область', '13', true),     -- областной центр
  (13.1, 'Кентау', 'Туркестанская область', '13', false),
  (13.2, 'Арысь', 'Туркестанская область', '13', false),
  
  -- Павлодарская область (14)
  (14, 'Павлодар', 'Павлодарская область', '14', true),       -- областной центр
  (14.1, 'Экибастуз', 'Павлодарская область', '14', false),
  
  -- Северо-Казахстанская область (15)
  (15, 'Петропавловск', 'Северо-Казахстанская область', '15', true), -- областной центр
  
  -- Восточно-Казахстанская область (16)
  (16, 'Усть-Каменогорск', 'Восточно-Казахстанская область', '16', true), -- областной центр
  (16.1, 'Риддер', 'Восточно-Казахстанская область', '16', false),
  
  -- Абайская область (18) - новая область с 2022 года
  (18, 'Семей', 'Абайская область', '18', true),              -- областной центр
  
  -- Жетысуская область (19) - новая область с 2022 года  
  (19, 'Талдыкорган', 'Жетысуская область', '19', true),     -- областной центр
  
  -- Улытауская область (20) - новая область с 2022 года
  (20, 'Жезказган', 'Улытауская область', '20', true);       -- областной центр

-- Обновляем таблицу пользователей - добавляем city_id
ALTER TABLE user_profiles ADD COLUMN city_id INTEGER REFERENCES cities(id);

-- Обновляем таблицу вакансий - добавляем city_id  
ALTER TABLE job_postings ADD COLUMN city_id INTEGER REFERENCES cities(id);

-- Создаем индексы для производительности
CREATE INDEX idx_cities_popular ON cities(is_popular) WHERE is_popular = true;
CREATE INDEX idx_cities_active ON cities(is_active) WHERE is_active = true;
CREATE INDEX idx_cities_region_code ON cities(region_code);
CREATE INDEX idx_cities_name ON cities(name);
CREATE INDEX idx_user_profiles_city ON user_profiles(city_id);
CREATE INDEX idx_job_postings_city ON job_postings(city_id);
CREATE INDEX idx_city_requests_status ON city_requests(status);

-- RLS политики для cities (публичное чтение)
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cities are viewable by everyone" ON cities
  FOR SELECT USING (is_active = true);

-- RLS политики для city_requests  
ALTER TABLE city_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create city requests" ON city_requests
  FOR INSERT WITH CHECK (auth.uid() = requester_user_id);

CREATE POLICY "Users can view their own city requests" ON city_requests
  FOR SELECT USING (auth.uid() = requester_user_id);

-- Админы могут управлять запросами (добавим позже роли)
CREATE POLICY "Admins can manage city requests" ON city_requests
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Функция для получения популярных городов
CREATE OR REPLACE FUNCTION get_popular_cities()
RETURNS TABLE (
  id INTEGER,
  name TEXT,
  region TEXT,
  region_code TEXT
) 
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT c.id, c.name, c.region, c.region_code
  FROM cities c
  WHERE c.is_popular = true 
    AND c.is_active = true
  ORDER BY c.region_code::INTEGER, c.name;
$$;

-- Функция для получения городов по коду региона
CREATE OR REPLACE FUNCTION get_cities_by_region(region_code_param TEXT)
RETURNS TABLE (
  id INTEGER,
  name TEXT,
  region TEXT,
  region_code TEXT,
  is_popular BOOLEAN
)
LANGUAGE sql
SECURITY DEFINER  
AS $$
  SELECT c.id, c.name, c.region, c.region_code, c.is_popular
  FROM cities c
  WHERE c.region_code = region_code_param
    AND c.is_active = true
  ORDER BY c.is_popular DESC, c.name;
$$;

-- Функция для получения всех регионов в официальном порядке
CREATE OR REPLACE FUNCTION get_regions_in_order()
RETURNS TABLE (
  region_code TEXT,
  region_name TEXT,
  cities_count BIGINT
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    c.region_code,
    c.region,
    COUNT(*) as cities_count
  FROM cities c
  WHERE c.is_active = true
  GROUP BY c.region_code, c.region
  ORDER BY c.region_code::INTEGER;
$$;

-- Функция для поиска городов
CREATE OR REPLACE FUNCTION search_cities(search_term TEXT)
RETURNS TABLE (
  id INTEGER,
  name TEXT,
  region TEXT,
  region_code TEXT,
  is_popular BOOLEAN
)
LANGUAGE sql  
SECURITY DEFINER
AS $$
  SELECT c.id, c.name, c.region, c.region_code, c.is_popular
  FROM cities c
  WHERE c.is_active = true
    AND (
      c.name ILIKE '%' || search_term || '%' OR
      c.region ILIKE '%' || search_term || '%' OR
      c.region_code = search_term
    )
  ORDER BY c.is_popular DESC, c.region_code::INTEGER, c.name;
$$;

-- Функция для создания запроса на добавление города
CREATE OR REPLACE FUNCTION create_city_request(
  city_name TEXT,
  region TEXT,
  requester_email TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  request_id UUID;
BEGIN
  -- Проверяем, что город еще не существует
  IF EXISTS (SELECT 1 FROM cities WHERE name ILIKE city_name) THEN
    RAISE EXCEPTION 'Город "%" уже существует', city_name;
  END IF;
  
  -- Создаем запрос
  INSERT INTO city_requests (city_name, region, requester_email, requester_user_id)
  VALUES (city_name, region, requester_email, auth.uid())
  RETURNING id INTO request_id;
  
  -- Можно добавить уведомление админам
  -- PERFORM notify_admins('new_city_request', request_id::text);
  
  RETURN request_id;
END;
$$;

-- Триггер для обновления updated_at
CREATE OR REPLACE FUNCTION update_cities_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cities_updated_at
  BEFORE UPDATE ON cities
  FOR EACH ROW
  EXECUTE FUNCTION update_cities_updated_at();

-- Комментарии для документации
COMMENT ON TABLE cities IS 'Справочник городов Казахстана с официальными кодами регионов';
COMMENT ON TABLE city_requests IS 'Запросы пользователей на добавление новых городов';
COMMENT ON COLUMN cities.is_popular IS 'Популярные города отображаются в топе списка';
COMMENT ON COLUMN cities.is_active IS 'Активные города доступны для выбора';
COMMENT ON COLUMN cities.region_code IS 'Официальный код региона для гос. номеров (01-20)';

-- Grants для публичного доступа к функциям
GRANT EXECUTE ON FUNCTION get_popular_cities() TO public;
GRANT EXECUTE ON FUNCTION search_cities(TEXT) TO public;
GRANT EXECUTE ON FUNCTION get_cities_by_region(TEXT) TO public;
GRANT EXECUTE ON FUNCTION get_regions_in_order() TO public;
GRANT EXECUTE ON FUNCTION create_city_request(TEXT, TEXT, TEXT) TO authenticated;
