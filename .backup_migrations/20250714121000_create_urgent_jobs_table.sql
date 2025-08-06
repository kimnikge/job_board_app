-- Создание отдельной таблицы для срочных вакансий согласно ТЗ
-- Дата: 14 июля 2025

begin;

-- Создаем таблицу срочных вакансий (отдельно от обычных)
create table if not exists urgent_jobs (
    id uuid default gen_random_uuid() primary key,
    
    -- Основная информация
    title varchar(200) not null,
    venue_name varchar(200) not null, -- название заведения
    venue_type_id integer references venue_types(id),
    specialization_id integer not null references specializations(id),
    
    -- Локация
    district_id integer references city_districts(id),
    address text not null,
    metro_station varchar(100),
    
    -- Срочность и время
    needed_date date not null, -- когда нужен работник
    needed_time time, -- во сколько выход
    shift_duration interval, -- продолжительность смены
    auto_close_at timestamp with time zone not null, -- автозакрытие через 24-48 часов
    
    -- Оплата (специфично для срочных - за смену)
    pay_per_shift numeric(10,2) not null, -- фиксированная оплата за смену
    currency varchar(3) default 'RUB',
    
    -- Описание
    description text,
    requirements text,
    benefits text[],
    
    -- Контакты (для срочного связывания)
    contact_phone varchar(20) not null,
    contact_name varchar(100),
    contact_telegram varchar(100),
    
    -- Статус
    status varchar(20) default 'active' check (status in ('active', 'filled', 'expired', 'cancelled')),
    filled_at timestamp with time zone, -- когда была закрыта
    
    -- Системные поля
    employer_id uuid not null references auth.users(id),
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    
    -- Приоритет для уведомлений
    notification_priority integer default 1 check (notification_priority between 1 and 5)
);

-- Автоматическое обновление updated_at
create or replace function update_urgent_jobs_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger update_urgent_jobs_updated_at
    before update on urgent_jobs
    for each row
    execute function update_urgent_jobs_updated_at();

-- Функция автозакрытия просроченных вакансий
create or replace function auto_close_expired_urgent_jobs()
returns void as $$
begin
    update urgent_jobs 
    set status = 'expired', updated_at = now()
    where status = 'active' 
    and auto_close_at <= now();
end;
$$ language plpgsql;

-- Обновляем таблицу откликов для поддержки срочных вакансий
alter table applications add column if not exists urgent_job_id uuid references urgent_jobs(id);
alter table applications add column if not exists application_type varchar(20) default 'standard' 
    check (application_type in ('standard', 'urgent_ready'));

-- Индексы для оптимизации
create index if not exists idx_urgent_jobs_status on urgent_jobs(status);
create index if not exists idx_urgent_jobs_needed_date on urgent_jobs(needed_date);
create index if not exists idx_urgent_jobs_specialization on urgent_jobs(specialization_id);
create index if not exists idx_urgent_jobs_district on urgent_jobs(district_id);
create index if not exists idx_urgent_jobs_auto_close on urgent_jobs(auto_close_at);
create index if not exists idx_urgent_jobs_employer on urgent_jobs(employer_id);

-- Индекс для поиска по геолокации
create index if not exists idx_urgent_jobs_location on urgent_jobs(district_id, metro_station);

-- Композитный индекс для активных срочных вакансий
create index if not exists idx_urgent_jobs_active on urgent_jobs(status, needed_date, specialization_id)
    where status = 'active';

commit;
