-- Тестовые данные для HR-платформы общепита
-- Создаем все необходимые справочники и основные данные

-- 1. Сначала добавляем справочники
INSERT INTO specializations (name, description) VALUES
('Повар-тест', 'Приготовление блюд в ресторане'),
('Официант-тест', 'Обслуживание гостей в зале'),
('Бармен-тест', 'Приготовление напитков и коктейлей'),
('Кондитер-тест', 'Приготовление десертов и выпечки'),
('Су-шеф-тест', 'Помощник главного повара'),
('Хостес-тест', 'Встреча и размещение гостей'),
('Мойщик посуды-тест', 'Мытье посуды и кухонной утвари'),
('Администратор-тест', 'Управление рестораном')
ON CONFLICT (name) DO NOTHING;

INSERT INTO city_districts (name, city) VALUES
('Центр-тест', 'Москва'),
('Арбат-тест', 'Москва'),
('Сокольники-тест', 'Москва'),
('Марьино-тест', 'Москва'),
('Невский-тест', 'Санкт-Петербург'),
('Василеостровский-тест', 'Санкт-Петербург'),
('Кировский-тест', 'Санкт-Петербург'),
('Ленинский-тест', 'Новосибирск')
ON CONFLICT (name) DO NOTHING;

INSERT INTO venue_types (name, description) VALUES
('Ресторан-тест', 'Полноценный ресторан с официантами'),
('Кафе-тест', 'Небольшое заведение быстрого питания'),
('Бар-тест', 'Питейное заведение с закусками'),
('Пиццерия-тест', 'Специализация на пицце'),
('Суши-бар-тест', 'Японская кухня'),
('Кондитерская-тест', 'Специализация на десертах'),
('Фастфуд-тест', 'Быстрое питание'),
('Банкетный зал-тест', 'Проведение мероприятий')
ON CONFLICT (name) DO NOTHING;

-- 2. Создаем тестовые компании
INSERT INTO companies (
    name, 
    description, 
    industry, 
    location, 
    website, 
    employees_count, 
    status,
    created_at
) VALUES
('Ресторан Белуга-тест', 'Премиальный ресторан с авторской кухней', 'Ресторанный бизнес', 'Москва, Центр', 'https://beluga-test.ru', 50, 'active', NOW()),
('Кафе Шоколадница-тест', 'Сеть кофеен с домашней атмосферой', 'Кафе и кофейни', 'Москва, Арбат', 'https://shokoladnitsa-test.ru', 200, 'active', NOW()),
('Суши Мастер-тест', 'Японская кухня высокого качества', 'Азиатская кухня', 'СПб, Невский', 'https://sushi-master-test.ru', 30, 'active', NOW()),
('Пиццерия Мама Рома-тест', 'Итальянская пиццерия с аутентичными рецептами', 'Итальянская кухня', 'Москва, Сокольники', 'https://mama-roma-test.ru', 25, 'active', NOW()),
('Бар Лофт-тест', 'Стильный бар с крафтовыми коктейлями', 'Бары и пабы', 'СПб, Василеостровский', 'https://loft-bar-test.ru', 15, 'active', NOW()),
('Кондитерская Сладкий дом-тест', 'Домашние торты и десерты', 'Кондитерские', 'Москва, Марьино', 'https://sweet-home-test.ru', 8, 'active', NOW()),
('Ресторан Усадьба-тест', 'Русская кухня в уютной обстановке', 'Русская кухня', 'Новосибирск, Ленинский', 'https://usadba-test.ru', 40, 'active', NOW()),
('FastFood Бургер Кинг-тест', 'Быстрое питание для активных людей', 'Фастфуд', 'СПб, Кировский', 'https://burger-king-test.ru', 80, 'active', NOW());

