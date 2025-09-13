

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."cities" (
    "id" integer NOT NULL,
    "name" character varying(100) NOT NULL,
    "region" character varying(100),
    "is_popular" boolean DEFAULT false,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."cities" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."cities_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."cities_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."cities_id_seq" OWNED BY "public"."cities"."id";



CREATE TABLE IF NOT EXISTS "public"."employers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "company_name" "text" NOT NULL,
    "company_type" "text" DEFAULT 'restaurant'::"text",
    "location" "text",
    "contact_person" "text",
    "contact_phone" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "employers_company_type_check" CHECK (("company_type" = ANY (ARRAY['restaurant'::"text", 'cafe'::"text", 'bar'::"text", 'hotel'::"text", 'catering'::"text", 'other'::"text"])))
);


ALTER TABLE "public"."employers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."job_applications" (
    "id" integer NOT NULL,
    "job_posting_id" integer,
    "user_id" "uuid",
    "status" character varying(20) DEFAULT 'pending'::character varying,
    "message" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."job_applications" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."job_applications_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."job_applications_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."job_applications_id_seq" OWNED BY "public"."job_applications"."id";



CREATE TABLE IF NOT EXISTS "public"."job_favorites" (
    "id" integer NOT NULL,
    "job_posting_id" integer,
    "user_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."job_favorites" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."job_favorites_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."job_favorites_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."job_favorites_id_seq" OWNED BY "public"."job_favorites"."id";



CREATE TABLE IF NOT EXISTS "public"."job_postings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "employer_id" "uuid",
    "title" "text" NOT NULL,
    "description" "text",
    "category" "text" DEFAULT 'service'::"text",
    "position_type" "text" DEFAULT 'waiter'::"text",
    "salary_min" integer,
    "salary_max" integer,
    "salary_type" "text" DEFAULT 'monthly'::"text",
    "employment_type" "text" DEFAULT 'full_time'::"text",
    "schedule_type" "text" DEFAULT 'fixed'::"text",
    "experience_required" "text" DEFAULT 'none'::"text",
    "required_skills" "text"[] DEFAULT '{}'::"text"[],
    "benefits" "text"[] DEFAULT '{}'::"text"[],
    "location" "text",
    "status" "text" DEFAULT 'active'::"text",
    "contact_phone" "text",
    "positions_total" integer DEFAULT 1,
    "positions_filled" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "job_postings_category_check" CHECK (("category" = ANY (ARRAY['service'::"text", 'kitchen'::"text", 'management'::"text", 'cleaning'::"text", 'other'::"text"]))),
    CONSTRAINT "job_postings_employment_type_check" CHECK (("employment_type" = ANY (ARRAY['full_time'::"text", 'part_time'::"text", 'temporary'::"text", 'internship'::"text"]))),
    CONSTRAINT "job_postings_experience_required_check" CHECK (("experience_required" = ANY (ARRAY['none'::"text", 'any'::"text", '1year+'::"text", '3years+'::"text", '5years+'::"text"]))),
    CONSTRAINT "job_postings_position_type_check" CHECK (("position_type" = ANY (ARRAY['waiter'::"text", 'bartender'::"text", 'cook'::"text", 'chef'::"text", 'cashier'::"text", 'cleaner'::"text", 'manager'::"text", 'host'::"text", 'other'::"text"]))),
    CONSTRAINT "job_postings_salary_type_check" CHECK (("salary_type" = ANY (ARRAY['hourly'::"text", 'daily'::"text", 'monthly'::"text"]))),
    CONSTRAINT "job_postings_schedule_type_check" CHECK (("schedule_type" = ANY (ARRAY['fixed'::"text", 'flexible'::"text", 'shift'::"text", 'night'::"text", 'weekend'::"text"]))),
    CONSTRAINT "job_postings_status_check" CHECK (("status" = ANY (ARRAY['draft'::"text", 'active'::"text", 'paused'::"text", 'filled'::"text", 'expired'::"text"])))
);


