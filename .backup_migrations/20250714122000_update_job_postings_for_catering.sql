-- Обновление таблицы обычных вакансий для специализации на общепит
-- Дата: 14 июля 2025

begin;

-- Добавляем поля для специализации на общепит
alter table job_postings add column if not exists venue_name varchar(200);
alter table job_postings add column if not exists venue_type_id integer references venue_types(id);
alter table job_postings add column if not exists specialization_id integer references specializations(id);
alter table job_postings add column if not exists district_id integer references city_districts(id);
alter table job_postings add column if not exists metro_station varchar(100);

-- Зарплата для обычных вакансий (месячная + возможность за смену)
alter table job_postings add column if not exists salary_monthly_min numeric(10,2);
alter table job_postings add column if not exists salary_monthly_max numeric(10,2);
alter table job_postings add column if not exists salary_shift numeric(10,2); -- для подработок

-- Дополнительные поля для общепита
alter table job_postings add column if not exists work_schedule text; -- график работы
alter table job_postings add column if not exists experience_required varchar(50); -- опыт работы
alter table job_postings add column if not exists age_min integer;
alter table job_postings add column if not exists age_max integer;

-- Контактная информация
alter table job_postings add column if not exists contact_phone varchar(20);
alter table job_postings add column if not exists contact_person varchar(100);

-- Срок размещения (30 дней по ТЗ)
alter table job_postings add column if not exists expires_at timestamp with time zone 
    default (now() + interval '30 days');

-- Статус вакансии
alter table job_postings add column if not exists status varchar(20) default 'active' 
    check (status in ('active', 'paused', 'filled', 'expired'));

-- Счетчики для аналитики
alter table job_postings add column if not exists views_count integer default 0;
alter table job_postings add column if not exists applications_count integer default 0;

-- Убираем флаг is_urgent (переносим в отдельную таблицу)
-- Но оставляем для совместимости, потом удалим
alter table job_postings alter column is_urgent set default false;

-- Функция обновления счетчика откликов
create or replace function update_job_applications_count()
returns trigger as $$
begin
    if TG_OP = 'INSERT' then
        update job_postings 
        set applications_count = applications_count + 1
        where id = new.job_id;
        return new;
    elsif TG_OP = 'DELETE' then
        update job_postings 
        set applications_count = applications_count - 1
        where id = old.job_id;
        return old;
    end if;
    return null;
end;
$$ language plpgsql;

-- Триггер для автоматического обновления счетчика
drop trigger if exists trigger_update_job_applications_count on applications;
create trigger trigger_update_job_applications_count
    after insert or delete on applications
    for each row
    execute function update_job_applications_count();

-- Функция автоматического истечения срока обычных вакансий
create or replace function auto_expire_old_job_postings()
returns void as $$
begin
    update job_postings 
    set status = 'expired'
    where status = 'active' 
    and expires_at <= now();
end;
$$ language plpgsql;

-- Индексы для оптимизации поиска по специализации
create index if not exists idx_job_postings_specialization on job_postings(specialization_id);
create index if not exists idx_job_postings_district on job_postings(district_id);
create index if not exists idx_job_postings_venue_type on job_postings(venue_type_id);
create index if not exists idx_job_postings_status on job_postings(status);
create index if not exists idx_job_postings_expires on job_postings(expires_at);

-- Композитный индекс для поиска активных вакансий
create index if not exists idx_job_postings_active_search on job_postings(status, specialization_id, district_id)
    where status = 'active';

commit;
