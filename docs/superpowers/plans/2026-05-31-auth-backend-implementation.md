# Auth Backend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) for syntax tracking.

**Goal:** Build a Go + Gin JWT auth backend with PostgreSQL (Docker) and wire it to the Angular frontend.

**Architecture:** Modular monolith with `apps/` directory per domain. Auth lives under `backend/apps/auth/`. Shared infrastructure (middleware, database, config) in `backend/core/`. PostgreSQL runs in Docker alongside the backend.

**Tech Stack:** Go, Gin, GORM, golang-jwt/v5, bcrypt, PostgreSQL (Docker), Docker Compose

---

### File Structure

```
backend/
├── main.go
├── go.mod / go.sum
├── Dockerfile
├── .env.example
├── config/
│   └── config.go            # Env vars: DATABASE_URL, JWT_SECRET, PORT
├── core/
│   ├── config/
│   │   └── env.go           # Helper to load env vars with defaults
│   ├── database/
│   │   └── database.go      # GORM connection + auto-migrate
│   └── middleware/
│       ├── cors.go          # CORS middleware
│       ├── auth.go          # JWT auth middleware
│       └── logger.go        # Request logging
└── apps/
    └── auth/
        ├── models/
        │   ├── user.go
        │   └── refresh_token.go
        ├── services/
        │   ├── password_service.go
        │   ├── token_service.go
        │   └── auth_service.go
        ├── handlers/
        │   ├── register.go
        │   ├── login.go
        │   ├── refresh.go
        │   ├── logout.go
        │   └── me.go
        └── routes.go

docker-compose.yml            # Add postgres + backend services
src/app/services/auth/auth.service.ts  # Modify: real API calls
src/app/pages/login/login.component.ts # Modify: add RouterModule
src/app/pages/register/register.component.ts # Modify: add RouterModule
```

---

### Task 1: Docker PostgreSQL + Backend Compose Setup

**Files:**
- Modify: `docker-compose.yml`
- Create: `backend/.env.example`

- [ ] **Step 1: Add postgres service and backend service to docker-compose.yml**

```yaml
services:
  postgres:
    image: postgres:16-alpine
    container_name: speech-to-text-db
    environment:
      POSTGRES_USER: s2t
      POSTGRES_PASSWORD: s2t_pass
      POSTGRES_DB: speech_to_text
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U s2t -d speech_to_text"]
      interval: 5s
      timeout: 3s
      retries: 5
    networks:
      - speech-to-text-net

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: speech-to-text-api
    ports:
      - "8080:8080"
    environment:
      DATABASE_URL: postgres://s2t:s2t_pass@postgres:5432/speech_to_text?sslmode=disable
      JWT_SECRET: dev-secret-change-in-production
      PORT: "8080"
      ALLOWED_ORIGINS: http://localhost:4200
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - speech-to-text-net

  speech-to-text:
    # existing frontend service, unchanged
    ...

networks:
  speech-to-text-net:
    name: speech-to-text-net
    driver: bridge

volumes:
  pgdata:
```

- [ ] **Step 2: Create backend/.env.example**

```
DATABASE_URL=postgres://s2t:s2t_pass@localhost:5432/speech_to_text?sslmode=disable
JWT_SECRET=change-this-to-a-random-secret
PORT=8080
ALLOWED_ORIGINS=http://localhost:4200
```

- [ ] **Step 3: Commit**

```bash
git add docker-compose.yml backend/.env.example
git commit -m "feat: add postgres and backend services to docker-compose"
```

---

### Task 2: Go Project Scaffolding

**Files:**
- Create: `backend/go.mod`
- Create: `backend/main.go` (stub)
- Create: `backend/config/config.go`

- [ ] **Step 1: Create backend directory and subdirectories**

Run:
```bash
mkdir -p backend/{core/{config,database,middleware},apps/auth/{models,services,handlers}}
```

- [ ] **Step 2: Initialize Go module**

Run:
```bash
cd backend && go mod init github.com/chandesh/speech-to-text/backend
```

- [ ] **Step 3: Create config/config.go**

```go
package config

import "os"

type Config struct {
	DatabaseURL    string
	JWTSecret      string
	Port           string
	AllowedOrigins string
}

func Load() *Config {
	return &Config{
		DatabaseURL:    getEnv("DATABASE_URL", "postgres://s2t:s2t_pass@localhost:5432/speech_to_text?sslmode=disable"),
		JWTSecret:      getEnv("JWT_SECRET", "dev-secret-change-in-production"),
		Port:           getEnv("PORT", "8080"),
		AllowedOrigins: getEnv("ALLOWED_ORIGINS", "http://localhost:4200"),
	}
}

func getEnv(key, fallback string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return fallback
}
```

