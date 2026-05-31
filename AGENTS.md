# AGENTS.md

## Key Commands

### Development

```bash
make install     # Install all npm dependencies
make dev         # Start Angular dev server (localhost:4200)
make test        # Run unit tests once
make test-watch  # Run unit tests in watch mode
make build       # Build for production
```

### Docker

```bash
make start       # Start production container (port 4200)
make devstart    # Start dev container with hot-reload (port 4201)
make stop        # Stop all running containers
make rebuild     # Rebuild and restart production container
```

## Architecture

### Speech Provider Pattern

Pluggable architecture with interface-driven design:

- `SpeechProvider` interface defines the contract
- `BrowserSpeechService` implements Web Speech API (current)
- `ApiSpeechService` is a stub for future backend API integration

Switch between providers by setting `voice-to-text-provider` in localStorage to `browser` or `api`.

### State Management

Uses Angular Signals for all state:

- `finalTextSignal` - Completed transcription text
- `interimTextSignal` - In-progress speech recognition
- `stateSignal` - Recording state (idle, requesting, recording, error, unsupported)

### Project Structure

```
src/app/
├── components/
│   ├── recorder/      # Microphone UI with state indicators
│   ├── transcription/ # Live display with interim/final text
│   ├── controls/      # Copy, clear, download actions
│   └── settings/      # Language/theme selectors
├── services/speech/   # Speech recognition implementations
└── app.ts             # Root component
```

## Testing

Tests use Vitest with Playwright:

```bash
# Run specific test
ng test --include=src/app/services/speech/speech.service.spec.ts
```

Test coverage areas:

- SpeechService state transitions
- BrowserSpeechService event handling
- Component interactions
- localStorage persistence

## Key Constraints

1. Requires modern browser with Web Speech API
2. Mobile-first design with touch-friendly controls
3. PWA-ready with offline capability
4. Uses Tailwind CSS v4 for styling
5. Angular standalone components (no NgModules)

## Common Workflows

### Adding a New Language

1. Update language selection component
2. Add to supported languages list
3. Verify Web Speech API support

### Adding a New Theme

1. Create Tailwind theme configuration
2. Update settings component
3. Add localStorage persistence

### Extending API Provider

1. Implement SpeechProvider interface in ApiSpeechService
2. Add backend endpoints
3. Handle streaming responses
