-- ПОЛНОЦЕННЫЕ ТЕСТОВЫЕ ДАННЫЕ ДЛЯ ОБЩЕПИТА АСТАНЫ
-- Создание реальных пользователей, компаний, вакансий и резюме
-- Дата: 8 августа 2025

BEGIN;

-- ====================================================================
-- ЭТАП 1: СОЗДАНИЕ ТЕСТОВЫХ ПОЛЬЗОВАТЕЛЕЙ
-- ====================================================================

-- Сначала создаем профили пользователей
INSERT INTO profiles (
    id, 
    email, 
    full_name, 
    phone, 
    avatar_url, 
    user_type, 
    city_district_id,
    date_of_birth,
    experience_years,
    is_verified,
    created_at
) VALUES
-- Работодатели (владельцы заведений)
(gen_random_uuid(), 'arman.nazarbayev@astanafood.kz', 'Арман Назарбаев', '+77011234567', NULL, 'employer', 2, '1985-03-15', 12, true, NOW() - INTERVAL '2 years'),
(gen_random_uuid(), 'aigul.suleimanova@goldenpalace.kz', 'Айгуль Сулейманова', '+77012345678', NULL, 'employer', 1, '1980-07-22', 18, true, NOW() - INTERVAL '3 years'),
(gen_random_uuid(), 'serik.tastanov@nomadkitchen.kz', 'Серик Тастанов', '+77013456789', NULL, 'employer', 3, '1978-11-30', 22, true, NOW() - INTERVAL '5 years'),
(gen_random_uuid(), 'madina.bekmukhanova@coffeeclub.kz', 'Мадина Бекмуханова', '+77014567890', NULL, 'employer', 4, '1988-05-10', 8, true, NOW() - INTERVAL '1 year'),
(gen_random_uuid(), 'aibek.zhakenov@pizzamaster.kz', 'Айбек Жакенов', '+77015678901', NULL, 'employer', 2, '1982-09-18', 15, true, NOW() - INTERVAL '4 years'),

-- Соискатели (работники общепита)
(gen_random_uuid(), 'aliya.zhaksylykova@gmail.com', 'Алия Жақсылықова', '+77021234567', NULL, 'jobseeker', 1, '1995-12-05', 5, true, NOW() - INTERVAL '6 months'),
(gen_random_uuid(), 'daulet.mukhametov@mail.ru', 'Даулет Мухаметов', '+77022345678', NULL, 'jobseeker', 2, '1992-04-18', 8, true, NOW() - INTERVAL '1 year'),
(gen_random_uuid(), 'aida.nurpeisova@gmail.com', 'Аида Нурпеисова', '+77023456789', NULL, 'jobseeker', 3, '1998-08-25', 2, true, NOW() - INTERVAL '3 months'),
(gen_random_uuid(), 'erlan.sansyzbaev@yandex.kz', 'Ерлан Сансызбаев', '+77024567890', NULL, 'jobseeker', 4, '1990-01-12', 10, true, NOW() - INTERVAL '8 months'),
(gen_random_uuid(), 'zhanel.omarova@gmail.com', 'Жанель Омарова', '+77025678901', NULL, 'jobseeker', 5, '1997-06-30', 3, true, NOW() - INTERVAL '4 months'),
(gen_random_uuid(), 'azamat.saduakasov@mail.ru', 'Азамат Садуакасов', '+77026789012', NULL, 'jobseeker', 1, '1994-10-08', 6, true, NOW() - INTERVAL '2 months'),
(gen_random_uuid(), 'amina.kozhakhmetova@gmail.com', 'Амина Кожахметова', '+77027890123', NULL, 'jobseeker', 2, '1996-03-22', 4, true, NOW() - INTERVAL '5 months'),
(gen_random_uuid(), 'nursultan.bekzatov@yandex.kz', 'Нурсултан Бекзатов', '+77028901234', NULL, 'jobseeker', 3, '1991-07-14', 9, true, NOW() - INTERVAL '7 months'),
(gen_random_uuid(), 'anar.rakhmanova@gmail.com', 'Анар Рахманова', '+77029012345', NULL, 'jobseeker', 4, '1999-11-03', 1, true, NOW() - INTERVAL '1 month'),
(gen_random_uuid(), 'galym.tursynov@mail.ru', 'Галым Турсынов', '+77020123456', NULL, 'jobseeker', 5, '1993-02-27', 7, true, NOW() - INTERVAL '9 months');

