-- Принудительный полный сброс базы данных и создание новой архитектуры
-- Версия 2: с правильным удалением триггеров и функций

-- Отключаем RLS и удаляем все существующие объекты
SET session_replication_role = replica;

-- Сначала удаляем триггеры
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_new_job_posting ON job_postings;
DROP TRIGGER IF EXISTS on_new_urgent_job ON urgent_jobs;
DROP TRIGGER IF EXISTS update_companies_updated_at ON companies;
DROP TRIGGER IF EXISTS update_job_postings_updated_at ON job_postings;
DROP TRIGGER IF EXISTS update_urgent_jobs_updated_at ON urgent_jobs;
DROP TRIGGER IF EXISTS update_job_applications_updated_at ON job_applications;
DROP TRIGGER IF EXISTS update_resumes_updated_at ON resumes;
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
DROP TRIGGER IF EXISTS update_company_profiles_updated_at ON company_profiles;
DROP TRIGGER IF EXISTS update_automation_rules_updated_at ON automation_rules;

-- Удаляем функции
DROP FUNCTION IF EXISTS notify_new_job();
DROP FUNCTION IF EXISTS check_urgent_job_automation();
DROP FUNCTION IF EXISTS handle_new_user();
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Удаляем все зависимости и таблицы в правильном порядке
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS company_profiles CASCADE;
DROP TABLE IF EXISTS urgent_jobs CASCADE;
DROP TABLE IF EXISTS job_postings CASCADE;
DROP TABLE IF EXISTS job_applications CASCADE;
DROP TABLE IF EXISTS resumes CASCADE;
DROP TABLE IF EXISTS companies CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS automation_rules CASCADE;
DROP TABLE IF EXISTS user_sessions CASCADE;

-- Удаляем справочные таблицы
DROP TABLE IF EXISTS job_specializations CASCADE;
DROP TABLE IF EXISTS districts CASCADE;
DROP TABLE IF EXISTS employment_types CASCADE;
DROP TABLE IF EXISTS work_schedules CASCADE;
DROP TABLE IF EXISTS experience_levels CASCADE;

-- Удаляем представления
DROP VIEW IF EXISTS active_jobs;
DROP VIEW IF EXISTS urgent_jobs_view;

-- Включаем обратно RLS
SET session_replication_role = DEFAULT;

-- СОЗДАНИЕ НОВОЙ АРХИТЕКТУРЫ

-- 1. Справочные таблицы

-- Справочник специализаций в общепите
CREATE TABLE job_specializations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Справочник районов
CREATE TABLE districts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    city VARCHAR(100) DEFAULT 'Москва',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Справочник типов занятости
CREATE TABLE employment_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Справочник графиков работы
CREATE TABLE work_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Справочник уровней опыта
CREATE TABLE experience_levels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE,
    min_years INTEGER DEFAULT 0,
    max_years INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Основные таблицы

-- Таблица компаний
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    phone VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(255),
    address TEXT,
    district_id UUID REFERENCES districts(id),
    logo_url VARCHAR(500),
    is_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Основная таблица вакансий
CREATE TABLE job_postings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    specialization_id UUID REFERENCES job_specializations(id),
    employment_type_id UUID REFERENCES employment_types(id),
    work_schedule_id UUID REFERENCES work_schedules(id),
    experience_level_id UUID REFERENCES experience_levels(id),
    salary_from INTEGER,
    salary_to INTEGER,
    salary_currency VARCHAR(10) DEFAULT 'RUB',
    district_id UUID REFERENCES districts(id),
    address TEXT,
    requirements TEXT,
    benefits TEXT,
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    views_count INTEGER DEFAULT 0,
    applications_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    expires_at TIMESTAMP WITH TIME ZONE
);

-- Отдельная таблица срочных вакансий
CREATE TABLE urgent_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    specialization_id UUID REFERENCES job_specializations(id),
    employment_type_id UUID REFERENCES employment_types(id),
    work_schedule_id UUID REFERENCES work_schedules(id),
    salary_from INTEGER,
    salary_to INTEGER,
    salary_currency VARCHAR(10) DEFAULT 'RUB',
    district_id UUID REFERENCES districts(id),
    address TEXT,
    requirements TEXT,
    start_date DATE,
    end_date DATE,
    contact_phone VARCHAR(20) NOT NULL,
    contact_person VARCHAR(100),
    is_filled BOOLEAN DEFAULT false,
    priority_level INTEGER DEFAULT 1 CHECK (priority_level BETWEEN 1 AND 5),
    telegram_username VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Таблица откликов на вакансии
