package handlers

import (
	"errors"
	"net/http"

	"github.com/chandesh/speech-to-text/backend/apps/auth/services"
	"github.com/gin-gonic/gin"
)

type loginService interface {
	Login(input *services.LoginInput) (*services.AuthResponse, error)
}

type LoginHandler struct {
	authService loginService
}

func NewLoginHandler(authService loginService) *LoginHandler {
	return &LoginHandler{authService: authService}
}

func (h *LoginHandler) Handle(c *gin.Context) {
	var input services.LoginInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	resp, err := h.authService.Login(&input)
	if err != nil {
		if errors.Is(err, services.ErrInvalidCredentials) {
			c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, resp)
}