-- ====================================================================
-- ЭТАП 2: СОЗДАНИЕ КОМПАНИЙ/ЗАВЕДЕНИЙ
-- ====================================================================

INSERT INTO companies (
    id,
    name,
    description,
    industry,
    size,
    website,
    email,
    phone,
    address,
    city_district_id,
    logo_url,
    is_verified,
    owner_id,
    created_at
) VALUES
(gen_random_uuid(), 
 'Ресторан "Астана"', 
 'Премиальный ресторан казахской и европейской кухни в центре Астаны. Известен авторскими блюдами шеф-повара и безупречным сервисом.',
 'Ресторан',
 'medium',
 'https://astanarestaurant.kz',
 'info@astanarestaurant.kz',
 '+77172501234',
 'пр. Республики, 15',
 2,
 '/images/companies/astana-restaurant.jpg',
 true,
 (SELECT id FROM profiles WHERE email = 'arman.nazarbayev@astanafood.kz'),
 NOW() - INTERVAL '2 years'),

(gen_random_uuid(),
 'Golden Palace',
 'Роскошный банкетный зал и ресторан для проведения торжеств. Специализируется на казахской национальной кухне и европейских деликатесах.',
 'Банкетный зал',
 'large',
 'https://goldenpalace.kz',
 'booking@goldenpalace.kz',
 '+77172505678',
 'ул. Кунаева, 12/1',
 1,
 '/images/companies/golden-palace.jpg',
 true,
 (SELECT id FROM profiles WHERE email = 'aigul.suleimanova@goldenpalace.kz'),
 NOW() - INTERVAL '3 years'),

(gen_random_uuid(),
 'Nomad Kitchen',
 'Современная интерпретация казахской кухни. Используем только местные продукты и традиционные рецепты с современной подачей.',
 'Ресторан',
 'small',
 'https://nomadkitchen.kz',
 'chef@nomadkitchen.kz',
 '+77172509876',
 'ул. Достык, 8',
 3,
 '/images/companies/nomad-kitchen.jpg',
 true,
 (SELECT id FROM profiles WHERE email = 'serik.tastanov@nomadkitchen.kz'),
 NOW() - INTERVAL '5 years'),

(gen_random_uuid(),
 'Coffee Club',
 'Сеть кофеен премиум-класса. Собственная обжарка зерен, авторские десерты, уютная атмосфера для работы и встреч.',
 'Кофейня',
 'medium',
 'https://coffeeclub.kz',
 'hello@coffeeclub.kz',
 '+77172512345',
 'ТРЦ "Хан Шатыр", 2 этаж',
 4,
 '/images/companies/coffee-club.jpg',
 true,
 (SELECT id FROM profiles WHERE email = 'madina.bekmukhanova@coffeeclub.kz'),
 NOW() - INTERVAL '1 year'),

(gen_random_uuid(),
 'Pizza Master',
 'Пиццерия с дровяной печью. Итальянские традиции в сердце Астаны. Доставка по всему городу за 30 минут.',
 'Пиццерия',
 'medium',
 'https://pizzamaster.kz',
 'order@pizzamaster.kz',
 '+77172515432',
 'ул. Абая, 25',
 2,
 '/images/companies/pizza-master.jpg',
 true,
 (SELECT id FROM profiles WHERE email = 'aibek.zhakenov@pizzamaster.kz'),
 NOW() - INTERVAL '4 years');

-- ====================================================================
-- ЭТАП 3: СОЗДАНИЕ СРОЧНЫХ ВАКАНСИЙ
-- ====================================================================

INSERT INTO urgent_jobs (
    id,
    title,
    description,
    company_id,
    specialization_id,
    employment_type,
    location,
    city_district_id,
    salary_min,
    salary_max,
    pay_per_shift,
    currency,
    needed_date,
    needed_time,
    shift_duration,
    contact_person,
    contact_phone,
    contact_telegram,
    auto_close_at,
    notification_priority,
    status,
    created_by,
    created_at,
    tags
) VALUES
-- Срочно нужен повар в Golden Palace
(gen_random_uuid(),
 'СРОЧНО! Повар в банкетный зал',
 'Требуется опытный повар для работы в банкетном зале на корпоратив. Знание казахской и европейской кухни обязательно. Высокая оплата за срочность!',
 (SELECT id FROM companies WHERE name = 'Golden Palace'),
 (SELECT id FROM specializations WHERE name = 'Повар'),
 'temporary',
 'ул. Кунаева, 12/1',
 1,
 15000,
 25000,
 20000,
 'KZT',
 CURRENT_DATE + INTERVAL '1 day',
 '18:00',
 '6 часов',
 'Айгуль Сулейманова',
 '+77172505678',
 'aigul_chef',
 NOW() + INTERVAL '2 days',
 1,
 'open',
 (SELECT id FROM profiles WHERE email = 'aigul.suleimanova@goldenpalace.kz'),
 NOW() - INTERVAL '2 hours',
 ARRAY['срочно', 'банкет', 'высокая_оплата', 'опыт_обязателен']),

