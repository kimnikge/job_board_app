package handlers

import (
	"context"
	"net/http"

	"github.com/yourname/j_app/db"
	"github.com/yourname/j_app/models"

	"github.com/gin-gonic/gin"
)

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
