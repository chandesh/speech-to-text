package handlers

import (
	"net/http"

	"github.com/chandesh/speech-to-text/backend/apps/auth/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type Handler struct {
	db *gorm.DB
}

func NewHandler(db *gorm.DB) *Handler {
	return &Handler{db: db}
}

type updateProfileRequest struct {
	FullName string `json:"full_name" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
}

func (h *Handler) GetProfile(c *gin.Context) {
	userID := c.GetString("user_id")
	var user models.User
	if err := h.db.First(&user, "id = ?", userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"id":         user.ID,
		"email":      user.Email,
		"full_name":  user.FullName,
		"created_at": user.CreatedAt,
	})
}

func (h *Handler) UpdateProfile(c *gin.Context) {
	userID := c.GetString("user_id")
	var req updateProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var user models.User
	if err := h.db.First(&user, "id = ?", userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}

	user.FullName = req.FullName
	user.Email = req.Email
	if err := h.db.Save(&user).Error; err != nil {
		c.JSON(http.StatusConflict, gin.H{"error": "email already in use"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"id":         user.ID,
		"email":      user.Email,
		"full_name":  user.FullName,
		"created_at": user.CreatedAt,
	})
}
