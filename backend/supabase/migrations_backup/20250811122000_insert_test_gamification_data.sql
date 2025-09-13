-- 20250811122000_insert_test_gamification_data.sql
-- Создание тестовых данных для проверки системы геймификации

-- Сначала создаем тестовые компании
INSERT INTO public.employers (id, name, logo_url, district_id) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Ресторан "Астана"', '/images/astana-restaurant.png', 1),
('550e8400-e29b-41d4-a716-446655440002', 'Кафе "Барista"', '/images/barista-cafe.png', 2),
('550e8400-e29b-41d4-a716-446655440003', 'Бар "Ночной город"', '/images/night-bar.png', 3)
ON CONFLICT (id) DO NOTHING;

-- Создаем тестового пользователя (если его нет)
INSERT INTO public.user_profiles (id, auth_user_id, full_name, primary_role, short_bio, experience_years) VALUES
('650e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440099', 'Алексей Тестов', 'Бармен', 'Опытный бармен с навыками бариста', 3)
ON CONFLICT (id) DO NOTHING;

-- Создаем второго тестового пользователя
INSERT INTO public.user_profiles (id, auth_user_id, full_name, primary_role, short_bio, experience_years) VALUES  
('650e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440098', 'Мария Кофеманова', 'Бариста', 'Кофейный эксперт', 2)
ON CONFLICT (id) DO NOTHING;

-- Добавляем базовые навыки пользователям
INSERT INTO public.skills (user_id, name, category, base_level, calculated_level) VALUES
-- Алексей
('650e8400-e29b-41d4-a716-446655440001', 'Бармен', 'kitchen', 75, 75),
('650e8400-e29b-41d4-a716-446655440001', 'Кофе', 'kitchen', 60, 60),
('650e8400-e29b-41d4-a716-446655440001', 'Командная работа', 'service', 80, 80),
('650e8400-e29b-41d4-a716-446655440001', 'Управление', 'management', 45, 45),

-- Мария  
('650e8400-e29b-41d4-a716-446655440002', 'Кофе', 'kitchen', 85, 85),
('650e8400-e29b-41d4-a716-446655440002', 'Командная работа', 'service', 70, 70)
ON CONFLICT (user_id, name) DO NOTHING;

-- Создаем work_logs для триггеров автоматической выдачи бейджей
-- Алексей: добавляем записи о работе чтобы получить бейджи
INSERT INTO public.work_logs (user_id, employer_id, period_from, period_to, shifts_count, total_hours) VALUES
-- Период 1: 6 смен (должен получить бейдж "5 Shifts")
('650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '2024-01-01', '2024-01-15', 6, 48),

-- Период 2: еще 20 смен (общий счет 26, должен получить "25 Shifts") 
('650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', '2024-02-01', '2024-02-28', 20, 160),

-- Период 3: ночные смены (длинный период, должен получить "Night Owl")
('650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', '2024-03-01', '2024-03-15', 8, 64),

-- Период 4: еще смены для достижения 50 (общий счет станет 51, получит "50 Shifts")
('650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '2024-04-01', '2024-04-20', 17, 136);

-- Мария: меньше смен, получит только начальные бейджи
INSERT INTO public.work_logs (user_id, employer_id, period_from, period_to, shifts_count, total_hours) VALUES
('650e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', '2024-01-15', '2024-02-15', 12, 96),
('650e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', '2024-03-01', '2024-03-20', 15, 120);

-- Ручная выдача некоторых бейджей (симулируем работодателя)  
-- Даем Алексею бейдж Team Player за хорошую командную работу
INSERT INTO public.user_badges (badge_id, user_id, employer_id, awarded_by, source, reason) VALUES
((SELECT id FROM public.badges WHERE name = 'Team Player'), 
 '650e8400-e29b-41d4-a716-446655440001',
 '550e8400-e29b-41d4-a716-446655440001', 
 '650e8400-e29b-41d4-a716-446655440001', -- self-award для теста
 'manual', 
 'Отличная работа в команде, помогает новичкам');

-- Даем Марии бейдж Barista Silver за отличные навыки кофе
INSERT INTO public.user_badges (badge_id, user_id, employer_id, awarded_by, source, reason) VALUES
((SELECT id FROM public.badges WHERE name = 'Barista Silver'),
 '650e8400-e29b-41d4-a716-446655440002',
 '550e8400-e29b-41d4-a716-446655440002',
 '650e8400-e29b-41d4-a716-446655440002', -- self-award для теста  
 'manual',
 'Превосходное качество кофе, клиенты в восторге');

-- Создадим корпоративный бейдж от кафе "Барista"
INSERT INTO public.badges (name, description, icon_url, category, level, is_company_generated, company_id) VALUES
('Barista Cafe Star', 'Звезда кафе Барista', '⭐', 'Recommendations', 'Gold', true, '550e8400-e29b-41d4-a716-446655440002');

-- Выдаем корпоративный бейдж Марии
INSERT INTO public.user_badges (badge_id, user_id, employer_id, awarded_by, source, reason) VALUES
((SELECT id FROM public.badges WHERE name = 'Barista Cafe Star'),
 '650e8400-e29b-41d4-a716-446655440002',
 '550e8400-e29b-41d4-a716-446655440002',
 '650e8400-e29b-41d4-a716-446655440002',
 'manual',
 'Лучший сотрудник месяца в кафе Барista');

-- Создаем дополнительные связи бейджей с навыками (для демонстрации системы)
INSERT INTO public.badge_skill_links (badge_id, skill_name, delta) VALUES
-- Корпоративный бейдж дает большой бонус к кофе и командной работе
((SELECT id FROM public.badges WHERE name = 'Barista Cafe Star'), 'Кофе', 25),
((SELECT id FROM public.badges WHERE name = 'Barista Cafe Star'), 'Командная работа', 20),

-- Добавляем связи для существующих бейджей если их нет
((SELECT id FROM public.badges WHERE name = 'Punctuality'), 'Управление', 10),
((SELECT id FROM public.badges WHERE name = 'Customer Favorite'), 'Командная работа', 15),
((SELECT id FROM public.badges WHERE name = 'Night Owl'), 'Выносливость', 20)
ON CONFLICT DO NOTHING;

-- Теперь принудительно пересчитаем навыки чтобы показать влияние бейджей
SELECT public.recalc_skills('650e8400-e29b-41d4-a716-446655440001');
SELECT public.recalc_skills('650e8400-e29b-41d4-a716-446655440002');

-- Проверочные запросы (только для просмотра в логах)
DO $$
DECLARE
    user_count int;
    badge_count int; 
    skill_count int;
BEGIN
    SELECT COUNT(*) INTO user_count FROM public.user_profiles;
    SELECT COUNT(*) INTO badge_count FROM public.user_badges;
    SELECT COUNT(*) INTO skill_count FROM public.skills;
    
    RAISE NOTICE 'Test data created successfully:';
    RAISE NOTICE '- Users: %', user_count;
    RAISE NOTICE '- User badges: %', badge_count; 
    RAISE NOTICE '- Skills: %', skill_count;
    RAISE NOTICE '- Available badge templates: %', (SELECT COUNT(*) FROM public.badges);
END $$;