ALTER TABLE "public"."job_postings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."notifications" (
    "id" integer NOT NULL,
    "user_id" "uuid",
    "title" character varying(200) NOT NULL,
    "message" "text",
    "type" character varying(50) DEFAULT 'info'::character varying,
    "is_read" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."notifications" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."notifications_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."notifications_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."notifications_id_seq" OWNED BY "public"."notifications"."id";



CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "telegram_id" bigint,
    "full_name" "text",
    "username" "text",
    "phone" "text",
    "role" "text" DEFAULT 'candidate'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "profiles_role_check" CHECK (("role" = ANY (ARRAY['candidate'::"text", 'employer'::"text", 'admin'::"text"])))
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."urgent_jobs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "employer_id" "uuid",
    "title" "text" NOT NULL,
    "category" "text" DEFAULT 'service'::"text",
    "position_type" "text" DEFAULT 'waiter'::"text",
    "needed_date" "date" NOT NULL,
    "needed_time_start" time without time zone,
    "needed_time_end" time without time zone,
    "payment_per_shift" integer,
    "location" "text",
    "status" "text" DEFAULT 'active'::"text",
    "priority" "text" DEFAULT 'normal'::"text",
    "positions_needed" integer DEFAULT 1,
    "positions_filled" integer DEFAULT 0,
    "required_skills" "text"[] DEFAULT '{}'::"text"[],
    "instant_payment" boolean DEFAULT false,
    "contact_phone" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "urgent_jobs_category_check" CHECK (("category" = ANY (ARRAY['service'::"text", 'kitchen'::"text", 'management'::"text", 'cleaning'::"text", 'other'::"text"]))),
    CONSTRAINT "urgent_jobs_payment_per_shift_check" CHECK (("payment_per_shift" > 0)),
    CONSTRAINT "urgent_jobs_position_type_check" CHECK (("position_type" = ANY (ARRAY['waiter'::"text", 'bartender'::"text", 'cook'::"text", 'chef'::"text", 'cashier'::"text", 'cleaner'::"text", 'manager'::"text", 'host'::"text", 'other'::"text"]))),
    CONSTRAINT "urgent_jobs_positions_needed_check" CHECK (("positions_needed" > 0)),
    CONSTRAINT "urgent_jobs_priority_check" CHECK (("priority" = ANY (ARRAY['low'::"text", 'normal'::"text", 'high'::"text", 'critical'::"text"]))),
    CONSTRAINT "urgent_jobs_status_check" CHECK (("status" = ANY (ARRAY['active'::"text", 'filled'::"text", 'expired'::"text", 'cancelled'::"text"])))
);