-- Срочно официант в ресторан Астана
(gen_random_uuid(),
 'Официант на вечернюю смену СЕГОДНЯ',
 'Заболел официант, срочно нужна замена на вечернюю смену. Опыт работы в ресторанах обязателен. Знание английского языка приветствуется.',
 (SELECT id FROM companies WHERE name = 'Ресторан "Астана"'),
 (SELECT id FROM specializations WHERE name = 'Официант'),
 'temporary',
 'пр. Республики, 15',
 2,
 8000,
 12000,
 10000,
 'KZT',
 CURRENT_DATE,
 '17:00',
 '8 часов',
 'Арман Назарбаев',
 '+77011234567',
 'arman_astana',
 NOW() + INTERVAL '4 hours',
 1,
 'open',
 (SELECT id FROM profiles WHERE email = 'arman.nazarbayev@astanafood.kz'),
 NOW() - INTERVAL '1 hour',
 ARRAY['срочно', 'вечерняя_смена', 'опыт_в_ресторане', 'английский_плюс']),

-- Срочно кассир в Pizza Master
(gen_random_uuid(),
 'Кассир-администратор на выходные',
 'Нужен кассир на выходные дни в пиццерию. Работа с кассовым аппаратом, прием заказов, работа с клиентами. Дружный коллектив!',
 (SELECT id FROM companies WHERE name = 'Pizza Master'),
 (SELECT id FROM specializations WHERE name = 'Кассир'),
 'temporary',
 'ул. Абая, 25',
 2,
 6000,
 10000,
 8000,
 'KZT',
 CURRENT_DATE + INTERVAL '2 days',
 '10:00',
 '12 часов',
 'Айбек Жакенов',
 '+77015678901',
 'aibek_pizza',
 NOW() + INTERVAL '1 day',
 2,
 'open',
 (SELECT id FROM profiles WHERE email = 'aibek.zhakenov@pizzamaster.kz'),
 NOW() - INTERVAL '30 minutes',
 ARRAY['выходные', 'касса', 'клиенты', 'дружный_коллектив']);

-- ====================================================================
-- ЭТАП 4: СОЗДАНИЕ ОБЫЧНЫХ ВАКАНСИЙ
-- ====================================================================

INSERT INTO job_postings (
    id,
    title,
    description,
    company_id,
    specialization_id,
    employment_type,
    experience_level,
    location,
    city_district_id,
    salary_min,
    salary_max,
    currency,
    benefits,
    requirements,
    responsibilities,
    schedule,
    status,
    created_by,
    created_at,
    expires_at
) VALUES
-- Постоянная работа шеф-повара в Nomad Kitchen
(gen_random_uuid(),
 'Шеф-повар казахской кухни',
 'Ищем креативного шеф-повара для развития меню казахской кухни в современном формате. Возможность реализовать свои идеи и создать уникальные блюда.',
 (SELECT id FROM companies WHERE name = 'Nomad Kitchen'),
 (SELECT id FROM specializations WHERE name = 'Шеф-повар'),
 'full_time',
 'senior',
 'ул. Достык, 8',
 3,
 350000,
 500000,
 'KZT',
 ARRAY['медицинская страховка', 'корпоративное питание', 'обучение за счет компании', 'премии за результат'],
 ARRAY['опыт работы шеф-поваром от 5 лет', 'знание казахской кухни', 'навыки управления командой', 'креативность в создании блюд'],
 ARRAY['разработка и обновление меню', 'контроль качества блюд', 'управление кухонной бригадой', 'работа с поставщиками'],
 'Пн-Вс, гибкий график',
 'active',
 (SELECT id FROM profiles WHERE email = 'serik.tastanov@nomadkitchen.kz'),
 NOW() - INTERVAL '1 week',
 NOW() + INTERVAL '1 month'),

