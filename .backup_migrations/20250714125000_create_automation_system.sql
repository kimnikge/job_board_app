-- Автоматизация и cron-задачи для срочных вакансий
-- Дата: 14 июля 2025

begin;

-- Включаем расширение pg_cron (если доступно в Supabase)
-- create extension if not exists pg_cron;

-- Создаем таблицу для логирования автоматических задач
create table if not exists automation_logs (
    id uuid default gen_random_uuid() primary key,
    task_name varchar(100) not null,
    executed_at timestamp with time zone default now(),
    success boolean not null,
    details text,
    affected_rows integer default 0
);

-- Функция полной очистки просроченных срочных вакансий
create or replace function cleanup_expired_urgent_jobs()
returns table(closed_jobs integer) as $$
declare
    affected_count integer;
begin
    -- Закрываем просроченные срочные вакансии
    update urgent_jobs 
    set status = 'expired', updated_at = now()
    where status = 'active' 
    and auto_close_at <= now();
    
    get diagnostics affected_count = row_count;
    
    -- Логируем результат
    insert into automation_logs (task_name, success, details, affected_rows)
    values ('cleanup_expired_urgent_jobs', true, 
            format('Закрыто %s просроченных срочных вакансий', affected_count),
            affected_count);
    
    return query select affected_count;
end;
$$ language plpgsql;

-- Функция закрытия обычных вакансий по истечению срока
create or replace function cleanup_expired_job_postings()
returns table(expired_jobs integer) as $$
declare
    affected_count integer;
begin
    -- Закрываем обычные вакансии по истечению 30 дней
    update job_postings 
    set status = 'expired'
    where status = 'active' 
    and expires_at <= now();
    
    get diagnostics affected_count = row_count;
    
    -- Логируем результат
    insert into automation_logs (task_name, success, details, affected_rows)
    values ('cleanup_expired_job_postings', true,
            format('Истек срок у %s обычных вакансий', affected_count),
            affected_count);
    
    return query select affected_count;
end;
$$ language plpgsql;

-- Функция сброса флага "готов завтра" в конце дня
create or replace function reset_ready_tomorrow_flags()
returns table(reset_profiles integer) as $$
declare
    affected_count integer;
begin
    -- Сбрасываем флаг "готов завтра" у всех кандидатов
    update candidate_profiles 
    set ready_tomorrow = false, updated_at = now()
    where ready_tomorrow = true;
    
    get diagnostics affected_count = row_count;
    
    -- Также сбрасываем в резюме
    update resumes 
    set ready_tomorrow = false
    where ready_tomorrow = true;
    
    -- Логируем результат
    insert into automation_logs (task_name, success, details, affected_rows)
    values ('reset_ready_tomorrow_flags', true,
            format('Сброшен флаг "готов завтра" у %s кандидатов', affected_count),
            affected_count);
    
    return query select affected_count;
end;
$$ language plpgsql;

-- Функция отправки напоминаний о скором закрытии срочных вакансий
create or replace function send_urgent_job_expiry_reminders()
returns table(reminders_sent integer) as $$
declare
    job_record record;
    notification_id uuid;
    reminder_count integer := 0;
begin
    -- Находим срочные вакансии, которые закроются в течение 2 часов
    for job_record in 
        select uj.*, ep.user_id as employer_id
        from urgent_jobs uj
        join employer_profiles ep on ep.id = (
            select id from employer_profiles where user_id = uj.employer_id limit 1
        )
        where uj.status = 'active'
        and uj.auto_close_at <= now() + interval '2 hours'
        and uj.auto_close_at > now()
        -- Проверяем, что напоминание еще не отправлялось
        and not exists (
            select 1 from notifications n
            where n.urgent_job_id = uj.id
            and n.notification_type_id = (
                select id from notification_types where name = 'job_expires_soon'
            )
            and n.created_at > now() - interval '6 hours'
        )
    loop
        -- Создаем напоминание работодателю
        select create_notification(
            job_record.employer_id,
            'job_expires_soon',
            format('Вакансия "%s" скоро закроется', job_record.title),
            format('⏰ Срочная вакансия "%s" автоматически закроется через %s. Если нашли сотрудника, закройте вручную.',
                job_record.title,
                to_char(job_record.auto_close_at - now(), 'HH24:MI')
            ),
            3,
            job_record.id,
            null,
            null,
            jsonb_build_object(
                'hours_left', extract(epoch from (job_record.auto_close_at - now())) / 3600
            )
        ) into notification_id;
        
        reminder_count := reminder_count + 1;
    end loop;
    
    -- Логируем результат
    insert into automation_logs (task_name, success, details, affected_rows)
    values ('send_urgent_job_expiry_reminders', true,
            format('Отправлено %s напоминаний о закрытии срочных вакансий', reminder_count),
            reminder_count);
    
    return query select reminder_count;