ALTER TABLE "public"."urgent_jobs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_skills" (
    "id" integer NOT NULL,
    "user_id" "uuid",
    "specialization_id" integer,
    "experience_years" integer DEFAULT 0,
    "is_primary" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."user_skills" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."user_skills_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."user_skills_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."user_skills_id_seq" OWNED BY "public"."user_skills"."id";



ALTER TABLE ONLY "public"."cities" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."cities_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."job_applications" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."job_applications_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."job_favorites" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."job_favorites_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."notifications" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."notifications_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."user_skills" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."user_skills_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."cities"
    ADD CONSTRAINT "cities_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."employers"
    ADD CONSTRAINT "employers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."job_applications"
    ADD CONSTRAINT "job_applications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."job_favorites"
    ADD CONSTRAINT "job_favorites_job_posting_id_user_id_key" UNIQUE ("job_posting_id", "user_id");



ALTER TABLE ONLY "public"."job_favorites"
    ADD CONSTRAINT "job_favorites_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."job_postings"
    ADD CONSTRAINT "job_postings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_telegram_id_key" UNIQUE ("telegram_id");



ALTER TABLE ONLY "public"."urgent_jobs"
    ADD CONSTRAINT "urgent_jobs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_skills"
    ADD CONSTRAINT "user_skills_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_cities_popular" ON "public"."cities" USING "btree" ("is_popular");



CREATE INDEX "idx_employers_user_id" ON "public"."employers" USING "btree" ("user_id");



CREATE INDEX "idx_job_postings_category" ON "public"."job_postings" USING "btree" ("category");



CREATE INDEX "idx_job_postings_employer" ON "public"."job_postings" USING "btree" ("employer_id");



CREATE INDEX "idx_job_postings_position_type" ON "public"."job_postings" USING "btree" ("position_type");



CREATE INDEX "idx_job_postings_status" ON "public"."job_postings" USING "btree" ("status");



CREATE INDEX "idx_profiles_role" ON "public"."profiles" USING "btree" ("role");



CREATE INDEX "idx_profiles_telegram_id" ON "public"."profiles" USING "btree" ("telegram_id");



CREATE INDEX "idx_urgent_jobs_category" ON "public"."urgent_jobs" USING "btree" ("category");



CREATE INDEX "idx_urgent_jobs_needed_date" ON "public"."urgent_jobs" USING "btree" ("needed_date");



CREATE INDEX "idx_urgent_jobs_priority" ON "public"."urgent_jobs" USING "btree" ("priority");



CREATE INDEX "idx_urgent_jobs_status" ON "public"."urgent_jobs" USING "btree" ("status");



CREATE OR REPLACE TRIGGER "update_employers_updated_at" BEFORE UPDATE ON "public"."employers" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_job_postings_updated_at" BEFORE UPDATE ON "public"."job_postings" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_profiles_updated_at" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_urgent_jobs_updated_at" BEFORE UPDATE ON "public"."urgent_jobs" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."employers"
    ADD CONSTRAINT "employers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."job_postings"
    ADD CONSTRAINT "job_postings_employer_id_fkey" FOREIGN KEY ("employer_id") REFERENCES "public"."employers"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."urgent_jobs"
    ADD CONSTRAINT "urgent_jobs_employer_id_fkey" FOREIGN KEY ("employer_id") REFERENCES "public"."employers"("id") ON DELETE CASCADE;



CREATE POLICY "Employers can manage their jobs" ON "public"."job_postings" USING (("employer_id" IN ( SELECT "employers"."id"
   FROM "public"."employers"
  WHERE ("employers"."user_id" = "auth"."uid"()))));



CREATE POLICY "Employers can manage their urgent jobs" ON "public"."urgent_jobs" USING (("employer_id" IN ( SELECT "employers"."id"
   FROM "public"."employers"
  WHERE ("employers"."user_id" = "auth"."uid"()))));



CREATE POLICY "Public can view active jobs" ON "public"."job_postings" FOR SELECT USING (("status" = 'active'::"text"));



CREATE POLICY "Public can view active urgent jobs" ON "public"."urgent_jobs" FOR SELECT USING (("status" = 'active'::"text"));



CREATE POLICY "Public can view employers" ON "public"."employers" FOR SELECT USING (true);



CREATE POLICY "Public can view profiles" ON "public"."profiles" FOR SELECT USING (true);



CREATE POLICY "Users can edit own profile" ON "public"."profiles" USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can manage their employer profile" ON "public"."employers" USING (("user_id" = "auth"."uid"()));



ALTER TABLE "public"."cities" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "cities_public_read" ON "public"."cities" FOR SELECT USING (true);



ALTER TABLE "public"."employers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."job_applications" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "job_applications_all" ON "public"."job_applications" USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."job_favorites" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "job_favorites_all" ON "public"."job_favorites" USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."job_postings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."notifications" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "notifications_all" ON "public"."notifications" USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."urgent_jobs" ENABLE ROW LEVEL SECURITY;


REVOKE USAGE ON SCHEMA "public" FROM PUBLIC;
GRANT ALL ON SCHEMA "public" TO PUBLIC;
GRANT ALL ON SCHEMA "public" TO "anon";
GRANT ALL ON SCHEMA "public" TO "authenticated";
GRANT ALL ON SCHEMA "public" TO "service_role";



GRANT SELECT ON TABLE "public"."cities" TO "anon";



RESET ALL;