CREATE TABLE job_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES job_postings(id) ON DELETE CASCADE,
    urgent_job_id UUID REFERENCES urgent_jobs(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    cover_letter TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT check_job_reference CHECK (
        (job_id IS NOT NULL AND urgent_job_id IS NULL) OR 
        (job_id IS NULL AND urgent_job_id IS NOT NULL)
    )
);

-- Таблица резюме
CREATE TABLE resumes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    birth_date DATE,
    specialization_id UUID REFERENCES job_specializations(id),
    experience_level_id UUID REFERENCES experience_levels(id),
    desired_salary_from INTEGER,
    desired_salary_to INTEGER,
    desired_districts UUID[] DEFAULT '{}',
    work_experience TEXT,
    education TEXT,
    skills TEXT,
    about TEXT,
    is_active BOOLEAN DEFAULT true,
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Профили пользователей

-- Профили соискателей
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    full_name VARCHAR(255),
    phone VARCHAR(20),
    birth_date DATE,
    avatar_url VARCHAR(500),
    preferred_districts UUID[] DEFAULT '{}',
    preferred_specializations UUID[] DEFAULT '{}',
    telegram_username VARCHAR(100),
    notification_preferences JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Профили работодателей
CREATE TABLE company_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    position VARCHAR(100),
    permissions JSONB DEFAULT '{}',
    telegram_username VARCHAR(100),
    notification_preferences JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. Система уведомлений

-- Таблица уведомлений
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5. Система автоматизации

-- Правила автоматизации
CREATE TABLE automation_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'job_alert', 'urgent_job_alert'
    conditions JSONB NOT NULL DEFAULT '{}',
    actions JSONB NOT NULL DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    last_triggered TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 6. Индексы для оптимизации

-- Индексы для job_postings
CREATE INDEX idx_job_postings_company ON job_postings(company_id);
CREATE INDEX idx_job_postings_specialization ON job_postings(specialization_id);
CREATE INDEX idx_job_postings_district ON job_postings(district_id);
CREATE INDEX idx_job_postings_active ON job_postings(is_active);
CREATE INDEX idx_job_postings_created ON job_postings(created_at DESC);

-- Индексы для urgent_jobs
CREATE INDEX idx_urgent_jobs_company ON urgent_jobs(company_id);
CREATE INDEX idx_urgent_jobs_specialization ON urgent_jobs(specialization_id);
CREATE INDEX idx_urgent_jobs_district ON urgent_jobs(district_id);
CREATE INDEX idx_urgent_jobs_filled ON urgent_jobs(is_filled);
CREATE INDEX idx_urgent_jobs_priority ON urgent_jobs(priority_level DESC);
CREATE INDEX idx_urgent_jobs_created ON urgent_jobs(created_at DESC);

-- Индексы для applications
CREATE INDEX idx_applications_job ON job_applications(job_id);
CREATE INDEX idx_applications_urgent_job ON job_applications(urgent_job_id);
CREATE INDEX idx_applications_user ON job_applications(user_id);
CREATE INDEX idx_applications_status ON job_applications(status);

-- Индексы для уведомлений
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

-- 7. Наполнение справочников

-- Специализации в общепите
INSERT INTO job_specializations (name, description) VALUES
('Повар', 'Приготовление блюд различной сложности'),
('Су-шеф', 'Помощник шеф-повара, управление кухней'),
('Шеф-повар', 'Главный повар, разработка меню, управление кухней'),
('Кондитер', 'Приготовление десертов и выпечки'),
('Пиццайоло', 'Приготовление пиццы'),
('Официант', 'Обслуживание гостей в зале'),
('Бармен', 'Приготовление напитков, работа с баром'),
('Администратор зала', 'Управление залом, встреча гостей'),
('Хостес', 'Встреча и размещение гостей'),
('Посудомойщик', 'Мытье посуды и кухонного инвентаря'),
('Кухонный рабочий', 'Подготовка продуктов, уборка кухни'),
('Управляющий', 'Управление рестораном/кафе'),
('Менеджер зала', 'Контроль работы официантов и качества обслуживания'),
('Сомелье', 'Консультации по винам и напиткам'),
('Кассир', 'Работа с кассой, расчет гостей');

-- Районы Москвы
INSERT INTO districts (name, city) VALUES
('Центральный АО', 'Москва'),
('Северный АО', 'Москва'),
('Северо-Восточный АО', 'Москва'),
('Восточный АО', 'Москва'),
('Юго-Восточный АО', 'Москва'),
('Южный АО', 'Москва'),
('Юго-Западный АО', 'Москва'),
('Западный АО', 'Москва'),
('Северо-Западный АО', 'Москва'),
('Зеленоградский АО', 'Москва'),
('Новомосковский АО', 'Москва'),
('Троицкий АО', 'Москва');