-- 3. Создаем тестовых пользователей напрямую в auth.users (обходим email confirmation)
-- Сначала получаем ID справочников для использования в дальнейшем
WITH specialization_ids AS (
    SELECT id, name FROM specializations WHERE name LIKE '%-тест'
),
district_ids AS (
    SELECT id, name FROM city_districts WHERE name LIKE '%-тест'
),
venue_type_ids AS (
    SELECT id, name FROM venue_types WHERE name LIKE '%-тест'
),
company_ids AS (
    SELECT id, name FROM companies WHERE name LIKE '%-тест'
)

-- 4. Создаем кандидатов напрямую в candidate_profiles (без auth)
INSERT INTO candidate_profiles (
    id,
    full_name,
    email,
    phone,
    date_of_birth,
    location,
    specialization_id,
    experience_years,
    skills,
    work_schedule,
    desired_salary_min,
    desired_salary_max,
    is_available,
    bio,
    avatar_url,
    created_at
)
SELECT 
    gen_random_uuid(),
    'Анна Петрова-тест',
    'anna.petrova.test@example.com',
    '+7 (915) 123-45-67',
    '1995-03-15',
    'Москва, Центр',
    s.id,
    3,
    ARRAY['Приготовление горячих блюд', 'Работа с морепродуктами', 'Французская кухня'],
    'Полный день',
    60000,
    80000,
    true,
    'Опытный повар с любовью к кулинарии. Специализируюсь на французской кухне.',
    'https://randomuser.me/api/portraits/women/1.jpg',
    NOW() - INTERVAL '5 days'
FROM specialization_ids s WHERE s.name = 'Повар-тест'

UNION ALL

SELECT 
    gen_random_uuid(),
    'Дмитрий Сидоров-тест',
    'dmitry.sidorov.test@example.com',
    '+7 (916) 234-56-78',
    '1992-07-22',
    'Москва, Арбат',
    s.id,
    5,
    ARRAY['Обслуживание VIP-гостей', 'Знание винной карты', 'Английский язык'],
    'Посменно',
    45000,
    65000,
    true,
    'Профессиональный официант с большим опытом работы в премиальных ресторанах.',
    'https://randomuser.me/api/portraits/men/2.jpg',
    NOW() - INTERVAL '3 days'
FROM specialization_ids s WHERE s.name = 'Официант-тест'

UNION ALL

SELECT 
    gen_random_uuid(),
    'Елена Козлова-тест',
    'elena.kozlova.test@example.com',
    '+7 (917) 345-67-89',
    '1988-11-08',
    'СПб, Невский',
    s.id,
    7,
    ARRAY['Классические коктейли', 'Авторские миксы', 'Флейринг'],
    'Вечерние смены',
    50000,
    70000,
    true,
    'Креативный бармен с международными сертификатами. Люблю создавать новые коктейли.',
    'https://randomuser.me/api/portraits/women/3.jpg',
    NOW() - INTERVAL '7 days'
FROM specialization_ids s WHERE s.name = 'Бармен-тест'

UNION ALL

SELECT 
    gen_random_uuid(),
    'Александр Морозов-тест',
    'alex.morozov.test@example.com',
    '+7 (918) 456-78-90',
    '1990-05-17',
    'Москва, Сокольники',
    s.id,
    4,
    ARRAY['Французские десерты', 'Шоколадная продукция', 'Свадебные торты'],
    'Дневные смены',
    55000,
    75000,
    true,
    'Талантливый кондитер, специалист по французским десертам и праздничным тортам.',
    'https://randomuser.me/api/portraits/men/4.jpg',
    NOW() - INTERVAL '2 days'
FROM specialization_ids s WHERE s.name = 'Кондитер-тест'

UNION ALL

SELECT 
    gen_random_uuid(),
    'Мария Волкова-тест',
    'maria.volkova.test@example.com',
    '+7 (919) 567-89-01',
    '1993-09-25',
    'СПб, Василеостровский',
    s.id,
    6,
    ARRAY['Управление кухней', 'Составление меню', 'Контроль качества'],
    'Полный день',
    80000,
    120000,
    true,
    'Опытный су-шеф с навыками управления. Отвечаю за качество всех блюд.',
    'https://randomuser.me/api/portraits/women/5.jpg',
    NOW() - INTERVAL '1 day'