- [ ] **Step 4: Create backend/main.go (stub)**

```go
package main

import (
	"log"

	"github.com/chandesh/speech-to-text/backend/config"
)

func main() {
	cfg := config.Load()
	log.Printf("Starting server on port %s", cfg.Port)
}
```

- [ ] **Step 5: Install initial dependencies and verify it compiles**

Run:
```bash
cd backend && go mod tidy && go build -o /dev/null ./...
```

- [ ] **Step 6: Commit**

```bash
git add backend/
git commit -m "feat: scaffold Go project structure"
```

---

### Task 3: Core Packages — Database, Config, Middleware

**Files:**
- Create: `backend/core/config/env.go`
- Create: `backend/core/database/database.go`
- Create: `backend/core/middleware/cors.go`
- Create: `backend/core/middleware/logger.go`
- Create: `backend/core/middleware/auth.go`

- [ ] **Step 1: Create core/config/env.go**

```go
package config

import "os"

func GetEnv(key, fallback string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return fallback
}
```

- [ ] **Step 2: Install GORM and PostgreSQL driver**

Run:
```bash
cd backend && go get gorm.io/gorm gorm.io/driver/postgres
```

- [ ] **Step 3: Create core/database/database.go**

```go
package database

import (
	"log"
	"time"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func Connect(dsn string) *gorm.DB {
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	sqlDB, err := db.DB()
	if err != nil {
		log.Fatalf("Failed to get underlying DB: %v", err)
	}

	sqlDB.SetMaxOpenConns(25)
	sqlDB.SetMaxIdleConns(5)
	sqlDB.SetConnMaxLifetime(5 * time.Minute)

	return db
}
```

- [ ] **Step 4: Create core/middleware/cors.go**

```go
package middleware

import (
	"github.com/gin-gonic/gin"
	"strings"
)

func CORS(allowedOrigins string) gin.HandlerFunc {
	origins := strings.Split(allowedOrigins, ",")

	return func(c *gin.Context) {
		origin := c.Request.Header.Get("Origin")
		for _, o := range origins {
			if o == origin || o == "*" {
				c.Header("Access-Control-Allow-Origin", origin)
				break
			}
		}

		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization")
		c.Header("Access-Control-Allow-Credentials", "true")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}
```

- [ ] **Step 5: Create core/middleware/logger.go**

```go
package middleware

import (
	"log"
	"time"

	"github.com/gin-gonic/gin"
)

func Logger() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		path := c.Request.URL.Path

		c.Next()

		latency := time.Since(start)
		status := c.Writer.Status()
		method := c.Request.Method

		log.Printf("[%d] %s %s %v", status, method, path, latency)
	}
}
```

- [ ] **Step 6: Create core/middleware/auth.go**

```go
package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

type Claims struct {
	UserID string `json:"user_id"`
	Email  string `json:"email"`
	jwt.RegisteredClaims
}

func AuthRequired(jwtSecret string) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "missing authorization header"})
			return
		}

		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid authorization format"})
			return
		}

		tokenStr := parts[1]
		claims := &Claims{}

		token, err := jwt.ParseWithClaims(tokenStr, claims, func(t *jwt.Token) (interface{}, error) {
			return []byte(jwtSecret), nil
		})

		if err != nil || !token.Valid {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid or expired token"})
			return
		}

		c.Set("user_id", claims.UserID)
		c.Set("email", claims.Email)
		c.Next()
	}
}
```

- [ ] **Step 7: Install gin and golang-jwt**

Run:
```bash
cd backend && go get github.com/gin-gonic/gin github.com/golang-jwt/jwt/v5
```

- [ ] **Step 8: Commit**

```bash
git add backend/core/ backend/config/
git commit -m "feat: add core packages - database, config, middleware"
```

---

### Task 4: Auth Models

**Files:**
- Create: `backend/apps/auth/models/user.go`
- Create: `backend/apps/auth/models/refresh_token.go`

- [ ] **Step 1: Create apps/auth/models/user.go**

```go
package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type User struct {
	ID           string    `gorm:"type:uuid;primaryKey" json:"id"`
	Email        string    `gorm:"uniqueIndex;not null" json:"email"`
	PasswordHash string    `gorm:"not null" json:"-"`
	FullName     string    `gorm:"not null" json:"full_name"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

