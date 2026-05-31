package handlers

import (
	"errors"
	"net/http"

	"github.com/chandesh/speech-to-text/backend/apps/auth/services"
	"github.com/gin-gonic/gin"
)

type registerService interface {
	Register(input *services.RegisterInput) (*services.AuthResponse, error)
}

type RegisterHandler struct {
	authService registerService
}

func NewRegisterHandler(authService registerService) *RegisterHandler {
	return &RegisterHandler{authService: authService}
}

func (h *RegisterHandler) Handle(c *gin.Context) {
	var input services.RegisterInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	resp, err := h.authService.Register(&input)
	if err != nil {
		if errors.Is(err, services.ErrEmailAlreadyRegistered) {
			c.JSON(http.StatusConflict, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, resp)
}