FROM specialization_ids s WHERE s.name = 'Су-шеф-тест'

UNION ALL

SELECT 
    gen_random_uuid(),
    'Ольга Новикова-тест',
    'olga.novikova.test@example.com',
    '+7 (920) 678-90-12',
    '1996-12-03',
    'Москва, Марьино',
    s.id,
    2,
    ARRAY['Встреча гостей', 'Бронирование столиков', 'Немецкий язык'],
    'Вечерние смены',
    35000,
    50000,
    true,
    'Дружелюбная хостес, создаю приятное первое впечатление для гостей.',
    'https://randomuser.me/api/portraits/women/6.jpg',
    NOW() - INTERVAL '4 days'
FROM specialization_ids s WHERE s.name = 'Хостес-тест'

UNION ALL

SELECT 
    gen_random_uuid(),
    'Игорь Белов-тест',
    'igor.belov.test@example.com',
    '+7 (921) 789-01-23',
    '1985-04-14',
    'Новосибирск, Ленинский',
    s.id,
    8,
    ARRAY['Управление рестораном', 'Работа с персоналом', 'Финансовое планирование'],
    'Полный день',
    90000,
    150000,
    true,
    'Опытный администратор ресторана. Эффективно управляю всеми процессами.',
    'https://randomuser.me/api/portraits/men/7.jpg',
    NOW() - INTERVAL '6 days'
FROM specialization_ids s WHERE s.name = 'Администратор-тест';

-- 5. Создаем работодателей
INSERT INTO employer_profiles (
    id,
    full_name,
    email,
    phone,
    position,
    company_id,
    created_at
)
SELECT 
    gen_random_uuid(),
    'Иван Ресторанов-тест',
    'ivan.restoranov.test@example.com',
    '+7 (925) 111-22-33',
    'Управляющий',
    c.id,
    NOW() - INTERVAL '10 days'
FROM company_ids c WHERE c.name = 'Ресторан Белуга-тест'

UNION ALL

SELECT 
    gen_random_uuid(),
    'Светлана Кафеева-тест',
    'svetlana.kafeeva.test@example.com',
    '+7 (925) 222-33-44',
    'HR-менеджер',
    c.id,
    NOW() - INTERVAL '8 days'
FROM company_ids c WHERE c.name = 'Кафе Шоколадница-тест'

UNION ALL

SELECT 
    gen_random_uuid(),
    'Такеши Сушилов-тест',
    'takeshi.sushilov.test@example.com',
    '+7 (925) 333-44-55',
    'Шеф-повар',
    c.id,
    NOW() - INTERVAL '12 days'
FROM company_ids c WHERE c.name = 'Суши Мастер-тест'

UNION ALL

SELECT 
    gen_random_uuid(),
    'Марко Пиццаро-тест',
    'marko.pizzaro.test@example.com',
    '+7 (925) 444-55-66',
    'Владелец',
    c.id,
    NOW() - INTERVAL '15 days'
FROM company_ids c WHERE c.name = 'Пиццерия Мама Рома-тест';

-- 6. Создаем срочные вакансии
INSERT INTO urgent_jobs (
    title,
    description,
    venue_name,
    venue_type_id,
    address,
    city_district_id,
    specialization_id,
    needed_date,
    needed_time,
    duration_hours,
    pay_per_shift,
    requirements,
    contact_person,
    contact_phone,
    contact_email,
    status,
    created_at
)
SELECT 
    'Повар на завтрак-тест',
    'Срочно нужен повар для приготовления завтраков. Работа в утреннюю смену.',
    'Ресторан Белуга-тест',
    vt.id,
    'ул. Тверская, 15',
    d.id,
    s.id,
    CURRENT_DATE + INTERVAL '1 day',
    '07:00',
    8,
    3500,
    ARRAY['Опыт работы поваром', 'Знание европейской кухни', 'Медицинская книжка'],
    'Иван Ресторанов-тест',
    '+7 (925) 111-22-33',
    'ivan.restoranov.test@example.com',
    'active',
    NOW() - INTERVAL '2 hours'
