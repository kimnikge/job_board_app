package main

import (
	"context"
	"log"

	"github.com/yourname/j_app/db"
	"github.com/yourname/j_app/handlers"

	"github.com/gin-gonic/gin"
)

func main() {
	// Инициализация БД
	if err := db.Init(); err != nil {
		log.Fatal("DB connection failed:", err)
	}
	defer db.Conn.Close(context.Background())

	// Настройка сервера
	r := gin.Default()

	// Роуты
	r.POST("/resumes", handlers.CreateResume)
	r.GET("/resumes", handlers.GetResumes)

	// Запуск
	log.Println("Server running on :3000")
	r.Run(":3000")
}
