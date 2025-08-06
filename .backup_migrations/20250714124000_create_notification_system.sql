-- Система уведомлений для срочных вакансий и общепита
-- Дата: 14 июля 2025

begin;

-- Таблица типов уведомлений
create table if not exists notification_types (
    id serial primary key,
    name varchar(100) not null unique,
    description text,
    is_urgent boolean default false, -- для приоритетных уведомлений
    telegram_template text,
    push_template text
);

-- Основная таблица уведомлений
create table if not exists notifications (
    id uuid default gen_random_uuid() primary key,
    
    -- Получатель
    recipient_id uuid not null references auth.users(id),
    
    -- Тип и содержание
    notification_type_id integer not null references notification_types(id),
    title varchar(200) not null,
    message text not null,
    
    -- Приоритет (1 - низкий, 5 - критичный)
    priority integer default 1 check (priority between 1 and 5),
    
    -- Связанные объекты
    urgent_job_id uuid references urgent_jobs(id),
    job_posting_id uuid references job_postings(id),
    application_id uuid references applications(id),
    
    -- Каналы доставки
    send_telegram boolean default true,
    send_push boolean default true,
    send_email boolean default false,
    
    -- Статус доставки
    telegram_sent boolean default false,
    telegram_sent_at timestamp with time zone,
    push_sent boolean default false,
    push_sent_at timestamp with time zone,
    email_sent boolean default false,
    email_sent_at timestamp with time zone,
    
    -- Статус прочтения
    is_read boolean default false,
    read_at timestamp with time zone,
    
    -- Системные поля
    created_at timestamp with time zone default now(),
    scheduled_for timestamp with time zone default now(), -- когда отправить
    
    -- Дополнительные данные
    metadata jsonb default '{}'::jsonb
);

-- Настройки уведомлений пользователей
create table if not exists user_notification_settings (
    id uuid default gen_random_uuid() primary key,
    user_id uuid not null references auth.users(id) unique,
    
    -- Общие настройки
    telegram_enabled boolean default true,
    push_enabled boolean default true,
    email_enabled boolean default false,
    
    -- Настройки для соискателей
    urgent_jobs_notifications boolean default true,
    new_jobs_notifications boolean default true,
    application_updates boolean default true,
    
    -- Фильтры для уведомлений о вакансиях
    notify_specializations integer[] default '{}',
    notify_districts integer[] default '{}',
    min_salary_filter numeric(10,2),
    
    -- Настройки для работодателей
    new_applications_notifications boolean default true,
    urgent_responses_notifications boolean default true,
    
    -- Расписание уведомлений
    quiet_hours_start time default '22:00',
    quiet_hours_end time default '08:00',
    timezone varchar(50) default 'Europe/Moscow',
    
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Заполняем типы уведомлений
insert into notification_types (name, description, is_urgent, telegram_template, push_template) values
('urgent_job_created', 'Новая срочная вакансия', true, 
 '🚨 СРОЧНО! Новая вакансия "{title}" в {venue_name}. Оплата: {pay_per_shift}₽ за смену', 
 'Срочная вакансия: {title}'),
('urgent_job_match', 'Срочная вакансия по вашей специализации', true,
 '⚡ Идеальная вакансия! {title} в {venue_name}, завтра в {needed_time}. Готовы?',
 'Подходящая срочная вакансия'),
('application_received', 'Новый отклик на вакансию', false,
 '📨 Новый отклик на "{title}" от {candidate_name}',
 'Новый отклик на вакансию'),
('urgent_application_received', 'Срочный отклик "ГОТОВ!"', true,
 '🔥 ГОТОВ ВЫЙТИ! {candidate_name} откликнулся на "{title}". Контакт: {phone}',
 'Срочный отклик получен'),
('job_expires_soon', 'Вакансия скоро закроется', false,
 '⏰ Вакансия "{title}" закроется через {hours} часов',
 'Вакансия скоро закроется'),
('profile_viewed', 'Ваше резюме просмотрели', false,
 '👀 Работодатель "{employer_name}" просмотрел ваше резюме',
 'Резюме просмотрено');

-- Функция создания уведомления
create or replace function create_notification(
    p_recipient_id uuid,
    p_notification_type varchar,
    p_title varchar,
    p_message text,
    p_priority integer default 1,
    p_urgent_job_id uuid default null,
    p_job_posting_id uuid default null,
    p_application_id uuid default null,
    p_metadata jsonb default '{}'::jsonb
)
returns uuid as $$
declare
    notification_id uuid;
    type_id integer;
begin
    -- Получаем ID типа уведомления
    select id into type_id from notification_types where name = p_notification_type;
    
    if type_id is null then
        raise exception 'Unknown notification type: %', p_notification_type;
    end if;
    
    -- Создаем уведомление
    insert into notifications (
        recipient_id, notification_type_id, title, message, priority,
        urgent_job_id, job_posting_id, application_id, metadata
    ) values (
        p_recipient_id, type_id, p_title, p_message, p_priority,
        p_urgent_job_id, p_job_posting_id, p_application_id, p_metadata
    ) returning id into notification_id;
    
    return notification_id;
end;
$$ language plpgsql;

-- Функция отправки уведомлений о новых срочных вакансиях
create or replace function notify_urgent_job_created()
returns trigger as $$
declare
    candidate_record record;
    notification_id uuid;
begin
    -- Находим подходящих кандидатов
    for candidate_record in 
        select cp.user_id, cp.first_name
        from candidate_profiles cp
        where cp.is_active = true
        and cp.ready_for_urgent = true
        and (
            cp.primary_specialization_id = new.specialization_id
            or new.specialization_id = any(cp.secondary_specializations)
        )
        and (
            array_length(cp.preferred_districts, 1) is null
            or new.district_id = any(cp.preferred_districts)
        )
        and (
            cp.expected_salary_shift_min is null
            or cp.expected_salary_shift_min <= new.pay_per_shift
        )
    loop
        -- Создаем уведомление
        select create_notification(
            candidate_record.user_id,
            'urgent_job_match',
            new.title,
            format('⚡ Идеальная вакансия! %s в %s, %s в %s. Оплата: %s₽. Готовы?',
                new.title, new.venue_name, 
                to_char(new.needed_date, 'DD.MM'),
                coalesce(new.needed_time::text, 'время уточняется'),
                new.pay_per_shift
            ),
            5, -- максимальный приоритет
            new.id,
            null,
            null,
            jsonb_build_object(
                'venue_name', new.venue_name,
                'pay_per_shift', new.pay_per_shift,
                'needed_date', new.needed_date,
                'needed_time', new.needed_time
            )
        ) into notification_id;
    end loop;
    
    return new;
end;
$$ language plpgsql;

-- Триггер для уведомлений о срочных вакансиях
create trigger trigger_notify_urgent_job_created
    after insert on urgent_jobs
    for each row
    execute function notify_urgent_job_created();

-- Индексы для оптимизации
create index if not exists idx_notifications_recipient on notifications(recipient_id);
create index if not exists idx_notifications_type on notifications(notification_type_id);
create index if not exists idx_notifications_priority on notifications(priority);
create index if not exists idx_notifications_unread on notifications(recipient_id, is_read)
    where is_read = false;
create index if not exists idx_notifications_scheduled on notifications(scheduled_for)
    where telegram_sent = false or push_sent = false;

-- Композитный индекс для уведомлений пользователя
create index if not exists idx_notifications_user_feed on notifications(recipient_id, created_at desc, is_read);

commit;
