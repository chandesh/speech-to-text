# Profile, Settings, Theme, Landing & Footer Refinements

## Task 1 — User Profile & Settings

**Backend** — 3 new protected endpoints in `backend/apps/user/handlers/`:

- `GET /api/user/profile` — returns authenticated user (id, email, full_name, created_at) from DB
- `PUT /api/user/profile` — validates + updates name/email, returns updated profile
- `POST /api/user/change-password` — validates current password (bcrypt), checks new passwords match (min 8), hashes + saves

Patterns: Gin router, `middleware.AuthRequired` JWT guard, GORM queries, `gin.H{}` JSON responses, interface-segregated handlers.

**Frontend** — profile dropdown from navbar avatar → menu with "Profile & Account Settings", "Change Password", "App Settings" (language + theme moved here), Logout. Routes `/settings/profile` and `/settings/change-password` (AuthGuard protected). AuthService gets `getProfile()` method calling `GET /api/user/profile`.

## Task 2 — Theme Fix

Theme already applied at `document.documentElement` via `SpeechService.applyTheme()`. Ensure theme re-applies on `AppComponent.ngOnInit` so login/register/landing pages inherit correctly. Add `APP_INITIALIZER` or root component init to reapply from localStorage on cold start.

## Task 3 — Mic Button Centering

Add flex centering wrapper around `<app-recorder>` in `TranscriberComponent` — `display: flex; justify-content: center; align-items: center;`. Preserve existing waveform, status, and error positioning.

## Task 4 — Smart Landing Page

`HomeComponent.ngOnInit` checks `isLoggedIn()` → redirect to `/transcriber`. Navbar logo uses `isLoggedIn()` for routerLink (`/` vs `/transcriber`). Remove redundant "Home" nav link post-login.

## Task 5 — Footer Everywhere

Move `<app-footer>` from `HomeComponent` to `AppComponent` shell outside `<router-outlet>`. Sticky footer via `min-height: 100vh` + `display: flex` + `flex-direction: column` + `flex: 1` on `<router-outlet>` wrapper.
