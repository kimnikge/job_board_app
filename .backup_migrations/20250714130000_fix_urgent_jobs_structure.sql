-- Безопасное обновление структуры срочных вакансий
-- Дата: 14 июля 2025
-- Версия: исправленная для существующей таблицы

begin;

-- Проверяем, существует ли таблица urgent_jobs, если нет - создаем
do $$ 
begin
    if not exists (select from information_schema.tables where table_name = 'urgent_jobs') then
        create table urgent_jobs (
            id uuid default gen_random_uuid() primary key,
            title varchar(200) not null,
            venue_name varchar(200) not null,
            specialization_id integer,
            district_id integer,
            address text not null,
            metro_station varchar(100),
            needed_date date not null,
            needed_time time,
            shift_duration interval,
            auto_close_at timestamp with time zone not null,
            pay_per_shift numeric(10,2) not null,
            currency varchar(3) default 'RUB',
            description text,
            requirements text,
            benefits text[],
            contact_phone varchar(20) not null,
            contact_name varchar(100),
            contact_telegram varchar(100),
            status varchar(20) default 'active',
            filled_at timestamp with time zone,
            employer_id uuid not null,
            created_at timestamp with time zone default now(),
            updated_at timestamp with time zone default now(),
            notification_priority integer default 1
        );
    end if;
end $$;

-- Добавляем колонки, если их нет
alter table urgent_jobs add column if not exists venue_type_id integer;
alter table urgent_jobs add column if not exists specialization_id integer;
alter table urgent_jobs add column if not exists district_id integer;
alter table urgent_jobs add column if not exists needed_date date;
alter table urgent_jobs add column if not exists needed_time time;
alter table urgent_jobs add column if not exists shift_duration interval;
alter table urgent_jobs add column if not exists auto_close_at timestamp with time zone;
alter table urgent_jobs add column if not exists pay_per_shift numeric(10,2);
alter table urgent_jobs add column if not exists currency varchar(3) default 'RUB';
alter table urgent_jobs add column if not exists contact_phone varchar(20);
alter table urgent_jobs add column if not exists contact_name varchar(100);
alter table urgent_jobs add column if not exists contact_telegram varchar(100);
alter table urgent_jobs add column if not exists status varchar(20) default 'active';
alter table urgent_jobs add column if not exists filled_at timestamp with time zone;
alter table urgent_jobs add column if not exists notification_priority integer default 1;
alter table urgent_jobs add column if not exists benefits text[];

-- Добавляем ограничения, если их нет
do $$
begin
    if not exists (select 1 from information_schema.check_constraints 
                   where constraint_name = 'urgent_jobs_status_check') then
        alter table urgent_jobs add constraint urgent_jobs_status_check 
        check (status in ('active', 'filled', 'expired', 'cancelled'));
    end if;
    
    if not exists (select 1 from information_schema.check_constraints 
                   where constraint_name = 'urgent_jobs_notification_priority_check') then
        alter table urgent_jobs add constraint urgent_jobs_notification_priority_check 
        check (notification_priority between 1 and 5);
    end if;
end $$;

-- Добавляем индексы только если они не существуют
create index if not exists idx_urgent_jobs_status on urgent_jobs(status);
create index if not exists idx_urgent_jobs_needed_date on urgent_jobs(needed_date);
create index if not exists idx_urgent_jobs_specialization on urgent_jobs(specialization_id);
create index if not exists idx_urgent_jobs_district on urgent_jobs(district_id);
create index if not exists idx_urgent_jobs_auto_close on urgent_jobs(auto_close_at);
create index if not exists idx_urgent_jobs_employer on urgent_jobs(employer_id);

-- Обновляем таблицу applications для поддержки срочных вакансий
alter table applications add column if not exists urgent_job_id uuid;
alter table applications add column if not exists application_type varchar(20) default 'standard';

-- Добавляем ограничение для application_type если его нет
do $$
begin
    if not exists (select 1 from information_schema.check_constraints 
                   where constraint_name = 'applications_application_type_check') then
        alter table applications add constraint applications_application_type_check 
        check (application_type in ('standard', 'urgent_ready'));
    end if;
end $$;

commit;