FROM specialization_ids s, district_ids d, venue_type_ids vt
WHERE s.name = 'Повар-тест' AND d.name = 'Центр-тест' AND vt.name = 'Ресторан-тест'

UNION ALL

SELECT 
    'Официант на банкет-тест',
    'Требуется опытный официант для обслуживания банкета на 100 человек.',
    'Банкетный зал Усадьба-тест',
    vt.id,
    'ул. Красный проспект, 50',
    d.id,
    s.id,
    CURRENT_DATE + INTERVAL '2 days',
    '16:00',
    6,
    2800,
    ARRAY['Опыт банкетного обслуживания', 'Презентабельный внешний вид', 'Стрессоустойчивость'],
    'Игорь Белов-тест',
    '+7 (921) 789-01-23',
    'igor.belov.test@example.com',
    'active',
    NOW() - INTERVAL '1 hour'
FROM specialization_ids s, district_ids d, venue_type_ids vt
WHERE s.name = 'Официант-тест' AND d.name = 'Ленинский-тест' AND vt.name = 'Банкетный зал-тест'

UNION ALL

SELECT 
    'Бармен в выходные-тест',
    'Нужен бармен на выходные дни в популярный бар.',
    'Бар Лофт-тест',
    vt.id,
    'Васильевский остров, 25',
    d.id,
    s.id,
    CURRENT_DATE + INTERVAL '3 days',
    '20:00',
    10,
    4200,
    ARRAY['Знание классических коктейлей', 'Быстрая работа', 'Коммуникабельность'],
    'Светлана Кафеева-тест',
    '+7 (925) 222-33-44',
    'svetlana.kafeeva.test@example.com',
    'active',
    NOW() - INTERVAL '30 minutes'
FROM specialization_ids s, district_ids d, venue_type_ids vt
WHERE s.name = 'Бармен-тест' AND d.name = 'Василеостровский-тест' AND vt.name = 'Бар-тест'

UNION ALL

SELECT 
    'Кондитер на праздник-тест',
    'Требуется кондитер для изготовления праздничных тортов.',
    'Кондитерская Сладкий дом-тест',
    vt.id,
    'ул. Братиславская, 10',
    d.id,
    s.id,
    CURRENT_DATE,
    '09:00',
    12,
    5000,
    ARRAY['Опыт изготовления тортов', 'Художественные навыки', 'Креативность'],
    'Марко Пиццаро-тест',
    '+7 (925) 444-55-66',
    'marko.pizzaro.test@example.com',
    'active',
    NOW() - INTERVAL '3 hours'
FROM specialization_ids s, district_ids d, venue_type_ids vt
WHERE s.name = 'Кондитер-тест' AND d.name = 'Марьино-тест' AND vt.name = 'Кондитерская-тест'

UNION ALL

SELECT 
    'Мойщик посуды срочно-тест',
    'Экстренно нужен мойщик посуды, предыдущий сотрудник заболел.',
    'Пиццерия Мама Рома-тест',
    vt.id,
    'Сокольническая площадь, 3',
    d.id,
    s.id,
    CURRENT_DATE,
    '14:00',
    8,
    2000,
    ARRAY['Ответственность', 'Физическая выносливость', 'Медицинская книжка'],
    'Такеши Сушилов-тест',
    '+7 (925) 333-44-55',
    'takeshi.sushilov.test@example.com',
    'active',
    NOW() - INTERVAL '4 hours'
FROM specialization_ids s, district_ids d, venue_type_ids vt
WHERE s.name = 'Мойщик посуды-тест' AND d.name = 'Сокольники-тест' AND vt.name = 'Пиццерия-тест'

