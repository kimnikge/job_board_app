package models

import "time"

type WorkExperience struct {
	Place       string `json:"place"`
	Position    string `json:"position"`
	Period      string `json:"period"`
	Description string `json:"description,omitempty"`
}

type SocialLinks struct {
	Instagram string `json:"instagram,omitempty"`
	Telegram  string `json:"telegram,omitempty"`
	LinkedIn  string `json:"linkedin,omitempty"`
	Portfolio string `json:"portfolio,omitempty"`
}

type HardSkill struct {
	Name  string `json:"name"`
	Level int    `json:"level"`
}

type Education struct {
	Name         string `json:"name"`
	Year         int    `json:"year"`
	Organization string `json:"organization"`
}

type Resume struct {
	ID             int              `json:"id"`
	UserID         int              `json:"user_id" binding:"required"`
	FullName       string           `json:"full_name" binding:"required"`
	City           string           `json:"city" binding:"required"`
	Phone          string           `json:"phone" binding:"required"`
	Avatar         string           `json:"avatar,omitempty"`
	Languages      []string         `json:"languages"`
	HardSkills     []HardSkill      `json:"hard_skills"`
	Education      []Education      `json:"education"`
	AvatarURL      string           `json:"avatar_url,omitempty"`
	WorkExperience []WorkExperience `json:"work_experience"`
	SocialLinks    SocialLinks      `json:"social_links"`
	CreatedAt      time.Time        `json:"created_at"`
	IsAvailable    bool             `json:"is_available"`
}
