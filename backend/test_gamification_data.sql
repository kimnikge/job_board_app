-- test_gamification_data.sql
-- Добавление тестовых данных для проверки системы геймификации

-- ===========================================
-- ТЕСТОВЫЕ РАБОТОДАТЕЛИ
-- ===========================================

INSERT INTO public.employers (id, name, description, industry, contact_email) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Coffee House Almaty', 'Сеть кофеен в Алматы', 'Food & Beverage', 'hr@coffeehouse.kz'),
('550e8400-e29b-41d4-a716-446655440002', 'Burger King Kazakhstan', 'Международная сеть ресторанов быстрого питания', 'Fast Food', 'jobs@burgerking.kz'),
('550e8400-e29b-41d4-a716-446655440003', 'Dastarkhan Restaurant', 'Традиционный казахский ресторан', 'Traditional Cuisine', 'contact@dastarkhan.kz');

-- ===========================================
-- ТЕСТОВЫЕ ПОЛЬЗОВАТЕЛИ
-- ===========================================

INSERT INTO public.user_profiles (id, email, full_name, phone, location, bio, experience_years) VALUES
('650e8400-e29b-41d4-a716-446655440001', 'aibek.worker@example.com', 'Айбек Работник', '+7 777 123 4567', 'Алматы', 'Опытный повар и бариста', 3),
('650e8400-e29b-41d4-a716-446655440002', 'maria.coffeelover@example.com', 'Мария Кофеманова', '+7 708 987 6543', 'Алматы', 'Люблю работать с людьми и готовить кофе', 1),
('650e8400-e29b-41d4-a716-446655440003', 'nurlan.professional@example.com', 'Нурлан Профессионал', '+7 705 555 1234', 'Алматы', 'Менеджер с опытом в ресторанном бизнесе', 5);

-- ===========================================
-- БАЗОВЫЕ НАВЫКИ ДЛЯ ПОЛЬЗОВАТЕЛЕЙ
-- ===========================================

-- Навыки для Айбека (опытный)
INSERT INTO public.skills (user_id, name, base_level) VALUES
('650e8400-e29b-41d4-a716-446655440001', 'Кулинария', 75),
('650e8400-e29b-41d4-a716-446655440001', 'Обслуживание клиентов', 60),
('650e8400-e29b-41d4-a716-446655440001', 'Коммуникация', 55),
('650e8400-e29b-41d4-a716-446655440001', 'Работа в команде', 70);

-- Навыки для Марии (новичок)
INSERT INTO public.skills (user_id, name, base_level) VALUES
('650e8400-e29b-41d4-a716-446655440002', 'Обслуживание клиентов', 30),
('650e8400-e29b-41d4-a716-446655440002', 'Коммуникация', 45),
('650e8400-e29b-41d4-a716-446655440002', 'Кулинария', 20);

-- Навыки для Нурлана (профессионал)
INSERT INTO public.skills (user_id, name, base_level) VALUES
('650e8400-e29b-41d4-a716-446655440003', 'Лидерство', 85),
('650e8400-e29b-41d4-a716-446655440003', 'Коммуникация', 90),
('650e8400-e29b-41d4-a716-446655440003', 'Обслуживание клиентов', 80),
('650e8400-e29b-41d4-a716-446655440003', 'Тайм-менеджмент', 75);

-- ===========================================
-- СВЯЗИ БЕЙДЖЕЙ С НАВЫКАМИ (дополнительные)
-- ===========================================

-- Добавляем связи для лидерских навыков
INSERT INTO public.badge_skill_links (badge_id, skill_name, delta) 
SELECT b.id, 'Лидерство', 
    CASE b.level 
        WHEN 'Bronze' THEN 8
        WHEN 'Silver' THEN 12  
        WHEN 'Gold' THEN 18
        WHEN 'Platinum' THEN 25
    END
FROM public.badges b
WHERE b.category = 'Soft Skills';

-- Добавляем связи для тайм-менеджмента
INSERT INTO public.badge_skill_links (badge_id, skill_name, delta) 
SELECT b.id, 'Тайм-менеджмент', 
    CASE b.level 
        WHEN 'Bronze' THEN 5
        WHEN 'Silver' THEN 8  
        WHEN 'Gold' THEN 12
        WHEN 'Platinum' THEN 18
    END
FROM public.badges b
WHERE b.category IN ('Experience', 'Other');

-- ===========================================
-- ТЕСТОВЫЕ WORK_LOGS (АВТОМАТИЧЕСКИ ВЫДАДУТ БЕЙДЖИ)
-- ===========================================

