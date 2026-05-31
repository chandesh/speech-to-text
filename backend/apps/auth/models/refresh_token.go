package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type RefreshToken struct {
	ID        string    `gorm:"type:uuid;primaryKey" json:"id"`
	UserID    string    `gorm:"type:uuid;index;not null" json:"user_id"`
	TokenHash string    `gorm:"not null" json:"-"`
	ExpiresAt time.Time `gorm:"not null" json:"expires_at"`
	Revoked   bool      `gorm:"default:false" json:"-"`
	CreatedAt time.Time `json:"created_at"`

	User User `gorm:"constraint:OnDelete:CASCADE" json:"-"`
}

func (rt *RefreshToken) BeforeCreate(tx *gorm.DB) error {
	rt.ID = uuid.New().String()
	return nil
}

func (RefreshToken) TableName() string {
	return "refresh_tokens"
}
