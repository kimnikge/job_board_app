package handlers

import (
	"context"
	"net/http"

	"github.com/yourname/j_app/db"
	"github.com/yourname/j_app/models"

	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5" // Импортируем pgx для обработки ошибок типа NoRows
)

// CreateResume godoc
// @Summary Create a new resume
// @Description Create a new resume with the input payload
// @Tags resumes
// @Accept  json
// @Produce  json
// @Param   resume body models.Resume true "Resume Data"
// @Success 200 {object} map[string]string{status=string}
// @Failure 400 {object} map[string]string{error=string}
// @Failure 500 {object} map[string]string{error=string}
// @Router /resumes [post]
func CreateResume(c *gin.Context) {
	var resume models.Resume
	if err := c.ShouldBindJSON(&resume); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	_, err := db.Conn.Exec(context.Background(),
		`INSERT INTO resumes (user_id, full_name, city, phone, avatar, languages, hard_skills, education, avatar_url, work_experience, social_links, created_at)
		 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
		resume.UserID, resume.FullName, resume.City, resume.Phone, resume.Avatar, resume.Languages, resume.HardSkills, resume.Education, resume.AvatarURL, resume.WorkExperience, resume.SocialLinks, resume.CreatedAt,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "created"})
}

// GetResumes godoc
// @Summary Get all resumes
// @Description Get a list of all resumes
// @Tags resumes
// @Produce  json
// @Success 200 {array} models.Resume
// @Failure 500 {object} map[string]string{error=string}
// @Router /resumes [get]
func GetResumes(c *gin.Context) {
	rows, err := db.Conn.Query(context.Background(), "SELECT id, user_id, full_name, city, phone, avatar, languages, hard_skills, education, avatar_url, work_experience, social_links, created_at FROM resumes")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	var resumes []models.Resume
	for rows.Next() {
		var r models.Resume
		if err := rows.Scan(&r.ID, &r.UserID, &r.FullName, &r.City, &r.Phone, &r.Avatar, &r.Languages, &r.HardSkills, &r.Education, &r.AvatarURL, &r.WorkExperience, &r.SocialLinks, &r.CreatedAt); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		resumes = append(resumes, r)
	}

	c.JSON(http.StatusOK, resumes)
}

// GetUserResumes godoc
// @Summary Get resumes for the authenticated user
// @Description Get a list of resumes belonging to the currently authenticated user
// @Tags resumes
// @Produce  json
// @Security ApiKeyAuth
// @Success 200 {array} models.Resume
// @Failure 401 {object} map[string]string{error=string}
// @Failure 500 {object} map[string]string{error=string}
// @Router /users/me/resumes [get]
func GetUserResumes(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID not found in context"})
		return
	}

	// Преобразуем userID в int, если он хранится как строка
	userIdInt, err := strconv.Atoi(userID.(string))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user ID format"})
		return
	}

	rows, err := db.Conn.Query(context.Background(), "SELECT id, user_id, full_name, city, phone, avatar, languages, hard_skills, education, avatar_url, work_experience, social_links, created_at, is_available FROM resumes WHERE user_id = $1", userIdInt)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	var resumes []models.Resume
	for rows.Next() {
		var r models.Resume
		// Убедитесь, что порядок полей совпадает с SELECT запросом
		if err := rows.Scan(&r.ID, &r.UserID, &r.FullName, &r.City, &r.Phone, &r.Avatar, &r.Languages, &r.HardSkills, &r.Education, &r.AvatarURL, &r.WorkExperience, &r.SocialLinks, &r.CreatedAt, &r.IsAvailable); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		resumes = append(resumes, r)
	}

	c.JSON(http.StatusOK, resumes)
}

// ToggleResumeStatus godoc
// @Summary Toggle the availability status of a resume
// @Description Toggle the is_available status of a specific resume for the authenticated user
// @Tags resumes
// @Accept  json
// @Produce  json
// @Security ApiKeyAuth
// @Param   id path int true "Resume ID"
// @Param   status body bool true "New availability status"
// @Success 200 {object} map[string]string{status=string}
// @Failure 400 {object} map[string]string{error=string}
// @Failure 401 {object} map[string]string{error=string}
// @Failure 403 {object} map[string]string{error=string}
// @Failure 404 {object} map[string]string{error=string}
// @Failure 500 {object} map[string]string{error=string}
// @Router /resumes/{id}/status [put]
func ToggleResumeStatus(c *gin.Context) {
	resumeIDStr := c.Param("id")
	resumeID, err := strconv.Atoi(resumeIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid resume ID"})
		return
	}

	var requestBody struct {
		NewStatus bool `json:"is_available"`
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

	// Проверяем, принадлежит ли резюме текущему пользователю
	var ownerID int
	err = db.Conn.QueryRow(context.Background(), "SELECT user_id FROM resumes WHERE id = $1", resumeID).Scan(&ownerID)
	if err != nil {
		// Если резюме не найдено или ошибка БД
		c.JSON(http.StatusNotFound, gin.H{"error": "Resume not found or database error"})
		return
	}

	if ownerID != userIdInt {
		c.JSON(http.StatusForbidden, gin.H{"error": "You do not have permission to modify this resume"})
		return
	}

	// Обновляем статус is_available
	_, err = db.Conn.Exec(context.Background(), "UPDATE resumes SET is_available = $1 WHERE id = $2", requestBody.NewStatus, resumeID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update resume status"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "success", "new_status": requestBody.NewStatus})
}

// DeleteResume godoc
// @Summary Delete a resume
// @Description Delete a specific resume belonging to the authenticated user
// @Tags resumes
// @Produce  json
// @Security ApiKeyAuth
// @Param   id path int true "Resume ID"
// @Success 200 {object} map[string]string{status=string}
// @Failure 400 {object} map[string]string{error=string}
// @Failure 401 {object} map[string]string{error=string}
// @Failure 403 {object} map[string]string{error=string}
// @Failure 404 {object} map[string]string{error=string}
// @Failure 500 {object} map[string]string{error=string}
// @Router /resumes/{id} [delete]
func DeleteResume(c *gin.Context) {
	resumeIDStr := c.Param("id")
	resumeID, err := strconv.Atoi(resumeIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid resume ID"})
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

	// Проверяем, принадлежит ли резюме текущему пользователю перед удалением
	var ownerID int
	err = db.Conn.QueryRow(context.Background(), "SELECT user_id FROM resumes WHERE id = $1", resumeID).Scan(&ownerID)
	if err != nil {
		if err == pgx.ErrNoRows {
			c.JSON(http.StatusNotFound, gin.H{"error": "Resume not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error checking resume ownership"})
		return
	}

	if ownerID != userIdInt {
		c.JSON(http.StatusForbidden, gin.H{"error": "You do not have permission to delete this resume"})
		return
	}

	// Удаляем резюме
	_, err = db.Conn.Exec(context.Background(), "DELETE FROM resumes WHERE id = $1", resumeID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete resume"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "Resume deleted successfully"})
}
