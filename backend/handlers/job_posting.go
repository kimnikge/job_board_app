package handlers

import (
	"context"
	"net/http"
	"strconv"

	"github.com/yourname/j_app/db"
	"github.com/yourname/j_app/models"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5" // Импортируем pgx для обработки ошибок типа NoRows
)

// Заглушка для структуры JobPosting
// (в реальном проекте импортировать из models)
// type JobPosting struct {
// 	ID int
// }

// GetUserJobPostings godoc
// @Summary Get job postings for the authenticated employer
// @Description Get a list of job postings belonging to the currently authenticated employer
// @Tags job_postings
// @Produce  json
// @Security ApiKeyAuth
// @Success 200 {array} models.JobPosting
// @Failure 401 {object} map[string]string{error=string}
// @Failure 500 {object} map[string]string{error=string}
// @Router /users/me/jobs [get]
func GetUserJobPostings(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID not found in context"})
		return
	}

	userIdInt, err := strconv.Atoi(userID.(string))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user ID format"})
		return
	}

	rows, err := db.Conn.Query(context.Background(), "SELECT id, employer_id, title, description, salary_range, location, employment_type, is_active, is_approved, created_at, updated_at FROM job_postings WHERE employer_id = $1", userIdInt)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	var jobPostings []models.JobPosting
	for rows.Next() {
		var jp models.JobPosting
		if err := rows.Scan(&jp.ID, &jp.EmployerID, &jp.Title, &jp.Description, &jp.SalaryRange, &jp.Location, &jp.EmploymentType, &jp.IsActive, &jp.IsApproved, &jp.CreatedAt, &jp.UpdatedAt); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		jobPostings = append(jobPostings, jp)
	}

	c.JSON(http.StatusOK, jobPostings)
}

// ToggleJobPostingStatus godoc
// @Summary Toggle the active status of a job posting
// @Description Toggle the is_active status of a specific job posting for the authenticated employer
// @Tags job_postings
// @Accept  json
// @Produce  json
// @Security ApiKeyAuth
// @Param   id path int true "Job Posting ID"
// @Param   status body bool true "New active status"
// @Success 200 {object} map[string]string{status=string}
// @Failure 400 {object} map[string]string{error=string}
// @Failure 401 {object} map[string]string{error=string}
// @Failure 403 {object} map[string]string{error=string}
// @Failure 404 {object} map[string]string{error=string}
// @Failure 500 {object} map[string]string{error=string}
// @Router /jobs/{id}/status [put]
func ToggleJobPostingStatus(c *gin.Context) {
	jobIDStr := c.Param("id")
	jobID, err := strconv.Atoi(jobIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid job posting ID"})
		return
	}

	var requestBody struct {
		NewStatus bool `json:"is_active"`
	}
	if err := c.ShouldBindJSON(&requestBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID not found in context"})
		return
	}

	userIdInt, err := strconv.Atoi(userID.(string))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user ID format"})
		return
	}

	// Проверяем, принадлежит ли объявление текущему пользователю (работодателю)
	var ownerID int
	err = db.Conn.QueryRow(context.Background(), "SELECT employer_id FROM job_postings WHERE id = $1", jobID).Scan(&ownerID)
	if err != nil {
		if err == pgx.ErrNoRows {
			c.JSON(http.StatusNotFound, gin.H{"error": "Job posting not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error checking job posting ownership"})
		return
	}

	if ownerID != userIdInt {
		c.JSON(http.StatusForbidden, gin.H{"error": "You do not have permission to modify this job posting"})
		return
	}

	// Обновляем статус is_active
	_, err = db.Conn.Exec(context.Background(), "UPDATE job_postings SET is_active = $1, updated_at = NOW() WHERE id = $2", requestBody.NewStatus, jobID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update job posting status"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "success", "new_status": requestBody.NewStatus})
}

// DeleteJobPosting godoc
// @Summary Delete a job posting
// @Description Delete a specific job posting belonging to the authenticated employer
// @Tags job_postings
// @Produce  json
// @Security ApiKeyAuth
// @Param   id path int true "Job Posting ID"
// @Success 200 {object} map[string]string{status=string}
// @Failure 400 {object} map[string]string{error=string}
// @Failure 401 {object} map[string]string{error=string}
// @Failure 403 {object} map[string]string{error=string}
// @Failure 404 {object} map[string]string{error=string}
// @Failure 500 {object} map[string]string{error=string}
// @Router /jobs/{id} [delete]
func DeleteJobPosting(c *gin.Context) {
	jobIDStr := c.Param("id")
	jobID, err := strconv.Atoi(jobIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid job posting ID"})
		return
	}

	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID not found in context"})
		return
	}

	userIdInt, err := strconv.Atoi(userID.(string))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user ID format"})
		return
	}

	// Проверяем, принадлежит ли объявление текущему пользователю (работодателю) перед удалением
	var ownerID int
	err = db.Conn.QueryRow(context.Background(), "SELECT employer_id FROM job_postings WHERE id = $1", jobID).Scan(&ownerID)
	if err != nil {
		if err == pgx.ErrNoRows {
			c.JSON(http.StatusNotFound, gin.H{"error": "Job posting not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error checking job posting ownership"})
		return
	}

	if ownerID != userIdInt {
		c.JSON(http.StatusForbidden, gin.H{"error": "You do not have permission to delete this job posting"})
		return
	}

	// Удаляем объявление
	_, err = db.Conn.Exec(context.Background(), "DELETE FROM job_postings WHERE id = $1", jobID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete job posting"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "Job posting deleted successfully"})
}
