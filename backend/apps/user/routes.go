package user

import (
	"github.com/chandesh/speech-to-text/backend/apps/user/handlers"
	"github.com/chandesh/speech-to-text/backend/core/middleware"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func RegisterRoutes(r *gin.RouterGroup, db *gorm.DB, jwtSecret string) {
	h := handlers.NewHandler(db)
	ur := r.Group("/user")
	ur.Use(middleware.AuthRequired(jwtSecret))
	{
		ur.GET("/profile", h.GetProfile)
		ur.PUT("/profile", h.UpdateProfile)
		ur.POST("/change-password", h.ChangePassword)
	}
}
