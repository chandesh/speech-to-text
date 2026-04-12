# Speech to Text

A production-ready, mobile-first web application that converts speech to text in real-time using the Web Speech API. Built with Angular 21, Tailwind CSS, and designed for future backend integration.

## Features

- Real-time speech-to-text transcription
- Copy, clear, and download transcribed text
- Word count display
- Language selection (20+ languages)
- Dark mode toggle
- Mobile-first responsive design
- PWA support with offline capability
- Pluggable speech provider architecture (browser API ready, backend stub prepared)

## Tech Stack

- **Frontend**: Angular 21 (standalone components)
- **Styling**: Tailwind CSS v4
- **State Management**: Angular Signals
- **Testing**: Vitest with Playwright
- **Containerization**: Docker + Docker Compose
- **PWA**: Angular Service Worker

## Project Structure

```
src/app/
├── components/
│   ├── recorder/          # Microphone recording button with state indicators
│   ├── transcription/     # Live transcription display with interim/final text
│   ├── controls/          # Copy, clear, and download actions
│   └── settings/          # Language selector, dark mode, provider info
├── services/
│   └── speech/
│       ├── speech-provider.interface.ts  # Abstraction layer for speech providers
│       ├── speech.service.ts             # Facade service with signal-based state
│       ├── browser-speech.service.ts     # Web Speech API implementation (Phase 1)
│       └── api-speech.service.ts         # Backend API stub (Phase 2)
├── core/                  # Core utilities and configuration
├── shared/                # Shared directives and utilities
├── app.ts                 # Root component
├── app.config.ts          # Application configuration with PWA setup
└── app.html               # Root template with responsive layout
```

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+
- Docker and Docker Compose (optional, for containerized deployment)
- A modern browser with Web Speech API support (Chrome, Edge, Safari)

### Quick Start (Local Development)

```bash
# Install dependencies
make install

# Start development server
make start

# Run tests
make test

# Build for production
make build
```

### Docker Deployment

```bash
# Build and start production container
make docker-build
make docker-up

# Or build and start in one command
make docker-rebuild

# Start development container with hot-reload
make docker-dev-up

# View logs
make docker-logs

# Stop containers
make docker-down
```

The application will be available at:

- Production: http://localhost:4200
- Development: http://localhost:4201

## Architecture

### Speech Provider Pattern

The application uses a pluggable architecture for speech recognition:

```
SpeechProvider (interface)
├── BrowserSpeechService (current - Web Speech API)
└── ApiSpeechService (stub - ready for Go + Gin backend)
```

The `SpeechService` facade manages state using Angular Signals and delegates speech operations to the active provider. This design allows switching between browser-based and API-based recognition with minimal code changes.

### State Management

All UI state is managed through Angular Signals:

- `finalTextSignal` - Completed transcription text
- `interimTextSignal` - In-progress speech recognition
- `stateSignal` - Recording state (idle, requesting, recording, error, unsupported)
- `errorSignal` - Current error state
- `languageSignal` - Selected language
- `darkModeSignal` - Theme preference

### Responsive Design

Mobile-first layout with Tailwind CSS:

- Sticky controls at bottom for easy thumb access
- Large touch-friendly buttons (minimum 44px touch targets)
- Flexible transcription area with auto-scroll
- Settings panel with dropdown overlay

## Configuration

### Environment Settings

Settings are persisted in localStorage:

- `voice-to-text-lang` - Selected language code (default: en-US)
- `voice-to-text-provider` - Speech provider type (browser/api)
- `voice-to-text-dark-mode` - Dark mode preference

### Supported Languages

English (US/UK), Spanish, French, German, Italian, Portuguese, Japanese, Korean, Chinese, Hindi, Arabic, Russian, Dutch, Swedish, Danish, Norwegian, Finnish, Polish, Turkish

## Testing

```bash
# Run all tests once
make test

# Run tests in watch mode
make test:watch

# Run specific test file
ng test --include=src/app/services/speech/speech.service.spec.ts
```

Test coverage includes:

- SpeechService state management
- BrowserSpeechService observables
- Component creation and injection
- User interaction handlers
- localStorage persistence

## PWA Support

The application includes full PWA configuration:

- Service Worker for offline caching
- Web App Manifest with icons
- Theme color and display mode
- Asset caching strategy

## Future Backend Integration (Phase 2)

The `ApiSpeechService` is prepared for integration with a Go + Gin backend:

```
POST /transcribe
Content-Type: multipart/form-data

audio: audio/webm file
```

Response:

```json
{
  "transcript": "Transcribed text here"
}
```

To switch to API mode:

1. Set `voice-to-text-provider` to `api` in localStorage
2. Configure `voice-to-text-api-url` with backend URL
3. The app will stream audio chunks to the backend endpoint

## Makefile Commands

| Command               | Description                         |
| --------------------- | ----------------------------------- |
| `make install`        | Install npm dependencies            |
| `make start`          | Start Angular dev server            |
| `make test`           | Run unit tests                      |
| `make test:watch`     | Run tests in watch mode             |
| `make build`          | Production build                    |
| `make clean`          | Remove build artifacts              |
| `make docker-build`   | Build Docker image                  |
| `make docker-up`      | Start production container          |
| `make docker-dev-up`  | Start dev container with hot-reload |
| `make docker-down`    | Stop containers                     |
| `make docker-rebuild` | Rebuild and restart                 |
| `make docker-logs`    | View container logs                 |
| `make docker-clean`   | Remove all Docker resources         |

## Browser Support

- Chrome 25+ (recommended)
- Edge 79+
- Safari 14.1+
- Firefox (limited Web Speech API support)

## License

MIT