-- Бариста в Coffee Club
(gen_random_uuid(),
 'Бариста-профессионал',
 'Присоединяйтесь к команде Coffee Club! Ищем страстного бариста, который любит кофе и умеет создавать идеальные напитки.',
 (SELECT id FROM companies WHERE name = 'Coffee Club'),
 (SELECT id FROM specializations WHERE name = 'Бариста'),
 'full_time',
 'middle',
 'ТРЦ "Хан Шатыр", 2 этаж',
 4,
 140000,
 180000,
 'KZT',
 ARRAY['гибкий график', 'корпоративные скидки', 'обучение лате-арт', 'дружная команда'],
 ARRAY['опыт работы бариста от 1 года', 'знание видов кофе', 'навыки лате-арт', 'дружелюбность'],
 ARRAY['приготовление кофейных напитков', 'обслуживание клиентов', 'поддержание чистоты рабочего места', 'продажи дополнительных продуктов'],
 'Пн-Вс, сменный график',
 'active',
 (SELECT id FROM profiles WHERE email = 'madina.bekmukhanova@coffeeclub.kz'),
 NOW() - INTERVAL '3 days',
 NOW() + INTERVAL '2 weeks'),

-- Администратор зала в Golden Palace
(gen_random_uuid(),
 'Администратор банкетного зала',
 'Требуется опытный администратор для координации банкетных мероприятий. Работа с VIP-клиентами, организация торжеств.',
 (SELECT id FROM companies WHERE name = 'Golden Palace'),
 (SELECT id FROM specializations WHERE name = 'Администратор зала'),
 'full_time',
 'middle',
 'ул. Кунаева, 12/1',
 1,
 200000,
 280000,
 'KZT',
 ARRAY['высокая зарплата', 'премии от мероприятий', 'медицинская страховка', 'карьерный рост'],
 ARRAY['опыт работы администратором от 2 лет', 'опыт организации мероприятий', 'знание казахского и русского языков', 'стрессоустойчивость'],
 ARRAY['координация банкетных мероприятий', 'работа с клиентами', 'контроль качества обслуживания', 'ведение документации'],
 'Пн-Вс, гибкий график',
 'active',
 (SELECT id FROM profiles WHERE email = 'aigul.suleimanova@goldenpalace.kz'),
 NOW() - INTERVAL '5 days',
 NOW() + INTERVAL '3 weeks');

-- ====================================================================
-- ЭТАП 5: СОЗДАНИЕ РЕЗЮМЕ СОИСКАТЕЛЕЙ
-- ====================================================================

INSERT INTO resumes (
    id,
    user_id,
    title,
    summary,
    specialization_id,
    experience_years,
    education,
    skills,
    languages,
    work_experience,
    achievements,
    desired_salary_min,
    desired_salary_max,
    preferred_employment_type,
    preferred_schedule,
    is_active,
    created_at,
    updated_at
) VALUES
-- Резюме опытного повара Даулета
(gen_random_uuid(),
 (SELECT id FROM profiles WHERE email = 'daulet.mukhametov@mail.ru'),
 'Повар казахской и европейской кухни',
 'Опытный повар с 8-летним стажем. Специализируюсь на казахской национальной кухне и европейских блюдах. Умею работать в команде и под давлением.',
 (SELECT id FROM specializations WHERE name = 'Повар'),
 8,
 'Алматинский технологический университет, факультет пищевых технологий (2014)',
 ARRAY['казахская кухня', 'европейская кухня', 'работа с мясом', 'супы и бульоны', 'горячие блюда', 'холодные закуски'],
 ARRAY['Казахский (родной)', 'Русский (свободно)', 'Английский (базовый)'],
 ARRAY[
   '{"period": "2020-2024", "company": "Ресторан Алматы", "position": "Повар", "description": "Приготовление блюд казахской и европейской кухни, работа на горячем цехе"}',
   '{"period": "2018-2020", "company": "Кафе Достар", "position": "Помощник повара", "description": "Подготовка продуктов, приготовление простых блюд"}',
   '{"period": "2016-2018", "company": "Столовая №15", "position": "Кухонный работник", "description": "Начальный опыт работы на кухне"}'
 ],
 ARRAY['Участник кулинарного конкурса "Вкусы Казахстана" 2023', 'Сертификат "Санитарные нормы в общепите"'],
 180000,
 250000,
 'full_time',
 'Сменный график, готов к переработкам',
 true,
 NOW() - INTERVAL '1 week',
 NOW() - INTERVAL '1 day'),

