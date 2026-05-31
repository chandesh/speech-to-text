# Speech to Text

A mobile-first web application for real-time speech-to-text transcription using the Web Speech API. Includes JWT-based user authentication, profile management, and a Go + PostgreSQL backend.

## Features

- Real-time speech-to-text transcription with interim results
- Copy, clear, and download transcribed text
- Word count display
- Language selection (20+ languages)
- Theme system (gruvbox, glassmorphic, oceanic — each with light/dark mode)
- User registration and JWT-based login
- Profile management (name, email) and password change
- App settings page with theme and language controls
- Smart landing page — redirects authenticated users to transcriber
- Sticky footer on all pages
- Mobile-first responsive design
- PWA support with offline capability
- Pluggable speech provider architecture

## Tech Stack

- **Frontend**: Angular 21 (standalone components)
- **Styling**: Tailwind CSS v4 via CDN, CSS custom properties
- **State Management**: Angular Signals
- **Backend**: Go, Gin, GORM, JWT, bcrypt
- **Database**: PostgreSQL 16
- **Testing**: Vitest with Playwright
- **Containerization**: Docker + Docker Compose
- **PWA**: Angular Service Worker

## Project Structure

```
├── backend/
│   ├── apps/auth/         # Register, login, refresh, logout
│   ├── apps/user/         # Profile get/update, change password
│   ├── core/config/       # Environment configuration
│   ├── core/database/     # GORM connection
│   ├── core/middleware/   # JWT auth, CORS, logger
│   └── main.go            # Route registration, server entry
├── src/app/
│   ├── components/
│   │   ├── navbar/        # Nav bar with auth-aware dropdown
│   │   ├── recorder/      # Microphone button with state indicators
│   │   ├── transcription/ # Live display with interim/final text
│   │   ├── controls/      # Copy, clear, download actions
│   │   └── footer/        # Sticky footer on all pages
│   ├── pages/
│   │   ├── home/          # Landing page, redirects if authenticated
│   │   ├── login/         # Login form
│   │   ├── register/      # Registration form
│   │   ├── settings/      # Settings shell with tab navigation
│   │   │   ├── profile/           # Edit name/email
│   │   │   ├── change-password/   # Password change form
│   │   │   └── app-settings/      # Theme and language controls
│   │   └── transcriber/   # Main transcription page
│   ├── services/
│   │   ├── auth/          # JWT auth, profile CRUD, token storage
│   │   └── speech/        # Speech provider interface + implementations
│   ├── app.ts             # Root with theme init, footer shell
│   ├── app.routes.ts      # Route definitions with AuthGuard
│   └── styles.scss        # Theme CSS variables and Tailwind layers
├── docker-compose.yml
├── Makefile
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 20+, npm 10+
- Go 1.26+ (for backend development)
- Docker and Docker Compose
- A modern browser with Web Speech API support (Chrome, Edge, Safari)

### Full Stack

```bash
make stack-up
```

Frontend at http://localhost:4200, backend at http://localhost:1212.

### Frontend Only

```bash
make install
make dev
```

### Backend Only

```bash
make db-start
make backend-rebuild
```

## Architecture

### Auth Flow

```
Register/Login → JWT tokens → localStorage (s2t_access_token, s2t_refresh_token, s2t_user)
API calls      → Authorization: Bearer header
AuthGuard      → Checks token expiry, redirects to /login
```

### Speech Provider Pattern

Pluggable architecture via `SpeechProvider` interface. Switch by setting `voice-to-text-provider` in localStorage to `browser` or `api`.

### Theme System

CSS custom properties on `<html>` with `theme-{family}-{mode}` class. Three families (gruvbox, glassmorphic, oceanic) × 2 modes (light, dark). Persisted to localStorage.

### State Management

Angular Signals:

- `finalTextSignal` / `interimTextSignal` — Transcription state
- `stateSignal` — Recording state (idle, requesting, recording, error, unsupported)
- `currentUser` — Authenticated user
- `themeSignal` / `modeSignal` — Theme preferences

## Configuration

Settings persisted in localStorage:

| Key                      | Description                    |
| ------------------------ | ------------------------------ |
| `voice-to-text-lang`     | Language code (default: en-US) |
| `voice-to-text-provider` | Speech provider (browser/api)  |
| `s2t_access_token`       | JWT access token               |
| `s2t_refresh_token`      | JWT refresh token              |
| `s2t_user`               | Cached user profile            |
| `s2t_theme`              | Theme family                   |
| `s2t_theme_mode`         | Theme mode (light/dark)        |

### Supported Languages

English (US/UK), Spanish, French, German, Italian, Portuguese, Japanese, Korean, Chinese, Hindi, Arabic, Russian, Dutch, Swedish, Danish, Norwegian, Finnish, Polish, Turkish

## Testing

```bash
make test
make test-watch
ng test --include=src/app/services/speech/speech.service.spec.ts
```

## Browser Support

- Chrome 25+ (recommended)
- Edge 79+
- Safari 14.1+
- Firefox (limited Web Speech API support)

## License

MIT