UNION ALL

SELECT 
    'Хостес на вечер-тест',
    'Требуется хостес для встречи гостей в пятницу вечером.',
    'Суши Мастер-тест',
    vt.id,
    'Невский проспект, 80',
    d.id,
    s.id,
    CURRENT_DATE + INTERVAL '4 days',
    '18:00',
    5,
    1800,
    ARRAY['Знание английского языка', 'Приятная внешность', 'Коммуникабельность'],
    'Иван Ресторанов-тест',
    '+7 (925) 111-22-33',
    'ivan.restoranov.test@example.com',
    'active',
    NOW() - INTERVAL '6 hours'
FROM specialization_ids s, district_ids d, venue_type_ids vt
WHERE s.name = 'Хостес-тест' AND d.name = 'Невский-тест' AND vt.name = 'Суши-бар-тест';

-- 7. Создаем обычные вакансии
INSERT INTO job_postings (
    title,
    description,
    company_id,
    location,
    employment_type,
    experience_level,
    salary_min,
    salary_max,
    requirements,
    benefits,
    status,
    created_at
)
SELECT 
    'Шеф-повар в премиум ресторан-тест',
    'Ищем талантливого шеф-повара для работы в премиальном ресторане. Возможность реализации творческих идей.',
    c.id,
    'Москва, Центр',
    'Полная занятость',
    'Старший',
    120000,
    180000,
    ARRAY['Высшее кулинарное образование', 'Опыт работы шеф-поваром от 5 лет', 'Знание современных кулинарных трендов'],
    ARRAY['Полный соц. пакет', 'Обучение за счет компании', 'Премии за результат'],
    'active',
    NOW() - INTERVAL '1 day'
FROM company_ids c WHERE c.name = 'Ресторан Белуга-тест'

UNION ALL

SELECT 
    'Официант в кофейню-тест',
    'Приглашаем дружелюбного официанта в уютную кофейню с домашней атмосферой.',
    c.id,
    'Москва, Арбат',
    'Частичная занятость',
    'Средний',
    40000,
    55000,
    ARRAY['Опыт работы официантом от 1 года', 'Дружелюбность', 'Знание ассортимента кофе'],
    ARRAY['Гибкий график', 'Чаевые', 'Скидки на продукцию'],
    'active',
    NOW() - INTERVAL '3 days'
FROM company_ids c WHERE c.name = 'Кафе Шоколадница-тест'

UNION ALL

SELECT 
    'Повар суши-тест',
    'Требуется повар для приготовления суши и роллов в японском ресторане.',
    c.id,
    'СПб, Невский',
    'Полная занятость',
    'Средний',
    60000,
    85000,
    ARRAY['Знание японской кухни', 'Опыт приготовления суши от 2 лет', 'Аккуратность'],
    ARRAY['Обучение японской кухне', 'Стабильная зарплата', 'Карьерный рост'],
    'active',
    NOW() - INTERVAL '5 days'
FROM company_ids c WHERE c.name = 'Суши Мастер-тест'

UNION ALL

SELECT 
    'Пиццайоло-тест',
    'Ищем мастера по приготовлению настоящей итальянской пиццы.',
    c.id,
    'Москва, Сокольники',
    'Полная занятость',
    'Средний',
    50000,
    70000,
    ARRAY['Опыт приготовления пиццы', 'Знание итальянских рецептов', 'Быстрота работы'],
    ARRAY['Итальянские продукты', 'Дружная команда', 'Возможность обучения'],
    'active',
    NOW() - INTERVAL '2 days'
FROM company_ids c WHERE c.name = 'Пиццерия Мама Рома-тест';

-- Добавляем статистические данные для красивых цифр на главной
UPDATE companies SET employees_count = FLOOR(RANDOM() * 100) + 10 WHERE name LIKE '%-тест';

COMMIT;