-- Резюме молодого официанта Аиды  
(gen_random_uuid(),
 (SELECT id FROM profiles WHERE email = 'aida.nurpeisova@gmail.com'),
 'Официант с опытом работы в кафе',
 'Молодой и энергичный официант. Быстро обучаюсь, стрессоустойчива, умею находить подход к разным клиентам. Хочу развиваться в ресторанном бизнесе.',
 (SELECT id FROM specializations WHERE name = 'Официант'),
 2,
 'АЮУ, факультет туризма и гостеприимства (студентка 3 курса)',
 ARRAY['обслуживание клиентов', 'работа с кассой', 'знание меню', 'продажи', 'работа в команде'],
 ARRAY['Казахский (родной)', 'Русский (свободно)', 'Английский (разговорный)', 'Турецкий (базовый)'],
 ARRAY[
   '{"period": "2023-2024", "company": "Кафе Sunrise", "position": "Официант", "description": "Обслуживание клиентов, прием заказов, работа с кассой"}',
   '{"period": "2022-2023", "company": "Макдоналдс", "position": "Кассир", "description": "Работа с клиентами, касса, поддержание чистоты"}'
 ],
 ARRAY['Диплом "Лучший сотрудник месяца" в кафе Sunrise', 'Сертификат курса "Культура обслуживания"'],
 120000,
 160000,
 'full_time',
 'Готова к любому графику, включая выходные',
 true,
 NOW() - INTERVAL '3 days',
 NOW() - INTERVAL '1 day'),

-- Резюме бариста Амины
(gen_random_uuid(),
 (SELECT id FROM profiles WHERE email = 'amina.kozhakhmetova@gmail.com'),
 'Бариста с навыками лате-арт',
 'Увлеченная кофейной культурой бариста. Владею техниками лате-арт, знаю различные методы заваривания кофе. Стремлюсь к совершенству в каждой чашке.',
 (SELECT id FROM specializations WHERE name = 'Бариста'),
 4,
 'Курсы бариста в Coffee Academy (2020), среднее образование',
 ARRAY['эспрессо машины', 'лате-арт', 'альтернативные методы заваривания', 'обжарка кофе', 'дегустация', 'обслуживание клиентов'],
 ARRAY['Казахский (свободно)', 'Русский (родной)', 'Английский (разговорный)'],
 ARRAY[
   '{"period": "2022-2024", "company": "Кофейня Beans", "position": "Старший бариста", "description": "Приготовление кофейных напитков, обучение новичков, контроль качества"}',
   '{"period": "2020-2022", "company": "Starbucks", "position": "Бариста", "description": "Приготовление напитков по стандартам компании, работа с клиентами"}'
 ],
 ARRAY['1 место в городском конкурсе лате-арт 2023', 'Сертификат SCA Barista Skills Foundation'],
 140000,
 180000,
 'full_time',
 'Гибкий график, возможны выходные',
 true,
 NOW() - INTERVAL '5 days',
 NOW() - INTERVAL '2 hours');

-- ====================================================================
-- ЭТАП 6: СОЗДАНИЕ ОТКЛИКОВ НА ВАКАНСИИ
-- ====================================================================

INSERT INTO job_applications (
    id,
    job_id,
    user_id,
    resume_id,
    cover_letter,
    status,
    applied_at,
    updated_at
) VALUES
-- Отклик Даулета на позицию шеф-повара
(gen_random_uuid(),
 (SELECT id FROM job_postings WHERE title = 'Шеф-повар казахской кухни'),
 (SELECT id FROM profiles WHERE email = 'daulet.mukhametov@mail.ru'),
 (SELECT id FROM resumes WHERE user_id = (SELECT id FROM profiles WHERE email = 'daulet.mukhametov@mail.ru')),
 'Здравствуйте! Меня очень заинтересовала ваша вакансия. У меня 8 лет опыта работы поваром, специализируюсь на казахской кухне. Готов принести свои идеи для развития меню и работать в команде профессионалов.',
 'pending',
 NOW() - INTERVAL '2 days',
 NOW() - INTERVAL '2 days'),

-- Отклик Аиды на срочную вакансию официанта
(gen_random_uuid(),
 (SELECT id FROM urgent_jobs WHERE title = 'Официант на вечернюю смену СЕГОДНЯ'),
 (SELECT id FROM profiles WHERE email = 'aida.nurpeisova@gmail.com'),
 (SELECT id FROM resumes WHERE user_id = (SELECT id FROM profiles WHERE email = 'aida.nurpeisova@gmail.com')),
 'Добрый день! Готова выйти на смену сегодня. У меня есть опыт работы официантом, знаю английский язык. Могу приехать в течение часа.',
 'accepted',
 NOW() - INTERVAL '30 minutes',
 NOW() - INTERVAL '15 minutes'),

