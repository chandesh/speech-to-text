package main

import (
	"log"

	"github.com/chandesh/speech-to-text/backend/apps/auth"
	"github.com/chandesh/speech-to-text/backend/apps/auth/models"
	"github.com/chandesh/speech-to-text/backend/core/config"
	"github.com/chandesh/speech-to-text/backend/core/database"
	"github.com/chandesh/speech-to-text/backend/core/middleware"
	"github.com/gin-gonic/gin"
)

func main() {
	cfg := config.Load()

	db := database.Connect(cfg.DatabaseURL, &models.User{}, &models.RefreshToken{})

	r := gin.Default()
	r.Use(middleware.CORS(cfg.AllowedOrigins))
	r.Use(middleware.Logger())

	api := r.Group("/api")

	api.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	auth.RegisterRoutes(api, db, cfg.JWTSecret)

	log.Printf("Server starting on :%s", cfg.Port)
	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
