package handlers

import (
	"net/http"

	"github.com/chandesh/speech-to-text/backend/apps/auth/services"
	"github.com/gin-gonic/gin"
)

type refreshService interface {
	Refresh(rawRefreshToken string) (*services.TokenPair, error)
}

type RefreshHandler struct {
	authService refreshService
}

func NewRefreshHandler(authService refreshService) *RefreshHandler {
	return &RefreshHandler{authService: authService}
}

func (h *RefreshHandler) Handle(c *gin.Context) {
	var input struct {
		RefreshToken string `json:"refresh_token" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "refresh_token is required"})
		return
	}

	pair, err := h.authService.Refresh(input.RefreshToken)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, pair)
}
