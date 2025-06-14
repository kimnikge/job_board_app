-- +goose Up
-- SQL in this section is executed when the migration is applied.
ALTER TABLE job_postings
ADD COLUMN is_urgent BOOLEAN DEFAULT FALSE,
ADD COLUMN deadline VARCHAR(50),
ADD COLUMN company_logo_emoji VARCHAR(20),
ADD COLUMN tags JSONB,
ADD COLUMN benefits JSONB;

-- +goose Down
-- SQL in this section is executed when the migration is rolled back.
ALTER TABLE job_postings
DROP COLUMN is_urgent,
DROP COLUMN deadline,
DROP COLUMN company_logo_emoji,
DROP COLUMN tags,
DROP COLUMN benefits; 