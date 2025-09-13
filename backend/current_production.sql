

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
    NEW.updated_at = now();
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



CREATE TABLE IF NOT EXISTS "public"."companies" (
    "id" integer NOT NULL,
    "name" character varying(200) NOT NULL,
    "description" "text",
    "logo_url" "text",
    "city_id" integer,
    "address" "text",
    "phone" character varying(20),
    "email" character varying(100),
    "website" character varying(200),
    "is_verified" boolean DEFAULT false,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."companies" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."companies_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."companies_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."companies_id_seq" OWNED BY "public"."companies"."id";



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
    "id" integer NOT NULL,
    "title" character varying(200) NOT NULL,
    "description" "text",
    "company_id" integer,
    "specialization_id" integer,
    "city_id" integer,
    "salary_min" integer,
    "salary_max" integer,
    "salary_currency" character varying(10) DEFAULT 'KZT'::character varying,
    "employment_type" character varying(20) DEFAULT 'full_time'::character varying,
    "experience_required" integer DEFAULT 0,
    "is_urgent" boolean DEFAULT false,
    "is_active" boolean DEFAULT true,
    "expires_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."job_postings" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."job_postings_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."job_postings_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."job_postings_id_seq" OWNED BY "public"."job_postings"."id";



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



CREATE TABLE IF NOT EXISTS "public"."user_profiles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "email" character varying(100),
    "full_name" character varying(100),
    "phone" character varying(20),
    "avatar_url" "text",
    "city_id" integer,
    "user_type" character varying(20) DEFAULT 'worker'::character varying,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "telegram_id" character varying(50),
    "telegram_username" character varying(100),
    "ready_for_urgent" boolean DEFAULT false
);


ALTER TABLE "public"."user_profiles" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."profiles" AS
 SELECT "id",
    "user_id",
    "telegram_id",
    "full_name" AS "first_name",
    NULL::"text" AS "last_name",
    "telegram_username",
    "avatar_url",
    "user_type",
    "phone",
    "email",
    "ready_for_urgent",
    "created_at",
    "updated_at"
   FROM "public"."user_profiles";


ALTER VIEW "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."specializations" (
    "id" integer NOT NULL,
    "name" character varying(100) NOT NULL,
    "category" character varying(50) DEFAULT 'general'::character varying,
    "is_popular" boolean DEFAULT false,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."specializations" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."specializations_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."specializations_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."specializations_id_seq" OWNED BY "public"."specializations"."id";