end;
$$ language plpgsql;

-- Функция очистки старых уведомлений
create or replace function cleanup_old_notifications()
returns table(deleted_notifications integer) as $$
declare
    affected_count integer;
begin
    -- Удаляем прочитанные уведомления старше 30 дней
    delete from notifications 
    where is_read = true 
    and read_at < now() - interval '30 days';
    
    get diagnostics affected_count = row_count;
    
    -- Логируем результат
    insert into automation_logs (task_name, success, details, affected_rows)
    values ('cleanup_old_notifications', true,
            format('Удалено %s старых уведомлений', affected_count),
            affected_count);
    
    return query select affected_count;
end;
$$ language plpgsql;

-- Функция обновления статистики пользователей
create or replace function update_user_statistics()
returns table(updated_users integer) as $$
declare
    affected_count integer := 0;
begin
    -- Обновляем статистику кандидатов
    update candidate_profiles cp set
        applications_sent = (
            select count(*) from applications a 
            where a.user_id = cp.user_id
        ),
        successful_applications = (
            select count(*) from applications a
            join job_postings jp on jp.id = a.job_id
            where a.user_id = cp.user_id and jp.status = 'filled'
        );
    
    get diagnostics affected_count = row_count;
    
    -- Обновляем статистику работодателей
    update employer_profiles ep set
        jobs_posted = (
            select count(*) from job_postings jp 
            where jp.employer_id = ep.user_id
        ),
        urgent_jobs_posted = (
            select count(*) from urgent_jobs uj 
            where uj.employer_id = ep.user_id
        );
    
    -- Логируем результат
    insert into automation_logs (task_name, success, details, affected_rows)
    values ('update_user_statistics', true,
            format('Обновлена статистика для %s пользователей', affected_count),
            affected_count);
    
    return query select affected_count;
end;
$$ language plpgsql;

-- Создаем представление для мониторинга автоматизации
create or replace view automation_status as
select 
    task_name,
    count(*) as total_runs,
    sum(case when success then 1 else 0 end) as successful_runs,
    sum(case when not success then 1 else 0 end) as failed_runs,
    max(executed_at) as last_run,
    sum(affected_rows) as total_affected_rows
from automation_logs
where executed_at > now() - interval '7 days'
group by task_name
order by last_run desc;

-- Если pg_cron доступен, создаем расписание задач
-- Каждые 15 минут - проверка просроченных срочных вакансий
-- select cron.schedule('cleanup_urgent_jobs', '*/15 * * * *', 'select cleanup_expired_urgent_jobs();');

-- Каждый час - проверка обычных вакансий
-- select cron.schedule('cleanup_job_postings', '0 * * * *', 'select cleanup_expired_job_postings();');

-- В 2 ночи - сброс флагов "готов завтра"
-- select cron.schedule('reset_ready_tomorrow', '0 2 * * *', 'select reset_ready_tomorrow_flags();');

-- Каждые 30 минут - напоминания о закрытии
-- select cron.schedule('expiry_reminders', '*/30 * * * *', 'select send_urgent_job_expiry_reminders();');

-- В 3 ночи - очистка старых уведомлений
-- select cron.schedule('cleanup_notifications', '0 3 * * *', 'select cleanup_old_notifications();');

-- В 4 ночи - обновление статистики
-- select cron.schedule('update_statistics', '0 4 * * *', 'select update_user_statistics();');

commit;
