package models

import "time"

// JobPosting represents a job posting in the database
type JobPosting struct {
	ID             int       `json:"id"`
	EmployerID     int       `json:"employer_id" binding:"required"`
	Title          string    `json:"title" binding:"required"`
	Description    string    `json:"description" binding:"required"`
	SalaryRange    string    `json:"salary_range,omitempty"`
	Location       string    `json:"location,omitempty"`
	EmploymentType string    `json:"employment_type,omitempty"`
	IsActive       bool      `json:"is_active"`   // Статус активности
	IsApproved     bool      `json:"is_approved"` // Статус модерации
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at,omitempty"`
}

// JobCategory represents a job category
type JobCategory struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
}

// JobPostingCategory represents the many-to-many relationship between job postings and categories
type JobPostingCategory struct {
	JobID      int `json:"job_id"`
	CategoryID int `json:"category_id"`
}
