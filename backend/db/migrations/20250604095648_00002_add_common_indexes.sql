-- +goose Up
-- SQL in this section is executed when the migration is applied.

-- Индексы для таблицы users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Индексы для таблицы job_postings
CREATE INDEX IF NOT EXISTS idx_job_postings_employer_id ON job_postings(employer_id);
CREATE INDEX IF NOT EXISTS idx_job_postings_created_at ON job_postings(created_at DESC); -- DESC для частых запросов последних вакансий
CREATE INDEX IF NOT EXISTS idx_job_postings_location ON job_postings(location);
CREATE INDEX IF NOT EXISTS idx_job_postings_is_active ON job_postings(is_active);
CREATE INDEX IF NOT EXISTS idx_job_postings_is_approved ON job_postings(is_approved);


-- Индексы для таблицы job_posting_categories
CREATE INDEX IF NOT EXISTS idx_job_posting_categories_job_id ON job_posting_categories(job_id);
CREATE INDEX IF NOT EXISTS idx_job_posting_categories_category_id ON job_posting_categories(category_id);

-- Индексы для таблицы resumes
CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_resumes_city ON resumes(city);
CREATE INDEX IF NOT EXISTS idx_resumes_created_at ON resumes(created_at DESC);

-- Индексы для таблицы applications
CREATE INDEX IF NOT EXISTS idx_applications_job_posting_id ON applications(job_posting_id);
CREATE INDEX IF NOT EXISTS idx_applications_job_seeker_id ON applications(job_seeker_id);
CREATE INDEX IF NOT EXISTS idx_applications_resume_id ON applications(resume_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_created_at ON applications(created_at DESC);

-- Индексы для таблицы application_status_history
CREATE INDEX IF NOT EXISTS idx_application_status_history_application_id ON application_status_history(application_id);
CREATE INDEX IF NOT EXISTS idx_application_status_history_changed_by ON application_status_history(changed_by);

-- Индексы для таблицы moderation_rejects
CREATE INDEX IF NOT EXISTS idx_moderation_rejects_job_posting_id ON moderation_rejects(job_posting_id);
CREATE INDEX IF NOT EXISTS idx_moderation_rejects_moderator_id ON moderation_rejects(moderator_id);


-- +goose Down
-- SQL in this section is executed when the migration is rolled back.
DROP INDEX IF EXISTS idx_users_email;
DROP INDEX IF EXISTS idx_users_role;

DROP INDEX IF EXISTS idx_job_postings_employer_id;
DROP INDEX IF EXISTS idx_job_postings_created_at;
DROP INDEX IF EXISTS idx_job_postings_location;
DROP INDEX IF EXISTS idx_job_postings_is_active;
DROP INDEX IF EXISTS idx_job_postings_is_approved;

DROP INDEX IF EXISTS idx_job_posting_categories_job_id;
DROP INDEX IF EXISTS idx_job_posting_categories_category_id;

DROP INDEX IF EXISTS idx_resumes_user_id;
DROP INDEX IF EXISTS idx_resumes_city;
DROP INDEX IF EXISTS idx_resumes_created_at;

DROP INDEX IF EXISTS idx_applications_job_posting_id;
DROP INDEX IF EXISTS idx_applications_job_seeker_id;
DROP INDEX IF EXISTS idx_applications_resume_id;
DROP INDEX IF EXISTS idx_applications_status;
DROP INDEX IF EXISTS idx_applications_created_at;

DROP INDEX IF EXISTS idx_application_status_history_application_id;
DROP INDEX IF EXISTS idx_application_status_history_changed_by;

DROP INDEX IF EXISTS idx_moderation_rejects_job_posting_id;
DROP INDEX IF EXISTS idx_moderation_rejects_moderator_id;