-- Отклик Амины на вакансию бариста
(gen_random_uuid(),
 (SELECT id FROM job_postings WHERE title = 'Бариста-профессионал'),
 (SELECT id FROM profiles WHERE email = 'amina.kozhakhmetova@gmail.com'),
 (SELECT id FROM resumes WHERE user_id = (SELECT id FROM profiles WHERE email = 'amina.kozhakhmetova@gmail.com')),
 'Привет команде Coffee Club! Ваша кофейня всегда была для меня эталоном качества. Хочу присоединиться к вашей команде и делиться своей любовью к кофе с гостями.',
 'pending',
 NOW() - INTERVAL '1 day',
 NOW() - INTERVAL '1 day');

-- ====================================================================
-- ЭТАП 7: СОЗДАНИЕ УВЕДОМЛЕНИЙ
-- ====================================================================

INSERT INTO notifications (
    id,
    user_id,
    title,
    message,
    type,
    related_entity_type,
    related_entity_id,
    is_read,
    priority,
    created_at
) VALUES
-- Уведомления для работодателей о новых откликах
(gen_random_uuid(),
 (SELECT id FROM profiles WHERE email = 'serik.tastanov@nomadkitchen.kz'),
 'Новый отклик на вакансию',
 'Получен отклик от Даулета Мухаметова на позицию "Шеф-повар казахской кухни"',
 'job_application',
 'job_application',
 (SELECT id FROM job_applications WHERE cover_letter LIKE '%8 лет опыта работы поваром%'),
 false,
 'high',
 NOW() - INTERVAL '2 days'),

(gen_random_uuid(),
 (SELECT id FROM profiles WHERE email = 'arman.nazarbayev@astanafood.kz'),
 'Отклик принят',
 'Аида Нурпеисова откликнулась на срочную вакансию официанта',
 'urgent_response',
 'job_application', 
 (SELECT id FROM job_applications WHERE cover_letter LIKE '%Готова выйти на смену сегодня%'),
 false,
 'urgent',
 NOW() - INTERVAL '30 minutes'),

-- Уведомления для соискателей о статусе откликов
(gen_random_uuid(),
 (SELECT id FROM profiles WHERE email = 'aida.nurpeisova@gmail.com'),
 'Ваш отклик принят!',
 'Поздравляем! Ваш отклик на вакансию "Официант на вечернюю смену" принят. Свяжитесь с работодателем по телефону +77011234567',
 'application_accepted',
 'job_application',
 (SELECT id FROM job_applications WHERE cover_letter LIKE '%Готова выйти на смену сегодня%'),
 false,
 'high',
 NOW() - INTERVAL '15 minutes'),

(gen_random_uuid(),
 (SELECT id FROM profiles WHERE email = 'daulet.mukhametov@mail.ru'),
 'Отклик на рассмотрении',
 'Ваш отклик на позицию "Шеф-повар казахской кухни" получен и находится на рассмотрении',
 'application_received',
 'job_application',
 (SELECT id FROM job_applications WHERE cover_letter LIKE '%8 лет опыта работы поваром%'),
 true,
 'medium',
 NOW() - INTERVAL '2 days');

COMMIT;

-- Проверяем созданные данные
SELECT 
    'profiles' as table_name, 
    COUNT(*) as count,
    COUNT(*) FILTER (WHERE user_type = 'employer') as employers,
    COUNT(*) FILTER (WHERE user_type = 'jobseeker') as jobseekers
FROM profiles
WHERE email LIKE '%.kz' OR email LIKE '%@gmail.com' OR email LIKE '%@mail.ru' OR email LIKE '%@yandex.kz'

UNION ALL

SELECT 'companies', COUNT(*), 0, 0 FROM companies

UNION ALL  

SELECT 'urgent_jobs', COUNT(*), 0, 0 FROM urgent_jobs

UNION ALL

SELECT 'job_postings', COUNT(*), 0, 0 FROM job_postings

UNION ALL

SELECT 'resumes', COUNT(*), 0, 0 FROM resumes

UNION ALL

SELECT 'job_applications', COUNT(*), 0, 0 FROM job_applications

UNION ALL

SELECT 'notifications', COUNT(*), 0, 0 FROM notifications;
