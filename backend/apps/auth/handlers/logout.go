package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type logoutService interface {
	Logout(rawRefreshToken string) error
}

type LogoutHandler struct {
	authService logoutService
}

func NewLogoutHandler(authService logoutService) *LogoutHandler {
	return &LogoutHandler{authService: authService}
}

func (h *LogoutHandler) Handle(c *gin.Context) {
	var input struct {
		RefreshToken string `json:"refresh_token" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "refresh_token is required"})
		return
	}

	if err := h.authService.Logout(input.RefreshToken); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "logged out"})
}