func (u *User) BeforeCreate(tx *gorm.DB) error {
	u.ID = uuid.New().String()
	return nil
}
```

- [ ] **Step 2: Create apps/auth/models/refresh_token.go**

```go
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
```

- [ ] **Step 3: Install uuid dependency**

Run:
```bash
cd backend && go get github.com/google/uuid
```

- [ ] **Step 4: Add auto-migrate call in database.go**

Edit `backend/core/database/database.go` to accept models and auto-migrate:

```go
package database

import (
	"log"
	"time"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func Connect(dsn string, models ...interface{}) *gorm.DB {
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	if err := db.AutoMigrate(models...); err != nil {
		log.Fatalf("Failed to auto-migrate: %v", err)
	}

	sqlDB, err := db.DB()
	if err != nil {
		log.Fatalf("Failed to get underlying DB: %v", err)
	}

	sqlDB.SetMaxOpenConns(25)
	sqlDB.SetMaxIdleConns(5)
	sqlDB.SetConnMaxLifetime(5 * time.Minute)

	return db
}
```

- [ ] **Step 5: Commit**

```bash
git add backend/apps/auth/models/ backend/core/database/database.go
git commit -m "feat: add auth models with GORM auto-migrate"
```

---

### Task 5: Auth Services

**Files:**
- Create: `backend/apps/auth/services/password_service.go`
- Create: `backend/apps/auth/services/token_service.go`
- Create: `backend/apps/auth/services/auth_service.go`

- [ ] **Step 1: Create password_service.go**

```go
package services

import "golang.org/x/crypto/bcrypt"

type PasswordService struct{}

func NewPasswordService() *PasswordService {
	return &PasswordService{}
}

func (s *PasswordService) Hash(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(bytes), err
}

func (s *PasswordService) Compare(hash, password string) bool {
	return bcrypt.CompareHashAndPassword([]byte(hash), []byte(password)) == nil
}
```

- [ ] **Step 2: Create token_service.go**

```go
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
```

- [ ] **Step 3: Create auth_service.go**

```go
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
	if err := s.db.Where("email = ?", input.Email).First(&existing).Error; err == nil {
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
```

- [ ] **Step 4: Install bcrypt dependency**

Run:
```bash
cd backend && go get golang.org/x/crypto
```

- [ ] **Step 5: Verify compilation**

Run:
```bash
cd backend && go build -o /dev/null ./...
```

- [ ] **Step 6: Commit**

```bash
git add backend/apps/auth/services/
git commit -m "feat: add auth services - password, token, auth"
```

---

### Task 6: Auth Handlers

**Files:**
- Create: `backend/apps/auth/handlers/register.go`
- Create: `backend/apps/auth/handlers/login.go`
- Create: `backend/apps/auth/handlers/refresh.go`
- Create: `backend/apps/auth/handlers/logout.go`
- Create: `backend/apps/auth/handlers/me.go`

- [ ] **Step 1: Create register.go**

```go
package handlers

import (
	"net/http"

	"github.com/chandesh/speech-to-text/backend/apps/auth/services"
	"github.com/gin-gonic/gin"
)

type RegisterHandler struct {
	authService *services.AuthService
}

func NewRegisterHandler(authService *services.AuthService) *RegisterHandler {
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
		if err.Error() == "email already registered" {
			c.JSON(http.StatusConflict, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, resp)
}
```

- [ ] **Step 2: Create login.go**

```go
package handlers

import (
	"net/http"

	"github.com/chandesh/speech-to-text/backend/apps/auth/services"
	"github.com/gin-gonic/gin"
)

type LoginHandler struct {
	authService *services.AuthService
}

func NewLoginHandler(authService *services.AuthService) *LoginHandler {
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
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, resp)
}
```

- [ ] **Step 3: Create refresh.go**

```go
package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type RefreshHandler struct {
	authService interface {
		Refresh(rawRefreshToken string) (interface{}, error)
	}
}

func NewRefreshHandler(authService interface {
	Refresh(rawRefreshToken string) (interface{}, error)
}) *RefreshHandler {
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
```

- [ ] **Step 4: Create logout.go**

```go
package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type LogoutHandler struct {
	authService interface {
		Logout(rawRefreshToken string) error
	}
}

func NewLogoutHandler(authService interface {
	Logout(rawRefreshToken string) error
}) *LogoutHandler {
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
```

- [ ] **Step 5: Create me.go**

```go
package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type MeHandler struct {
	db *gorm.DB
}

func NewMeHandler(db *gorm.DB) *MeHandler {
	return &MeHandler{db: db}
}

func (h *MeHandler) Handle(c *gin.Context) {
	userID, _ := c.Get("user_id")

	var user struct {
		ID       string `json:"id"`
		Email    string `json:"email"`
		FullName string `json:"full_name"`
	}

	if err := h.db.Model(&struct{}{}).Table("users").
		Select("id, email, full_name").
		Where("id = ?", userID).
		Scan(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}

	c.JSON(http.StatusOK, user)
}
```

- [ ] **Step 6: Commit**

```bash
git add backend/apps/auth/handlers/
git commit -m "feat: add auth handlers - register, login, refresh, logout, me"
```

---

### Task 7: Auth Routes + main.go Wiring

**Files:**
- Create: `backend/apps/auth/routes.go`
- Modify: `backend/main.go`

- [ ] **Step 1: Create routes.go**

```go
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
```

- [ ] **Step 2: Replace backend/main.go**

```go
package main

import (
	"log"

	"github.com/chandesh/speech-to-text/backend/apps/auth"
	"github.com/chandesh/speech-to-text/backend/apps/auth/models"
	"github.com/chandesh/speech-to-text/backend/config"
	"github.com/chandesh/speech-to-text/backend/core/database"
	"github.com/chandesh/speech-to-text/backend/core/middleware"
	"github.com/gin-gonic/gin"
)

func main() {
	cfg := config.Load()

	db := database.Connect(cfg.DatabaseURL, &models.User{}, &models.RefreshToken{})

	r := gin.Default()
	r.Use(middleware.CORS(cfg.AllowedOrigins))
	r.Use(middleware.Logger())

	api := r.Group("/api")

	api.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	auth.RegisterRoutes(api, db, cfg.JWTSecret)

	log.Printf("Server starting on :%s", cfg.Port)
	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
```

- [ ] **Step 3: Verify compilation**

Run:
```bash
cd backend && go mod tidy && go build -o /dev/null ./...
```

- [ ] **Step 4: Commit**

```bash
git add backend/apps/auth/routes.go backend/main.go
git commit -m "feat: wire auth routes and main.go entry point"
```

---

### Task 8: Backend Dockerfile

**Files:**
- Create: `backend/Dockerfile`

- [ ] **Step 1: Create backend/Dockerfile**

```dockerfile
FROM golang:1.23-alpine AS build

WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /server .

FROM alpine:3.19
RUN apk --no-cache add ca-certificates
COPY --from=build /server /server
EXPOSE 8080
CMD ["/server"]
```

- [ ] **Step 2: Ensure .dockerignore exists**

Create `backend/.dockerignore`:
```
.env
.git
```

- [ ] **Step 3: Commit**

```bash
git add backend/Dockerfile backend/.dockerignore
git commit -m "feat: add backend Dockerfile"
```

---

### Task 9: Frontend Fixes — RouterModule + AuthService Wiring

**Files:**
- Modify: `src/app/pages/login/login.component.ts`
- Modify: `src/app/pages/register/register.component.ts`
- Modify: `src/app/services/auth/auth.service.ts`

- [ ] **Step 1: Fix LoginComponent — add RouterModule import**

In `src/app/pages/login/login.component.ts`, add `RouterModule` to imports:

Change:
```typescript
imports: [CommonModule, ReactiveFormsModule],
```
To:
```typescript
imports: [CommonModule, ReactiveFormsModule, RouterModule],
```

- [ ] **Step 2: Fix RegisterComponent — add RouterModule import**

In `src/app/pages/register/register.component.ts`, add `RouterModule` to imports:

Change:
```typescript
imports: [CommonModule, ReactiveFormsModule],
```
To:
```typescript
imports: [CommonModule, ReactiveFormsModule, RouterModule],
```

- [ ] **Step 3: Rewrite auth.service.ts with real API calls**

Replace `src/app/services/auth/auth.service.ts`:

```typescript
import { Injectable, signal, computed } from '@angular/core';

export interface User {
  id: string;
  email: string;
  full_name: string;
}

export interface AuthResponse {
  user: User;
  access_token: string;
  refresh_token: string;
}

export interface TokenPair {
  access_token: string;
  refresh_token: string;
}

const STORAGE_KEYS = {
  accessToken: 's2t_access_token',
  refreshToken: 's2t_refresh_token',
  user: 's2t_user',
};

const API_BASE = 'http://localhost:8080/api';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private _currentUser = signal<User | null>(this.loadFromStorage());
  private _isLoading = signal<boolean>(false);

  currentUser = computed(() => this._currentUser());
  isAuthenticated = computed(() => !!this._currentUser());
  isLoading = computed(() => this._isLoading());

  private loadFromStorage(): User | null {
    const stored = localStorage.getItem(STORAGE_KEYS.user);
    return stored ? JSON.parse(stored) : null;
  }

  getAccessToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.accessToken);
  }

  private persistAuth(resp: AuthResponse): void {
    localStorage.setItem(STORAGE_KEYS.accessToken, resp.access_token);
    localStorage.setItem(STORAGE_KEYS.refreshToken, resp.refresh_token);
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(resp.user));
    this._currentUser.set(resp.user);
  }

  private clearAuth(): void {
    localStorage.removeItem(STORAGE_KEYS.accessToken);
    localStorage.removeItem(STORAGE_KEYS.refreshToken);
    localStorage.removeItem(STORAGE_KEYS.user);
    this._currentUser.set(null);
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    this._isLoading.set(true);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Login failed');
      }
      const data: AuthResponse = await res.json();
      this.persistAuth(data);
      return data;
    } finally {
      this._isLoading.set(false);
    }
  }

  async register(userData: { email: string; password: string; full_name: string }): Promise<AuthResponse> {
    this._isLoading.set(true);
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Registration failed');
      }
      const data: AuthResponse = await res.json();
      this.persistAuth(data);
      return data;
    } finally {
      this._isLoading.set(false);
    }
  }

  async refreshToken(): Promise<string | null> {
    const refreshToken = localStorage.getItem(STORAGE_KEYS.refreshToken);
    if (!refreshToken) return null;

    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
      if (!res.ok) {
        this.clearAuth();
        return null;
      }
      const data: TokenPair = await res.json();
      localStorage.setItem(STORAGE_KEYS.accessToken, data.access_token);
      localStorage.setItem(STORAGE_KEYS.refreshToken, data.refresh_token);
      return data.access_token;
    } catch {
      this.clearAuth();
      return null;
    }
  }

  async logout(): Promise<void> {
    const refreshToken = localStorage.getItem(STORAGE_KEYS.refreshToken);
    if (refreshToken) {
      try {
        await fetch(`${API_BASE}/auth/logout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });
      } catch {
        // Logout best-effort, clear locally regardless
      }
    }
    this.clearAuth();
  }
}
```

- [ ] **Step 4: Fix RegisterComponent import for updated AuthService**

In `src/app/pages/register/register.component.ts`, the import `import { AuthService } from '../../services/auth/auth.service';` stays the same but the `register` call now expects an object — it already passes `this.regForm.value` which has `fullName` (camelCase). Update the component to map to `full_name`:

Change in `register.component.ts`:
```typescript
async onSubmit() {
    if (this.regForm.invalid) return;
    await this.authService.register(this.regForm.value);
    this.router.navigate(['/transcriber']);
  }
```
To:
```typescript
async onSubmit() {
    if (this.regForm.invalid) return;
    const { fullName, email, password } = this.regForm.value;
    await this.authService.register({ email, password, full_name: fullName });
    this.router.navigate(['/transcriber']);
  }
```

Also update the `AuthService` import in register.component.ts — it previously imported `{ AuthService }`, which stays the same.

- [ ] **Step 5: Verify frontend builds**

Run:
```bash
npm run build 2>&1 | head -30
```
Expected: Build succeeds with no errors.

- [ ] **Step 6: Commit**

```bash
git add src/app/services/auth/auth.service.ts src/app/pages/login/login.component.ts src/app/pages/register/register.component.ts
git commit -m "fix: wire frontend auth to backend API and fix RouterModule bug"
```

---

### Task 10: Integration Test

**Files:**
- No new files — run existing Docker Compose

- [ ] **Step 1: Start all services**

Run:
```bash
docker compose up -d --build
```

- [ ] **Step 2: Verify backend starts**

Run:
```bash
docker compose logs backend
```
Expected: "Server starting on :8080"

- [ ] **Step 3: Test health endpoint**

Run:
```bash
curl -s http://localhost:8080/api/health
```
Expected: `{"status":"ok"}` or similar (health endpoint not yet defined — add if desired)

- [ ] **Step 4: Test register**

```bash
curl -s -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","full_name":"Test User"}'
```
Expected: 201 with user + tokens

- [ ] **Step 5: Test login**

```bash
curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```
Expected: 200 with user + tokens

- [ ] **Step 6: Test /me with access token**

```bash
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
curl -s http://localhost:8080/api/auth/me -H "Authorization: Bearer $TOKEN"
```
Expected: 200 with user object

- [ ] **Step 7: Test refresh**

```bash
REFRESH=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' | grep -o '"refresh_token":"[^"]*"' | cut -d'"' -f4)
curl -s -X POST http://localhost:8080/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d "{\"refresh_token\":\"$REFRESH\"}"
```
Expected: 200 with new token pair
