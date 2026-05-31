package services

import (
	"crypto/rand"
	"encoding/hex"
	"time"

	"github.com/chandesh/speech-to-text/backend/apps/auth/models"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type TokenService struct {
	db        *gorm.DB
	jwtSecret string
}

func NewTokenService(db *gorm.DB, jwtSecret string) *TokenService {
	return &TokenService{db: db, jwtSecret: jwtSecret}
}

type TokenPair struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
}

func (s *TokenService) GenerateAccessToken(user *models.User) (string, error) {
	claims := jwt.MapClaims{
		"user_id": user.ID,
		"email":   user.Email,
		"exp":     time.Now().Add(15 * time.Minute).Unix(),
		"iat":     time.Now().Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(s.jwtSecret))
}

func (s *TokenService) GenerateRefreshToken(userID string) (*models.RefreshToken, string, error) {
	rawBytes := make([]byte, 32)
	if _, err := rand.Read(rawBytes); err != nil {
		return nil, "", err
	}

	rawToken := hex.EncodeToString(rawBytes)

	hashBytes, err := bcrypt.GenerateFromPassword([]byte(rawToken), bcrypt.DefaultCost)
	if err != nil {
		return nil, "", err
	}

	refreshToken := &models.RefreshToken{
		UserID:    userID,
		TokenHash: string(hashBytes),
		ExpiresAt: time.Now().Add(7 * 24 * time.Hour),
	}

	if err := s.db.Create(refreshToken).Error; err != nil {
		return nil, "", err
	}

	return refreshToken, rawToken, nil
}

func (s *TokenService) ValidateRefreshToken(rawToken string) (*models.RefreshToken, error) {
	var allTokens []models.RefreshToken
	if err := s.db.Where("revoked = ? AND expires_at > ?", false, time.Now()).Find(&allTokens).Error; err != nil {
		return nil, err
	}

	for _, rt := range allTokens {
		if bcrypt.CompareHashAndPassword([]byte(rt.TokenHash), []byte(rawToken)) == nil {
			return &rt, nil
		}
	}

	return nil, nil
}

func (s *TokenService) RevokeToken(tokenID string) error {
	return s.db.Model(&models.RefreshToken{}).Where("id = ?", tokenID).Update("revoked", true).Error
}

func (s *TokenService) GenerateTokenPair(user *models.User) (*TokenPair, error) {
	accessToken, err := s.GenerateAccessToken(user)
	if err != nil {
		return nil, err
	}

	_, rawRefresh, err := s.GenerateRefreshToken(user.ID)
	if err != nil {
		return nil, err
	}

	return &TokenPair{
		AccessToken:  accessToken,
		RefreshToken: rawRefresh,
	}, nil
}
