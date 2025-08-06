-- Безопасное создание справочников и обновление job_postings
-- Дата: 14 июля 2025
-- Версия: исправленная

begin;

-- 1. Создаем справочники только если они не существуют

-- Специализации для общепита
create table if not exists specializations (
    id serial primary key,
    name varchar(100) not null unique,
    description text,
    icon varchar(50),
    created_at timestamp with time zone default now()
);

-- Районы города
create table if not exists city_districts (
    id serial primary key,
    name varchar(100) not null unique,
    metro_stations text[],
    created_at timestamp with time zone default now()
);

-- Типы заведений общепита
create table if not exists venue_types (
    id serial primary key,
    name varchar(100) not null unique,
    description text,
    icon varchar(50),
    created_at timestamp with time zone default now()
);

-- Заполняем данные только если таблицы пустые
insert into specializations (name, description, icon) 
select * from (values
    ('Повар', 'Приготовление горячих блюд, супов, основных блюд', '👨‍🍳'),
    ('Су-шеф', 'Помощник шеф-повара, организация работы кухни', '👩‍🍳'),
    ('Повар-универсал', 'Приготовление различных блюд, работа на всех участках', '🍳'),
    ('Официант', 'Обслуживание гостей, прием заказов, подача блюд', '🙋‍♂️'),
    ('Старший официант', 'Координация работы официантов, работа с VIP-гостями', '🙋‍♀️'),
    ('Бармен', 'Приготовление напитков, коктейлей, обслуживание бара', '🍹'),
    ('Бариста', 'Приготовление кофе, кофейных напитков', '☕'),
    ('Кассир', 'Работа с кассой, расчет с клиентами', '💳'),
    ('Администратор зала', 'Координация работы зала, решение конфликтов', '📋'),
    ('Хостес', 'Встреча гостей, рассадка, бронирование столиков', '💁‍♀️'),
    ('Посудомойщик', 'Мытье посуды, поддержание чистоты', '🧽'),
    ('Курьер', 'Доставка заказов, работа с клиентами', '🚲')
) as v(name, description, icon)
where not exists (select 1 from specializations limit 1);

-- Заполняем типы заведений
insert into venue_types (name, description, icon)
select * from (values
    ('Ресторан', 'Полноценный ресторан с разнообразным меню', '🍽️'),
    ('Кафе', 'Небольшое заведение с легким меню', '☕'),
    ('Быстрое питание', 'Фаст-фуд, быстрое обслуживание', '🍔'),
    ('Пиццерия', 'Специализация на пицце и итальянской кухне', '🍕'),
    ('Суши-бар', 'Японская кухня, суши, роллы', '🍣'),
    ('Бар', 'Алкогольные напитки, закуски', '🍻'),
    ('Кофейня', 'Кофе, выпечка, легкие закуски', '☕'),
    ('Столовая', 'Комплексные обеды, домашняя кухня', '🥘'),
    ('Кондитерская', 'Торты, пирожные, сладости', '🧁'),
    ('Пекарня', 'Хлеб, выпечка, булочки', '🥖')
) as v(name, description, icon)
where not exists (select 1 from venue_types limit 1);

-- Заполняем районы
insert into city_districts (name, metro_stations)
select * from (values
    ('Центральный', ARRAY['Площадь Революции', 'Театральная', 'Охотный ряд']),
    ('Арбат', ARRAY['Арбатская', 'Смоленская', 'Кропоткинская']),
    ('Замоскворечье', ARRAY['Третьяковская', 'Новокузнецкая', 'Павелецкая']),
    ('Сокольники', ARRAY['Сокольники', 'Красносельская', 'Комсомольская']),
    ('Таганский', ARRAY['Таганская', 'Курская', 'Чкаловская']),
    ('Басманный', ARRAY['Красные ворота', 'Чистые пруды', 'Сретенский бульвар']),
    ('Тверской', ARRAY['Тверская', 'Пушкинская', 'Чеховская']),
    ('Пресненский', ARRAY['Белорусская', 'Маяковская', 'Баррикадная'])
) as v(name, metro_stations)
where not exists (select 1 from city_districts limit 1);

-- 2. Обновляем job_postings безопасно
alter table job_postings add column if not exists venue_name varchar(200);
alter table job_postings add column if not exists venue_type_id integer;
alter table job_postings add column if not exists specialization_id integer;
alter table job_postings add column if not exists district_id integer;
alter table job_postings add column if not exists metro_station varchar(100);
alter table job_postings add column if not exists salary_monthly_min numeric(10,2);
alter table job_postings add column if not exists salary_monthly_max numeric(10,2);
alter table job_postings add column if not exists salary_shift numeric(10,2);
alter table job_postings add column if not exists work_schedule text;
alter table job_postings add column if not exists experience_required varchar(50);
alter table job_postings add column if not exists age_min integer;
alter table job_postings add column if not exists age_max integer;
alter table job_postings add column if not exists contact_phone varchar(20);
alter table job_postings add column if not exists contact_person varchar(100);
alter table job_postings add column if not exists expires_at timestamp with time zone default (now() + interval '30 days');
alter table job_postings add column if not exists status varchar(20) default 'active';
alter table job_postings add column if not exists views_count integer default 0;
alter table job_postings add column if not exists applications_count integer default 0;

-- Добавляем ограничения для job_postings
do $$
begin
    if not exists (select 1 from information_schema.check_constraints 
                   where constraint_name = 'job_postings_status_check') then
        alter table job_postings add constraint job_postings_status_check 
        check (status in ('active', 'paused', 'filled', 'expired'));
    end if;
end $$;

-- Индексы для быстрого поиска
create index if not exists idx_specializations_name on specializations(name);
create index if not exists idx_city_districts_name on city_districts(name);
create index if not exists idx_venue_types_name on venue_types(name);
create index if not exists idx_job_postings_specialization on job_postings(specialization_id);
create index if not exists idx_job_postings_district on job_postings(district_id);
create index if not exists idx_job_postings_venue_type on job_postings(venue_type_id);
create index if not exists idx_job_postings_status on job_postings(status);
create index if not exists idx_job_postings_expires on job_postings(expires_at);

commit;
