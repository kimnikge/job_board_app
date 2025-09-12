create sequence "public"."cities_id_seq";

create sequence "public"."companies_id_seq";

create sequence "public"."job_applications_id_seq";

create sequence "public"."job_favorites_id_seq";

create sequence "public"."job_postings_id_seq";

create sequence "public"."notifications_id_seq";

create sequence "public"."specializations_id_seq";

create sequence "public"."urgent_jobs_id_seq";

create sequence "public"."user_skills_id_seq";

create table "public"."cities" (
    "id" integer not null default nextval('cities_id_seq'::regclass),
    "name" character varying(100) not null,
    "region" character varying(100),
    "is_popular" boolean default false,
    "is_active" boolean default true,
    "created_at" timestamp with time zone default now()
);


alter table "public"."cities" enable row level security;

create table "public"."companies" (
    "id" integer not null default nextval('companies_id_seq'::regclass),
    "name" character varying(200) not null,
    "description" text,
    "logo_url" text,
    "city_id" integer,
    "address" text,
    "phone" character varying(20),
    "email" character varying(100),
    "website" character varying(200),
    "is_verified" boolean default false,
    "is_active" boolean default true,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."companies" enable row level security;

create table "public"."job_applications" (
    "id" integer not null default nextval('job_applications_id_seq'::regclass),
    "job_posting_id" integer,
    "user_id" uuid,
    "status" character varying(20) default 'pending'::character varying,
    "message" text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."job_applications" enable row level security;

create table "public"."job_favorites" (
    "id" integer not null default nextval('job_favorites_id_seq'::regclass),
    "job_posting_id" integer,
    "user_id" uuid,
    "created_at" timestamp with time zone default now()
);


alter table "public"."job_favorites" enable row level security;

create table "public"."job_postings" (
    "id" integer not null default nextval('job_postings_id_seq'::regclass),
    "title" character varying(200) not null,
    "description" text,
    "company_id" integer,
    "specialization_id" integer,
    "city_id" integer,
    "salary_min" integer,
    "salary_max" integer,
    "salary_currency" character varying(10) default 'KZT'::character varying,
    "employment_type" character varying(20) default 'full_time'::character varying,
    "experience_required" integer default 0,
    "is_urgent" boolean default false,
    "is_active" boolean default true,
    "expires_at" timestamp with time zone,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."job_postings" enable row level security;

create table "public"."notifications" (
    "id" integer not null default nextval('notifications_id_seq'::regclass),
    "user_id" uuid,
    "title" character varying(200) not null,
    "message" text,
    "type" character varying(50) default 'info'::character varying,
    "is_read" boolean default false,
    "created_at" timestamp with time zone default now()
);


alter table "public"."notifications" enable row level security;

create table "public"."specializations" (
    "id" integer not null default nextval('specializations_id_seq'::regclass),
    "name" character varying(100) not null,
    "category" character varying(50) default 'general'::character varying,
    "is_popular" boolean default false,
    "is_active" boolean default true,
    "created_at" timestamp with time zone default now()
);


alter table "public"."specializations" enable row level security;

create table "public"."urgent_jobs" (
    "id" integer not null default nextval('urgent_jobs_id_seq'::regclass),
    "job_posting_id" integer,
    "urgency_level" integer default 1,
    "shift_start" time without time zone,
    "shift_end" time without time zone,
    "workers_needed" integer default 1,
    "contact_phone" character varying(20),
    "contact_person" character varying(100),
    "created_at" timestamp with time zone default now()
);


create table "public"."user_profiles" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid,
    "email" character varying(100),
    "full_name" character varying(100),
    "phone" character varying(20),
    "avatar_url" text,
    "city_id" integer,
    "user_type" character varying(20) default 'worker'::character varying,
    "is_active" boolean default true,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "telegram_id" character varying(50),
    "telegram_username" character varying(100),
    "ready_for_urgent" boolean default false
);


alter table "public"."user_profiles" enable row level security;

create table "public"."user_skills" (
    "id" integer not null default nextval('user_skills_id_seq'::regclass),
    "user_id" uuid,
    "specialization_id" integer,
    "experience_years" integer default 0,
    "is_primary" boolean default false,
    "created_at" timestamp with time zone default now()
);


alter sequence "public"."cities_id_seq" owned by "public"."cities"."id";

alter sequence "public"."companies_id_seq" owned by "public"."companies"."id";

alter sequence "public"."job_applications_id_seq" owned by "public"."job_applications"."id";

alter sequence "public"."job_favorites_id_seq" owned by "public"."job_favorites"."id";

alter sequence "public"."job_postings_id_seq" owned by "public"."job_postings"."id";

alter sequence "public"."notifications_id_seq" owned by "public"."notifications"."id";

alter sequence "public"."specializations_id_seq" owned by "public"."specializations"."id";

alter sequence "public"."urgent_jobs_id_seq" owned by "public"."urgent_jobs"."id";

alter sequence "public"."user_skills_id_seq" owned by "public"."user_skills"."id";

CREATE UNIQUE INDEX cities_pkey ON public.cities USING btree (id);

CREATE UNIQUE INDEX companies_pkey ON public.companies USING btree (id);

CREATE INDEX idx_cities_popular ON public.cities USING btree (is_popular);

CREATE INDEX idx_companies_city ON public.companies USING btree (city_id);

CREATE INDEX idx_job_postings_active ON public.job_postings USING btree (is_active);

CREATE INDEX idx_job_postings_city ON public.job_postings USING btree (city_id);

CREATE INDEX idx_job_postings_company ON public.job_postings USING btree (company_id);

CREATE INDEX idx_specializations_category ON public.specializations USING btree (category);

CREATE INDEX idx_specializations_popular ON public.specializations USING btree (is_popular);

CREATE INDEX idx_user_profiles_city ON public.user_profiles USING btree (city_id);

CREATE UNIQUE INDEX idx_user_profiles_telegram_id ON public.user_profiles USING btree (telegram_id) WHERE (telegram_id IS NOT NULL);

CREATE INDEX idx_user_profiles_type ON public.user_profiles USING btree (user_type);

CREATE INDEX idx_user_profiles_user_id ON public.user_profiles USING btree (user_id);

CREATE UNIQUE INDEX job_applications_pkey ON public.job_applications USING btree (id);

CREATE UNIQUE INDEX job_favorites_job_posting_id_user_id_key ON public.job_favorites USING btree (job_posting_id, user_id);

CREATE UNIQUE INDEX job_favorites_pkey ON public.job_favorites USING btree (id);

CREATE UNIQUE INDEX job_postings_pkey ON public.job_postings USING btree (id);

CREATE UNIQUE INDEX notifications_pkey ON public.notifications USING btree (id);

CREATE UNIQUE INDEX specializations_name_key ON public.specializations USING btree (name);

CREATE UNIQUE INDEX specializations_pkey ON public.specializations USING btree (id);

CREATE UNIQUE INDEX urgent_jobs_pkey ON public.urgent_jobs USING btree (id);

CREATE UNIQUE INDEX user_profiles_pkey ON public.user_profiles USING btree (id);

CREATE UNIQUE INDEX user_profiles_user_id_key ON public.user_profiles USING btree (user_id);

CREATE UNIQUE INDEX user_skills_pkey ON public.user_skills USING btree (id);

alter table "public"."cities" add constraint "cities_pkey" PRIMARY KEY using index "cities_pkey";

alter table "public"."companies" add constraint "companies_pkey" PRIMARY KEY using index "companies_pkey";

alter table "public"."job_applications" add constraint "job_applications_pkey" PRIMARY KEY using index "job_applications_pkey";

alter table "public"."job_favorites" add constraint "job_favorites_pkey" PRIMARY KEY using index "job_favorites_pkey";

alter table "public"."job_postings" add constraint "job_postings_pkey" PRIMARY KEY using index "job_postings_pkey";

alter table "public"."notifications" add constraint "notifications_pkey" PRIMARY KEY using index "notifications_pkey";

alter table "public"."specializations" add constraint "specializations_pkey" PRIMARY KEY using index "specializations_pkey";

alter table "public"."urgent_jobs" add constraint "urgent_jobs_pkey" PRIMARY KEY using index "urgent_jobs_pkey";

alter table "public"."user_profiles" add constraint "user_profiles_pkey" PRIMARY KEY using index "user_profiles_pkey";

alter table "public"."user_skills" add constraint "user_skills_pkey" PRIMARY KEY using index "user_skills_pkey";

alter table "public"."companies" add constraint "companies_city_id_fkey" FOREIGN KEY (city_id) REFERENCES cities(id) not valid;

alter table "public"."companies" validate constraint "companies_city_id_fkey";

alter table "public"."job_applications" add constraint "job_applications_job_posting_id_fkey" FOREIGN KEY (job_posting_id) REFERENCES job_postings(id) ON DELETE CASCADE not valid;

alter table "public"."job_applications" validate constraint "job_applications_job_posting_id_fkey";

alter table "public"."job_applications" add constraint "job_applications_user_id_fkey" FOREIGN KEY (user_id) REFERENCES user_profiles(user_id) ON DELETE CASCADE not valid;

alter table "public"."job_applications" validate constraint "job_applications_user_id_fkey";

alter table "public"."job_favorites" add constraint "job_favorites_job_posting_id_fkey" FOREIGN KEY (job_posting_id) REFERENCES job_postings(id) ON DELETE CASCADE not valid;

alter table "public"."job_favorites" validate constraint "job_favorites_job_posting_id_fkey";

alter table "public"."job_favorites" add constraint "job_favorites_job_posting_id_user_id_key" UNIQUE using index "job_favorites_job_posting_id_user_id_key";

alter table "public"."job_favorites" add constraint "job_favorites_user_id_fkey" FOREIGN KEY (user_id) REFERENCES user_profiles(user_id) ON DELETE CASCADE not valid;

alter table "public"."job_favorites" validate constraint "job_favorites_user_id_fkey";

alter table "public"."job_postings" add constraint "job_postings_city_id_fkey" FOREIGN KEY (city_id) REFERENCES cities(id) not valid;

alter table "public"."job_postings" validate constraint "job_postings_city_id_fkey";

alter table "public"."job_postings" add constraint "job_postings_company_id_fkey" FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE not valid;

alter table "public"."job_postings" validate constraint "job_postings_company_id_fkey";

alter table "public"."job_postings" add constraint "job_postings_specialization_id_fkey" FOREIGN KEY (specialization_id) REFERENCES specializations(id) not valid;

alter table "public"."job_postings" validate constraint "job_postings_specialization_id_fkey";

alter table "public"."notifications" add constraint "notifications_user_id_fkey" FOREIGN KEY (user_id) REFERENCES user_profiles(user_id) ON DELETE CASCADE not valid;

alter table "public"."notifications" validate constraint "notifications_user_id_fkey";

alter table "public"."specializations" add constraint "specializations_name_key" UNIQUE using index "specializations_name_key";

alter table "public"."urgent_jobs" add constraint "urgent_jobs_job_posting_id_fkey" FOREIGN KEY (job_posting_id) REFERENCES job_postings(id) ON DELETE CASCADE not valid;

alter table "public"."urgent_jobs" validate constraint "urgent_jobs_job_posting_id_fkey";

alter table "public"."user_profiles" add constraint "user_profiles_city_id_fkey" FOREIGN KEY (city_id) REFERENCES cities(id) not valid;

alter table "public"."user_profiles" validate constraint "user_profiles_city_id_fkey";

alter table "public"."user_profiles" add constraint "user_profiles_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."user_profiles" validate constraint "user_profiles_user_id_fkey";

alter table "public"."user_profiles" add constraint "user_profiles_user_id_key" UNIQUE using index "user_profiles_user_id_key";

alter table "public"."user_skills" add constraint "user_skills_specialization_id_fkey" FOREIGN KEY (specialization_id) REFERENCES specializations(id) not valid;

alter table "public"."user_skills" validate constraint "user_skills_specialization_id_fkey";

alter table "public"."user_skills" add constraint "user_skills_user_id_fkey" FOREIGN KEY (user_id) REFERENCES user_profiles(user_id) ON DELETE CASCADE not valid;

alter table "public"."user_skills" validate constraint "user_skills_user_id_fkey";

set check_function_bodies = off;

create or replace view "public"."profiles" as  SELECT id,
    user_id,
    telegram_id,
    full_name AS first_name,
    NULL::text AS last_name,
    telegram_username,
    avatar_url,
    user_type,
    phone,
    email,
    ready_for_urgent,
    created_at,
    updated_at
   FROM user_profiles;


CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$
;

create policy "cities_public_read"
on "public"."cities"
as permissive
for select
to public
using (true);


create policy "companies_insert"
on "public"."companies"
as permissive
for insert
to public
with check ((auth.role() = 'authenticated'::text));


create policy "companies_public_read"
on "public"."companies"
as permissive
for select
to public
using (true);


create policy "job_applications_all"
on "public"."job_applications"
as permissive
for all
to public
using ((auth.uid() = user_id));


create policy "job_favorites_all"
on "public"."job_favorites"
as permissive
for all
to public
using ((auth.uid() = user_id));


create policy "job_postings_insert"
on "public"."job_postings"
as permissive
for insert
to public
with check ((auth.role() = 'authenticated'::text));


create policy "job_postings_public_read"
on "public"."job_postings"
as permissive
for select
to public
using ((is_active = true));


create policy "notifications_all"
on "public"."notifications"
as permissive
for all
to public
using ((auth.uid() = user_id));


create policy "specializations_public_read"
on "public"."specializations"
as permissive
for select
to public
using (true);


create policy "service_role_access"
on "public"."user_profiles"
as permissive
for all
to service_role
using (true)
with check (true);


create policy "user_profiles_all"
on "public"."user_profiles"
as permissive
for all
to public
using ((auth.uid() = user_id));


CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON public.companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_job_postings_updated_at BEFORE UPDATE ON public.job_postings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


