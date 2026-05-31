package services

import (
	"errors"

	"github.com/chandesh/speech-to-text/backend/apps/auth/models"
	"gorm.io/gorm"
)

type AuthService struct {
	db              *gorm.DB
	passwordService *PasswordService
	tokenService    *TokenService
}

func NewAuthService(db *gorm.DB, passwordService *PasswordService, tokenService *TokenService) *AuthService {
	return &AuthService{
		db:              db,
		passwordService: passwordService,
		tokenService:    tokenService,
	}
}

type RegisterInput struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
	FullName string `json:"full_name" binding:"required"`
}

type LoginInput struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type AuthResponse struct {
	User         *models.User `json:"user"`
	AccessToken  string       `json:"access_token"`
	RefreshToken string       `json:"refresh_token"`
}

func (s *AuthService) Register(input *RegisterInput) (*AuthResponse, error) {
	var existing models.User
	if err := s.db.Where("email = ?", input.Email).First(&existing).Error; err != nil {
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, err
		}
	} else {
		return nil, errors.New("email already registered")
	}

	hash, err := s.passwordService.Hash(input.Password)
	if err != nil {
		return nil, err
	}

	user := &models.User{
		Email:        input.Email,
		PasswordHash: hash,
		FullName:     input.FullName,
	}

	if err := s.db.Create(user).Error; err != nil {
		return nil, err
	}

	pair, err := s.tokenService.GenerateTokenPair(user)
	if err != nil {
		return nil, err
	}

	return &AuthResponse{
		User:         user,
		AccessToken:  pair.AccessToken,
		RefreshToken: pair.RefreshToken,
	}, nil
}

func (s *AuthService) Login(input *LoginInput) (*AuthResponse, error) {
	var user models.User
	if err := s.db.Where("email = ?", input.Email).First(&user).Error; err != nil {
		return nil, errors.New("invalid email or password")
	}

	if !s.passwordService.Compare(user.PasswordHash, input.Password) {
		return nil, errors.New("invalid email or password")
	}

	pair, err := s.tokenService.GenerateTokenPair(&user)
	if err != nil {
		return nil, err
	}

	return &AuthResponse{
		User:         &user,
		AccessToken:  pair.AccessToken,
		RefreshToken: pair.RefreshToken,
	}, nil
}

func (s *AuthService) Refresh(rawRefreshToken string) (*TokenPair, error) {
	refreshToken, err := s.tokenService.ValidateRefreshToken(rawRefreshToken)
	if err != nil {
		return nil, err
	}
	if refreshToken == nil {
		return nil, errors.New("invalid or expired refresh token")
	}

	if err := s.tokenService.RevokeToken(refreshToken.ID); err != nil {
		return nil, err
	}

	var user models.User
	if err := s.db.First(&user, "id = ?", refreshToken.UserID).Error; err != nil {
		return nil, errors.New("user not found")
	}

	pair, err := s.tokenService.GenerateTokenPair(&user)
	if err != nil {
		return nil, err
	}

	return pair, nil
}

func (s *AuthService) Logout(rawRefreshToken string) error {
	refreshToken, err := s.tokenService.ValidateRefreshToken(rawRefreshToken)
	if err != nil {
		return err
	}
	if refreshToken == nil {
		return errors.New("invalid refresh token")
	}

	return s.tokenService.RevokeToken(refreshToken.ID)
}