-- Work logs для Айбека (опытный работник) - должны выдаться бейджи Experience
INSERT INTO public.work_logs (user_id, employer_id, period_from, period_to, shifts_count, total_hours, performance_rating, employer_notes) VALUES
-- Первая работа в Coffee House (давно)
('650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '2023-01-01', '2023-01-31', 20, 160, 4.2, 'Хорошо справляется с обязанностями'),
-- Продолжение в Coffee House
('650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '2023-02-01', '2023-02-28', 18, 144, 4.5, 'Улучшение в скорости работы'),
-- Работа в Burger King
('650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', '2023-06-01', '2023-06-30', 22, 176, 4.7, 'Отличная адаптация к новым условиям'),
-- Еще периоды для накопления опыта (для Silver badge)
('650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '2023-09-01', '2023-09-30', 15, 120, 4.8, 'Стабильно высокое качество');

-- Work logs для Марии (новичок) - первый бейдж
INSERT INTO public.work_logs (user_id, employer_id, period_from, period_to, shifts_count, total_hours, performance_rating, employer_notes) VALUES
-- Первая работа - должен выдаться First Steps
('650e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', '2024-07-01', '2024-07-15', 10, 80, 3.8, 'Новичок, но старается');

-- Work logs для Нурлана (много опыта) - должны выдаться высокие бейджи
INSERT INTO public.work_logs (user_id, employer_id, period_from, period_to, shifts_count, total_hours, performance_rating, employer_notes) VALUES
-- Большой опыт работы в Dastarkhan
('650e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', '2022-01-01', '2022-12-31', 180, 1440, 4.9, 'Exceptional manager, great leadership'),
-- Продолжение работы
('650e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', '2023-01-01', '2023-12-31', 200, 1600, 4.8, 'Consistent high performance'),
-- Работа в Coffee House (новый работодатель)
('650e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', '2024-01-01', '2024-06-30', 90, 720, 4.9, 'Brings valuable experience');

-- ===========================================
-- РУЧНАЯ ВЫДАЧА НЕКОТОРЫХ БЕЙДЖЕЙ ДЛЯ ТЕСТИРОВАНИЯ
-- ===========================================

-- Выдаем Hard Skills бейдж Айбеку за кулинарные навыки
INSERT INTO public.user_badges (badge_id, user_id, employer_id, awarded_by, reason, source) 
SELECT 
    b.id,
    '650e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440001',
    'Отличные кулинарные навыки, освоил все основные блюда',
    'manual'
FROM public.badges b 
WHERE b.name = 'Hard Skills Practitioner';

-- Выдаем Team Contribution бейдж Нурлану за лидерство
INSERT INTO public.user_badges (badge_id, user_id, employer_id, awarded_by, reason, source) 
SELECT 
    b.id,
    '650e8400-e29b-41d4-a716-446655440003',
    '550e8400-e29b-41d4-a716-446655440003',
    '550e8400-e29b-41d4-a716-446655440003',
    'Выдающееся лидерство, помогает команде достигать целей',
    'manual'
FROM public.badges b 
WHERE b.name = 'Team Champion';

-- ===========================================
-- ПЕРЕСЧЕТ НАВЫКОВ ПОСЛЕ ВЫДАЧИ БЕЙДЖЕЙ
-- ===========================================

-- Пересчитываем навыки для всех пользователей
SELECT public.recalculate_user_skills('650e8400-e29b-41d4-a716-446655440001');
SELECT public.recalculate_user_skills('650e8400-e29b-41d4-a716-446655440002');
SELECT public.recalculate_user_skills('650e8400-e29b-41d4-a716-446655440003');

-- ===========================================
-- ПРОВЕРКА РЕЗУЛЬТАТОВ
-- ===========================================

-- Проверяем автоматически выданные бейджи
SELECT 
    'Автоматически выданные бейджи' as check_type,
    up.full_name,
    b.name as badge_name,
    b.category,
    b.level,
    ub.reason
FROM public.user_badges ub
JOIN public.badges b ON ub.badge_id = b.id
JOIN public.user_profiles up ON ub.user_id = up.id
WHERE ub.source = 'auto'
ORDER BY up.full_name, ub.awarded_at;

-- Проверяем пересчитанные навыки
SELECT 
    'Навыки с бонусами от бейджей' as check_type,
    up.full_name,
    s.name as skill_name,
    s.base_level,
    s.calculated_level,
    (s.calculated_level - s.base_level) as badge_bonus
FROM public.skills s
JOIN public.user_profiles up ON s.user_id = up.id
WHERE s.calculated_level != s.base_level
ORDER BY up.full_name, s.calculated_level DESC;

-- Общая статистика
SELECT 
    'Общая статистика системы' as check_type,
    COUNT(DISTINCT up.id) as total_users,
    COUNT(DISTINCT e.id) as total_employers,
    COUNT(DISTINCT b.id) as total_badges,
    COUNT(ub.id) as total_badge_awards,
    COUNT(ub.id) FILTER (WHERE ub.source = 'auto') as auto_awards,
    COUNT(ub.id) FILTER (WHERE ub.source = 'manual') as manual_awards
FROM public.user_profiles up
CROSS JOIN public.employers e
CROSS JOIN public.badges b
LEFT JOIN public.user_badges ub ON true;

SELECT 'Test data created successfully! System is ready for testing!' as status;