CREATE TABLE IF NOT EXISTS "public"."urgent_jobs" (
    "id" integer NOT NULL,
    "job_posting_id" integer,
    "urgency_level" integer DEFAULT 1,
    "shift_start" time without time zone,
    "shift_end" time without time zone,
    "workers_needed" integer DEFAULT 1,
    "contact_phone" character varying(20),
    "contact_person" character varying(100),
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."urgent_jobs" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."urgent_jobs_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."urgent_jobs_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."urgent_jobs_id_seq" OWNED BY "public"."urgent_jobs"."id";



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



ALTER TABLE ONLY "public"."companies" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."companies_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."job_applications" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."job_applications_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."job_favorites" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."job_favorites_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."job_postings" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."job_postings_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."notifications" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."notifications_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."specializations" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."specializations_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."urgent_jobs" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."urgent_jobs_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."user_skills" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."user_skills_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."cities"
    ADD CONSTRAINT "cities_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."companies"
    ADD CONSTRAINT "companies_pkey" PRIMARY KEY ("id");



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



ALTER TABLE ONLY "public"."specializations"
    ADD CONSTRAINT "specializations_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."specializations"
    ADD CONSTRAINT "specializations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."urgent_jobs"
    ADD CONSTRAINT "urgent_jobs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."user_skills"
    ADD CONSTRAINT "user_skills_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_cities_popular" ON "public"."cities" USING "btree" ("is_popular");



CREATE INDEX "idx_companies_city" ON "public"."companies" USING "btree" ("city_id");



CREATE INDEX "idx_job_postings_active" ON "public"."job_postings" USING "btree" ("is_active");



CREATE INDEX "idx_job_postings_city" ON "public"."job_postings" USING "btree" ("city_id");



CREATE INDEX "idx_job_postings_company" ON "public"."job_postings" USING "btree" ("company_id");



CREATE INDEX "idx_specializations_category" ON "public"."specializations" USING "btree" ("category");



CREATE INDEX "idx_specializations_popular" ON "public"."specializations" USING "btree" ("is_popular");



CREATE INDEX "idx_user_profiles_city" ON "public"."user_profiles" USING "btree" ("city_id");



CREATE UNIQUE INDEX "idx_user_profiles_telegram_id" ON "public"."user_profiles" USING "btree" ("telegram_id") WHERE ("telegram_id" IS NOT NULL);



CREATE INDEX "idx_user_profiles_type" ON "public"."user_profiles" USING "btree" ("user_type");



CREATE INDEX "idx_user_profiles_user_id" ON "public"."user_profiles" USING "btree" ("user_id");



CREATE OR REPLACE TRIGGER "update_companies_updated_at" BEFORE UPDATE ON "public"."companies" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_job_postings_updated_at" BEFORE UPDATE ON "public"."job_postings" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_user_profiles_updated_at" BEFORE UPDATE ON "public"."user_profiles" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."companies"
    ADD CONSTRAINT "companies_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "public"."cities"("id");



ALTER TABLE ONLY "public"."job_applications"
    ADD CONSTRAINT "job_applications_job_posting_id_fkey" FOREIGN KEY ("job_posting_id") REFERENCES "public"."job_postings"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."job_applications"
    ADD CONSTRAINT "job_applications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."job_favorites"
    ADD CONSTRAINT "job_favorites_job_posting_id_fkey" FOREIGN KEY ("job_posting_id") REFERENCES "public"."job_postings"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."job_favorites"
    ADD CONSTRAINT "job_favorites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."job_postings"
    ADD CONSTRAINT "job_postings_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "public"."cities"("id");



ALTER TABLE ONLY "public"."job_postings"
    ADD CONSTRAINT "job_postings_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."job_postings"
    ADD CONSTRAINT "job_postings_specialization_id_fkey" FOREIGN KEY ("specialization_id") REFERENCES "public"."specializations"("id");



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."urgent_jobs"
    ADD CONSTRAINT "urgent_jobs_job_posting_id_fkey" FOREIGN KEY ("job_posting_id") REFERENCES "public"."job_postings"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "public"."cities"("id");



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_skills"
    ADD CONSTRAINT "user_skills_specialization_id_fkey" FOREIGN KEY ("specialization_id") REFERENCES "public"."specializations"("id");



ALTER TABLE ONLY "public"."user_skills"
    ADD CONSTRAINT "user_skills_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("user_id") ON DELETE CASCADE;



ALTER TABLE "public"."cities" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "cities_public_read" ON "public"."cities" FOR SELECT USING (true);



ALTER TABLE "public"."companies" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "companies_insert" ON "public"."companies" FOR INSERT WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "companies_public_read" ON "public"."companies" FOR SELECT USING (true);



ALTER TABLE "public"."job_applications" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "job_applications_all" ON "public"."job_applications" USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."job_favorites" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "job_favorites_all" ON "public"."job_favorites" USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."job_postings" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "job_postings_insert" ON "public"."job_postings" FOR INSERT WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "job_postings_public_read" ON "public"."job_postings" FOR SELECT USING (("is_active" = true));



ALTER TABLE "public"."notifications" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "notifications_all" ON "public"."notifications" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "service_role_access" ON "public"."user_profiles" TO "service_role" USING (true) WITH CHECK (true);



ALTER TABLE "public"."specializations" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "specializations_public_read" ON "public"."specializations" FOR SELECT USING (true);



ALTER TABLE "public"."user_profiles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "user_profiles_all" ON "public"."user_profiles" USING (("auth"."uid"() = "user_id"));



REVOKE USAGE ON SCHEMA "public" FROM PUBLIC;
GRANT ALL ON SCHEMA "public" TO PUBLIC;
GRANT ALL ON SCHEMA "public" TO "anon";
GRANT ALL ON SCHEMA "public" TO "authenticated";
GRANT ALL ON SCHEMA "public" TO "service_role";



GRANT SELECT ON TABLE "public"."cities" TO "anon";



GRANT SELECT ON TABLE "public"."companies" TO "anon";



GRANT SELECT ON TABLE "public"."job_postings" TO "anon";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."user_profiles" TO "anon";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."user_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."user_profiles" TO "service_role";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."profiles" TO "authenticated";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."profiles" TO "anon";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."profiles" TO "service_role";



GRANT SELECT ON TABLE "public"."specializations" TO "anon";



RESET ALL;
