package auth

import (
	"github.com/chandesh/speech-to-text/backend/apps/auth/handlers"
	"github.com/chandesh/speech-to-text/backend/apps/auth/services"
	"github.com/chandesh/speech-to-text/backend/core/middleware"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func RegisterRoutes(rg *gin.RouterGroup, db *gorm.DB, jwtSecret string) {
	passwordSvc := services.NewPasswordService()
	tokenSvc := services.NewTokenService(db, jwtSecret)
	authSvc := services.NewAuthService(db, passwordSvc, tokenSvc)

	registerH := handlers.NewRegisterHandler(authSvc)
	loginH := handlers.NewLoginHandler(authSvc)
	refreshH := handlers.NewRefreshHandler(authSvc)
	logoutH := handlers.NewLogoutHandler(authSvc)
	meH := handlers.NewMeHandler(db)

	rg.POST("/auth/register", registerH.Handle)
	rg.POST("/auth/login", loginH.Handle)
	rg.POST("/auth/refresh", refreshH.Handle)
	rg.POST("/auth/logout", logoutH.Handle)
	rg.GET("/auth/me", middleware.AuthRequired(jwtSecret), meH.Handle)
}
