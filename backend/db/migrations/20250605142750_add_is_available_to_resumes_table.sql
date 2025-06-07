-- +goose Up
-- +goose StatementBegin
ALTER TABLE resumes ADD COLUMN is_available BOOLEAN DEFAULT TRUE;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE resumes DROP COLUMN is_available;
-- +goose StatementEnd