-- Типы занятости
INSERT INTO employment_types (name, description) VALUES
('Полная занятость', 'Стандартная рабочая неделя'),
('Частичная занятость', 'Неполный рабочий день'),
('Временная работа', 'Работа на определенный период'),
('Проектная работа', 'Работа по проекту'),
('Стажировка', 'Обучение с последующим трудоустройством'),
('Подработка', 'Дополнительная работа');

-- Графики работы
INSERT INTO work_schedules (name, description) VALUES
('Полный день', '8-часовой рабочий день'),
('Сменный график', 'Работа в смены'),
('Гибкий график', 'Свободное планирование времени'),
('Только выходные', 'Работа в выходные дни'),
('Только будни', 'Работа в будние дни'),
('Ночные смены', 'Работа в ночное время'),
('Вахтовый метод', 'Работа вахтами');

-- Уровни опыта
INSERT INTO experience_levels (name, min_years, max_years) VALUES
('Без опыта', 0, 0),
('От 1 года', 1, 2),
('От 3 лет', 3, 5),
('От 6 лет', 6, 10),
('Более 10 лет', 10, NULL);

-- 8. Настройка RLS (Row Level Security)

-- Включаем RLS для всех таблиц
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE urgent_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_rules ENABLE ROW LEVEL SECURITY;

-- Политики для companies
CREATE POLICY "Компании видны всем" ON companies FOR SELECT USING (true);
CREATE POLICY "Создание компаний только авторизованными" ON companies FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Обновление только своих компаний" ON companies FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Удаление только своих компаний" ON companies FOR DELETE USING (user_id = auth.uid());

-- Политики для job_postings
CREATE POLICY "Вакансии видны всем" ON job_postings FOR SELECT USING (is_active = true);
CREATE POLICY "Создание вакансий только владельцами компаний" ON job_postings FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM companies WHERE id = company_id AND user_id = auth.uid())
);
CREATE POLICY "Обновление только своих вакансий" ON job_postings FOR UPDATE USING (
    EXISTS (SELECT 1 FROM companies WHERE id = company_id AND user_id = auth.uid())
);
CREATE POLICY "Удаление только своих вакансий" ON job_postings FOR DELETE USING (
    EXISTS (SELECT 1 FROM companies WHERE id = company_id AND user_id = auth.uid())
);

-- Политики для urgent_jobs
CREATE POLICY "Срочные вакансии видны всем" ON urgent_jobs FOR SELECT USING (is_filled = false);
CREATE POLICY "Создание срочных вакансий только владельцами компаний" ON urgent_jobs FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM companies WHERE id = company_id AND user_id = auth.uid())
);
CREATE POLICY "Обновление только своих срочных вакансий" ON urgent_jobs FOR UPDATE USING (
    EXISTS (SELECT 1 FROM companies WHERE id = company_id AND user_id = auth.uid())
);
CREATE POLICY "Удаление только своих срочных вакансий" ON urgent_jobs FOR DELETE USING (
    EXISTS (SELECT 1 FROM companies WHERE id = company_id AND user_id = auth.uid())
);

-- Политики для job_applications
CREATE POLICY "Просмотр откликов" ON job_applications FOR SELECT USING (
    user_id = auth.uid() OR 
    EXISTS (
        SELECT 1 FROM job_postings jp 
        INNER JOIN companies c ON jp.company_id = c.id 
        WHERE jp.id = job_id AND c.user_id = auth.uid()
    ) OR
    EXISTS (
        SELECT 1 FROM urgent_jobs uj 
        INNER JOIN companies c ON uj.company_id = c.id 
        WHERE uj.id = urgent_job_id AND c.user_id = auth.uid()
    )
);
CREATE POLICY "Создание откликов только авторизованными" ON job_applications FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND user_id = auth.uid()
);
CREATE POLICY "Обновление откликов" ON job_applications FOR UPDATE USING (
    user_id = auth.uid() OR 
    EXISTS (
        SELECT 1 FROM job_postings jp 
        INNER JOIN companies c ON jp.company_id = c.id 
        WHERE jp.id = job_id AND c.user_id = auth.uid()
    ) OR
    EXISTS (
        SELECT 1 FROM urgent_jobs uj 
        INNER JOIN companies c ON uj.company_id = c.id 
        WHERE uj.id = urgent_job_id AND c.user_id = auth.uid()
    )
);

