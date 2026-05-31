# Auth Backend Design

## Overview

Go + Gin backend providing JWT-based authentication for a multi-app speech-to-text platform. Uses PostgreSQL for persistence with GORM ORM.

## Architecture

```
backend/
├── main.go                  # Entry point, Gin engine, CORS, route registration
├── go.mod / go.sum
├── config/
│   └── config.go            # Env vars: DATABASE_URL, JWT_SECRET, PORT
├── core/
│   ├── middleware/
│   │   ├── cors.go          # CORS config for Angular frontend
│   │   ├── auth.go          # JWT extraction + user context injection
│   │   └── logger.go        # Request logging
│   ├── database/
│   │   └── database.go      # GORM connection init + auto-migrate
│   └── config/
│       └── env.go           # Env var loading helpers
└── apps/
    ├── auth/
    │   ├── models/
    │   │   ├── user.go          # GORM model: id, email, password_hash, full_name, timestamps
    │   │   └── refresh_token.go # GORM model: id, user_id, token_hash, expires_at, revoked
    │   ├── handlers/
    │   │   ├── register.go    # POST /api/auth/register
    │   │   ├── login.go       # POST /api/auth/login
    │   │   ├── refresh.go     # POST /api/auth/refresh
    │   │   ├── logout.go      # POST /api/auth/logout
    │   │   └── me.go          # GET /api/auth/me (protected)
    │   ├── services/
    │   │   ├── auth_service.go    # Register/login business logic
    │   │   ├── token_service.go   # JWT create/validate, refresh rotation
    │   │   └── password_service.go# bcrypt hash/compare
    │   └── routes.go          # Register auth routes on router group
    ├── transcription/        # Future
    └── analytics/            # Future
```

## Data Model

### users
| Column        | Type         | Constraints         |
|---------------|-------------|---------------------|
| id            | UUID (PK)   | auto-generate       |
| email         | VARCHAR(255)| UNIQUE, NOT NULL    |
| password_hash | VARCHAR(255)| NOT NULL            |
| full_name     | VARCHAR(255)| NOT NULL            |
| created_at    | TIMESTAMP   | auto-set            |
| updated_at    | TIMESTAMP   | auto-update         |

### refresh_tokens
| Column      | Type         | Constraints                  |
|-------------|-------------|------------------------------|
| id          | UUID (PK)   | auto-generate                |
| user_id     | UUID (FK)   | NOT NULL, CASCADE DELETE     |
| token_hash  | VARCHAR(255)| NOT NULL (bcrypt of raw token)|
| expires_at  | TIMESTAMP   | NOT NULL                     |
| revoked     | BOOLEAN     | DEFAULT FALSE                |
| created_at  | TIMESTAMP   | auto-set                     |

## API Contract

### POST /api/auth/register
```
Request:  { "email": "...", "password": "...", "full_name": "..." }
Response: 201 { "user": { "id", "email", "full_name" }, "access_token", "refresh_token" }
Errors:   409 email exists, 400 validation
```

### POST /api/auth/login
```
Request:  { "email": "...", "password": "..." }
Response: 200 { "user": { "id", "email", "full_name" }, "access_token", "refresh_token" }
Errors:   401 invalid credentials
```

### POST /api/auth/refresh
```
Request:  { "refresh_token": "..." }
Response: 200 { "access_token", "refresh_token" }
Errors:   401 invalid/revoked/expired token
```

### POST /api/auth/logout
```
Headers:  Authorization: Bearer <access_token>
Request:  { "refresh_token": "..." }
Response: 200 OK
```

### GET /api/auth/me
```
Headers:  Authorization: Bearer <access_token>
Response: 200 { "id", "email", "full_name" }
Errors:   401 unauthorized
```

## Token Strategy

- **Access token**: JWT signed with HS256, 15min expiry, contains `user_id`, `email`
- **Refresh token**: Random 256-bit value, stored as bcrypt hash in DB, 7d expiry
- **Rotation**: Each refresh invalidates the old refresh token (set revoked=true) and issues a new one
- **Logout**: Revokes the specific refresh token client sends (for this device/session only)

## Security

- Passwords hashed with bcrypt (cost 12)
- Refresh tokens stored as bcrypt hash (never raw)
- CORS restricted to frontend origin
- Request logging middleware
- Validation of all inputs

## Frontend Changes

1. Fix `RouterModule` missing from `LoginComponent` and `RegisterComponent` imports
2. Update `AuthService` to call real API endpoints with `fetch`
3. Store `access_token` and `refresh_token` in localStorage
4. Attach `Authorization: Bearer` header to authenticated requests
5. Handle token expiry (401) by attempting refresh, then redirecting to login

## Future-Proofing

- New apps add a self-contained package under `apps/`
- Each app exports a `RegisterRoutes(router, deps...)` function
- `main.go` only imports and calls route registrations
- No circular dependencies between apps allowed
