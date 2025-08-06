-- Расширение профилей пользователей для специализации на общепит
-- Дата: 14 июля 2025

begin;

-- Создаем таблицу расширенных профилей для соискателей
create table if not exists candidate_profiles (
    id uuid default gen_random_uuid() primary key,
    user_id uuid not null references auth.users(id) unique,
    
    -- Основная информация
    first_name varchar(100),
    last_name varchar(100),
    phone varchar(20),
    telegram_username varchar(100),
    
    -- Специализация в общепите
    primary_specialization_id integer references specializations(id),
    secondary_specializations integer[] default '{}', -- дополнительные специализации
    
    -- Опыт работы
    experience_years integer default 0,
    experience_description text,
    
    -- Зарплатные ожидания
    expected_salary_monthly_min numeric(10,2),
    expected_salary_monthly_max numeric(10,2),
    expected_salary_shift_min numeric(10,2), -- минимальная оплата за смену
    
    -- Готовность к работе
    ready_for_urgent boolean default false, -- готов к срочным выходам
    ready_tomorrow boolean default false, -- готов выйти завтра
    available_for_substitutions boolean default false, -- готов к подменам
    
    -- Предпочтения по локации
    preferred_districts integer[] default '{}',
    max_travel_time interval default '1 hour', -- максимальное время в пути
    
    -- Предпочтения по графику
    preferred_schedule text, -- предпочитаемый график
    available_weekdays boolean[] default '{true,true,true,true,true,true,true}', -- пн-вс
    available_day_shifts boolean default true,
    available_night_shifts boolean default false,
    
    -- Дополнительная информация
    about_text text,
    skills text[],
    languages text[],
    
    -- Статистика
    profile_views integer default 0,
    applications_sent integer default 0,
    successful_applications integer default 0,
    
    -- Системные поля
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    is_active boolean default true
);

-- Создаем таблицу для работодателей (заведений)
create table if not exists employer_profiles (
    id uuid default gen_random_uuid() primary key,
    user_id uuid not null references auth.users(id) unique,
    
    -- Информация о заведении
    venue_name varchar(200) not null,
    venue_type_id integer references venue_types(id),
    legal_name varchar(200), -- юридическое название
    
    -- Контакты
    contact_phone varchar(20) not null,
    contact_person varchar(100),
    email varchar(255),
    website varchar(255),
    
    -- Локация
    district_id integer references city_districts(id),
    address text not null,
    metro_station varchar(100),
    coordinates point, -- для геолокации
    
    -- Описание
    description text,
    specialties text[], -- кухни/специализации заведения
    
    -- Статистика
    jobs_posted integer default 0,
    urgent_jobs_posted integer default 0,
    successful_hires integer default 0,
    rating numeric(3,2) default 5.0,
    reviews_count integer default 0,
    
    -- Системные поля
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    is_verified boolean default false,
    is_active boolean default true
);

-- Функции обновления updated_at
create or replace function update_candidate_profiles_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create or replace function update_employer_profiles_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- Триггеры
create trigger update_candidate_profiles_updated_at
    before update on candidate_profiles
    for each row
    execute function update_candidate_profiles_updated_at();

create trigger update_employer_profiles_updated_at
    before update on employer_profiles
    for each row
    execute function update_employer_profiles_updated_at();

-- Обновляем таблицу резюме для интеграции с новыми профилями
alter table resumes add column if not exists candidate_profile_id uuid references candidate_profiles(id);
alter table resumes add column if not exists ready_for_urgent boolean default false;
alter table resumes add column if not exists ready_tomorrow boolean default false;
alter table resumes add column if not exists min_shift_pay numeric(10,2);

-- Индексы
create index if not exists idx_candidate_profiles_user on candidate_profiles(user_id);
create index if not exists idx_candidate_profiles_specialization on candidate_profiles(primary_specialization_id);
create index if not exists idx_candidate_profiles_ready_urgent on candidate_profiles(ready_for_urgent)
    where ready_for_urgent = true;
create index if not exists idx_candidate_profiles_ready_tomorrow on candidate_profiles(ready_tomorrow)
    where ready_tomorrow = true;

create index if not exists idx_employer_profiles_user on employer_profiles(user_id);
create index if not exists idx_employer_profiles_venue_type on employer_profiles(venue_type_id);
create index if not exists idx_employer_profiles_district on employer_profiles(district_id);

-- GIN индекс для поиска по массивам
create index if not exists idx_candidate_profiles_secondary_specs on candidate_profiles using gin(secondary_specializations);
create index if not exists idx_candidate_profiles_preferred_districts on candidate_profiles using gin(preferred_districts);

commit;