-- Политики для resumes
CREATE POLICY "Публичные резюме видны всем" ON resumes FOR SELECT USING (is_public = true AND is_active = true);
CREATE POLICY "Свои резюме видны владельцу" ON resumes FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Создание резюме только авторизованными" ON resumes FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND user_id = auth.uid()
);
CREATE POLICY "Обновление только своих резюме" ON resumes FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Удаление только своих резюме" ON resumes FOR DELETE USING (user_id = auth.uid());

-- Политики для user_profiles
CREATE POLICY "Профили видны владельцам" ON user_profiles FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Создание профилей только авторизованными" ON user_profiles FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND user_id = auth.uid()
);
CREATE POLICY "Обновление только своих профилей" ON user_profiles FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Удаление только своих профилей" ON user_profiles FOR DELETE USING (user_id = auth.uid());

-- Политики для company_profiles
CREATE POLICY "Профили компаний видны владельцам" ON company_profiles FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Создание профилей компаний только авторизованными" ON company_profiles FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND user_id = auth.uid()
);
CREATE POLICY "Обновление только своих профилей компаний" ON company_profiles FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Удаление только своих профилей компаний" ON company_profiles FOR DELETE USING (user_id = auth.uid());

-- Политики для notifications
CREATE POLICY "Уведомления видны только получателям" ON notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Обновление только своих уведомлений" ON notifications FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Удаление только своих уведомлений" ON notifications FOR DELETE USING (user_id = auth.uid());

-- Политики для automation_rules
CREATE POLICY "Правила автоматизации видны только владельцам" ON automation_rules FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Создание правил только авторизованными" ON automation_rules FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND user_id = auth.uid()
);
CREATE POLICY "Обновление только своих правил" ON automation_rules FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Удаление только своих правил" ON automation_rules FOR DELETE USING (user_id = auth.uid());

-- 9. Функции и триггеры

-- Функция для обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггеры для автоматического обновления updated_at
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_job_postings_updated_at BEFORE UPDATE ON job_postings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_urgent_jobs_updated_at BEFORE UPDATE ON urgent_jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_job_applications_updated_at BEFORE UPDATE ON job_applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_resumes_updated_at BEFORE UPDATE ON resumes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_company_profiles_updated_at BEFORE UPDATE ON company_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_automation_rules_updated_at BEFORE UPDATE ON automation_rules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Функция для автоматического создания профиля пользователя
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_profiles (user_id, full_name)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Триггер для создания профиля при регистрации
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Функция для отправки уведомлений о новых вакансиях
CREATE OR REPLACE FUNCTION notify_new_job()
RETURNS TRIGGER AS $$
BEGIN
    -- Здесь будет логика отправки уведомлений
    -- Пока просто возвращаем NEW
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггер для уведомлений о новых вакансиях
CREATE TRIGGER on_new_job_posting
    AFTER INSERT ON job_postings
    FOR EACH ROW EXECUTE FUNCTION notify_new_job();

-- Триггер для уведомлений о новых срочных вакансиях
CREATE TRIGGER on_new_urgent_job
    AFTER INSERT ON urgent_jobs
    FOR EACH ROW EXECUTE FUNCTION notify_new_job();

-- 10. Представления для удобного доступа к данным

-- Представление активных вакансий с полной информацией
CREATE VIEW active_jobs AS
SELECT 
    jp.*,
    c.name as company_name,
    c.logo_url as company_logo,
    js.name as specialization_name,
    d.name as district_name,
    et.name as employment_type_name,
    ws.name as work_schedule_name,
    el.name as experience_level_name
FROM job_postings jp
LEFT JOIN companies c ON jp.company_id = c.id
LEFT JOIN job_specializations js ON jp.specialization_id = js.id
LEFT JOIN districts d ON jp.district_id = d.id
LEFT JOIN employment_types et ON jp.employment_type_id = et.id
LEFT JOIN work_schedules ws ON jp.work_schedule_id = ws.id
LEFT JOIN experience_levels el ON jp.experience_level_id = el.id
WHERE jp.is_active = true;

-- Представление срочных вакансий с полной информацией
CREATE VIEW urgent_jobs_view AS
SELECT 
    uj.*,
    c.name as company_name,
    c.logo_url as company_logo,
    js.name as specialization_name,
    d.name as district_name,
    et.name as employment_type_name,
    ws.name as work_schedule_name
FROM urgent_jobs uj
LEFT JOIN companies c ON uj.company_id = c.id
LEFT JOIN job_specializations js ON uj.specialization_id = js.id
LEFT JOIN districts d ON uj.district_id = d.id
LEFT JOIN employment_types et ON uj.employment_type_id = et.id
LEFT JOIN work_schedules ws ON uj.work_schedule_id = ws.id
WHERE uj.is_filled = false;

-- Финиш! Новая архитектура базы данных для HR-платформы общепита создана
