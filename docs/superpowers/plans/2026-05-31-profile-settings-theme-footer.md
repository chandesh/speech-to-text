# Profile, Settings, Theme & Footer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement user profile settings, fix theme init, center mic, smart landing page, and sticky footer

**Architecture:** New backend `apps/user/` package with 3 endpoints (GET/PUT profile, POST change-password). Frontend: profile dropdown in navbar + 2 settings routes (/settings/profile, /settings/change-password) with AuthGuard. Independent fixes for theme reapplying at root, mic centering in transcriber layout, landing page redirect for logged-in users, and footer moved to AppComponent shell.

**Tech Stack:** Go/Gin/GORM/BCrypt/JWT on backend, Angular standalone/Router/ReactiveForms + Tailwind on frontend

---

### Task 1: Backend User Profile Endpoints

**Files:**

- Create: `backend/apps/user/routes.go`
- Create: `backend/apps/user/handlers/profile.go`
- Create: `backend/apps/user/handlers/change_password.go`
- Modify: `backend/main.go`

Creates a new `apps/user/` package with 3 endpoints protected by existing JWT middleware. Uses the existing middleware package and auth models.

- [ ] **Step 1: Create `backend/apps/user/routes.go`**

```go
package user

import (
	"github.com/gin-gonic/gin"
	"speech-to-text-backend/apps/auth/models"
	"speech-to-text-backend/apps/user/handlers"
	"speech-to-text-backend/core/middleware"
	"gorm.io/gorm"
)

func RegisterRoutes(r *gin.RouterGroup, db *gorm.DB) {
	h := handlers.NewHandler(db, &models.User{})
	ur := r.Group("/user")
	ur.Use(middleware.AuthRequired())
	{
		ur.GET("/profile", h.GetProfile)
		ur.PUT("/profile", h.UpdateProfile)
		ur.POST("/change-password", h.ChangePassword)
	}
}
```

- [ ] **Step 2: Create `backend/apps/user/handlers/profile.go`**

```go
package handlers

import (
	"net/http"

	"speech-to-text-backend/apps/auth/models"
	"speech-to-text-backend/core/middleware"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type Handler struct {
	db   *gorm.DB
	user *models.User
}

func NewHandler(db *gorm.DB, user *models.User) *Handler {
	return &Handler{db: db, user: user}
}

type updateProfileRequest struct {
	FullName string `json:"full_name" binding:"required,min=1,max=255"`
	Email    string `json:"email" binding:"required,email"`
}

func (h *Handler) GetProfile(c *gin.Context) {
	claims := middleware.GetClaims(c)
	if claims == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	var user models.User
	if err := h.db.First(&user, "id = ?", claims.UserID).Error; err != nil {
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
	claims := middleware.GetClaims(c)
	if claims == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	var req updateProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var user models.User
	if err := h.db.First(&user, "id = ?", claims.UserID).Error; err != nil {
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
```

- [ ] **Step 3: Create `backend/apps/user/handlers/change_password.go`**

```go
package handlers

import (
	"net/http"

	"speech-to-text-backend/apps/auth/models"
	"speech-to-text-backend/core/middleware"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type changePasswordRequest struct {
	CurrentPassword string `json:"current_password" binding:"required"`
	NewPassword     string `json:"new_password" binding:"required,min=8"`
}

func (h *Handler) ChangePassword(c *gin.Context) {
	claims := middleware.GetClaims(c)
	if claims == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	var req changePasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "new_password must be at least 8 characters"})
		return
	}

	var user models.User
	if err := h.db.First(&user, "id = ?", claims.UserID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.CurrentPassword)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "current password is incorrect"})
		return
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to hash password"})
		return
	}

	user.PasswordHash = string(hash)
	if err := h.db.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update password"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "password changed successfully"})
}
```

- [ ] **Step 4: Register user routes in `backend/main.go`**

Find where auth routes are registered and add user routes next.

```go
// Add import
"speech-to-text-backend/apps/user"

// After auth routes registration:
user.RegisterRoutes(api, db)
```

- [ ] **Step 5: Build and verify**

```bash
docker compose build backend && docker compose up -d backend
```

Test manually:

```bash
# Login, get token
TOKEN=$(curl -s -X POST http://localhost:1212/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"test@example.com","password":"password123"}' | python3 -c "import sys,json; print(json.load(sys.stdin)['access_token'])")

# GET profile
curl -s http://localhost:1212/api/user/profile -H "Authorization: Bearer $TOKEN" | python3 -m json.tool

# PUT profile
curl -s -X PUT http://localhost:1212/api/user/profile \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"full_name":"Updated Name","email":"test@example.com"}' | python3 -m json.tool

# POST change-password
curl -s -X POST http://localhost:1212/api/user/change-password \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"current_password":"password123","new_password":"newpass1234"}' | python3 -m json.tool
```

---

### Task 2: Frontend AuthService getProfile + Profile Dropdown in Navbar

**Files:**

- Modify: `src/app/services/auth/auth.service.ts`
- Modify: `src/app/components/navbar/navbar.component.ts`
- Modify: `src/app/components/navbar/navbar.component.html`

Add `getProfile()` to AuthService, add dropdown menu to navbar avatar.

- [ ] **Step 1: Add `getProfile()` + profile update methods to AuthService**

Insert before `logout()`:

```typescript
  async getProfile(): Promise<User> {
    const token = this.getAccessToken();
    if (!token) throw new Error('Not authenticated');
    const res = await fetch(`${API_BASE}/user/profile`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to fetch profile');
    }
    const data = await res.json();
    return data;
  }

  async updateProfile(data: { full_name: string; email: string }): Promise<User> {
    const token = this.getAccessToken();
    if (!token) throw new Error('Not authenticated');
    const res = await fetch(`${API_BASE}/user/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update profile');
    }
    const user = await res.json();
    this._currentUser.set(user);
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
    return user;
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const token = this.getAccessToken();
    if (!token) throw new Error('Not authenticated');
    const res = await fetch(`${API_BASE}/user/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to change password');
    }
  }
```

- [ ] **Step 2: Update navbar HTML with profile dropdown**

Replace the current avatar + name + Logout button with a dropdown:

```html
<div class="flex items-center gap-4">
  <ng-container *ngIf="isLoggedIn()">
    <button
      (click)="toggleDropdown()"
      class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-surface transition-colors"
      aria-haspopup="true"
      [attr.aria-expanded]="dropdownOpen"
    >
      <span
        class="w-8 h-8 rounded-full bg-primary text-background flex items-center justify-center text-sm font-bold"
      >
        {{ userInitials() }}
      </span>
      <span class="hidden sm:inline text-sm font-medium"
        >{{ currentUserName() }}</span
      >
      <svg
        class="w-4 h-4 transition-transform"
        [class.rotate-180]="dropdownOpen"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </button>

    <div
      *ngIf="dropdownOpen"
      (click)="closeDropdown($event)"
      class="fixed inset-0 z-40"
    ></div>

    <div
      *ngIf="dropdownOpen"
      class="absolute right-0 top-full mt-2 w-56 bg-surface border border-on-surface/10 rounded-xl shadow-xl z-50 py-2"
    >
      <div class="px-4 py-3 border-b border-on-surface/10">
        <p class="text-sm font-medium">{{ currentUserName() }}</p>
        <p class="text-xs text-on-surface-variant truncate">
          {{ currentUserEmail() }}
        </p>
      </div>
      <a
        routerLink="/settings/profile"
        (click)="dropdownOpen = false"
        class="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-surface-hover transition-colors"
      >
        <svg
          class="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
        Profile & Account Settings
      </a>
      <a
        routerLink="/settings/change-password"
        (click)="dropdownOpen = false"
        class="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-surface-hover transition-colors"
      >
        <svg
          class="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
        Change Password
      </a>
      <a
        routerLink="/settings"
        (click)="dropdownOpen = false"
        class="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-surface-hover transition-colors"
      >
        <svg
          class="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
        App Settings
      </a>
      <div class="border-t border-on-surface/10 mt-2 pt-2">
        <button
          (click)="logout()"
          class="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-surface-hover transition-colors"
        >
          <svg
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          Logout
        </button>
      </div>
    </div>
  </ng-container>

  <ng-container *ngIf="!isLoggedIn()">
    <a
      routerLink="/login"
      class="px-4 py-2 text-sm font-medium text-on-surface hover:text-primary transition-colors"
    >
      Login
    </a>
    <a
      routerLink="/register"
      class="px-4 py-2 text-sm font-medium bg-primary text-background rounded-lg hover:brightness-110 transition-all"
    >
      Sign Up
    </a>
  </ng-container>
</div>
```

- [ ] **Step 3: Update Navbar component logic**

In `navbar.component.ts`, add:

```typescript
import { AuthService } from '../../services/auth/auth.service';
// In component definition:
export class NavbarComponent {
  dropdownOpen = false;

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  currentUserName(): string {
    return this.authService.currentUser()?.full_name || '';
  }

  currentUserEmail(): string {
    return this.authService.currentUser()?.email || '';
  }

  userInitials(): string {
    const name = this.currentUserName();
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
  }

  closeDropdown(event: Event): void {
    if ((event.target as HTMLElement).classList.contains('fixed')) {
      this.dropdownOpen = false;
    }
  }

  async logout(): Promise<void> {
    this.dropdownOpen = false;
    await this.authService.logout();
    this.router.navigate(['/']);
  }
}
```

Also update the module imports to include `RouterLink`, `NgIf`, `NgFor` etc (they're already standalone so just imports array).

---

### Task 3: Settings Routes + Components

**Files:**

- Create: `src/app/pages/settings/settings.component.ts`
- Create: `src/app/pages/settings/settings.component.html`
- Create: `src/app/pages/settings/settings.component.scss`
- Create: `src/app/pages/settings/profile/profile.component.ts`
- Create: `src/app/pages/settings/profile/profile.component.html`
- Create: `src/app/pages/settings/profile/profile.component.scss`
- Create: `src/app/pages/settings/change-password/change-password.component.ts`
- Create: `src/app/pages/settings/change-password/change-password.component.html`
- Create: `src/app/pages/settings/change-password/change-password.component.scss`
- Modify: `src/app/app.routes.ts`
- Modify: `src/app/components/navbar/navbar.component.ts`
- Modify: `src/app/components/settings/settings.component.ts`

Create a settings page with profile editing and change password forms. Move theme/language toggles from the transcriber sidebar into App Settings. Keep existing `<app-settings>` as the settings panel in the transcriber page for convenience, but also render same controls under `/settings`.

- [ ] **Step 1: Create `src/app/pages/settings/settings.component.ts`**

```typescript
import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="min-h-screen bg-background">
      <app-navbar></app-navbar>
      <div class="max-w-4xl mx-auto px-4 py-8">
        <h1 class="text-2xl font-bold mb-6">Settings</h1>
        <nav class="flex gap-4 mb-8 border-b border-on-surface/10">
          <a
            routerLink="/settings/profile"
            routerLinkActive="text-primary border-b-2 border-primary"
            class="pb-3 text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors"
          >
            Profile
          </a>
          <a
            routerLink="/settings/change-password"
            routerLinkActive="text-primary border-b-2 border-primary"
            class="pb-3 text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors"
          >
            Change Password
          </a>
          <a
            routerLink="/settings/app-settings"
            routerLinkActive="text-primary border-b-2 border-primary"
            class="pb-3 text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors"
          >
            App Settings
          </a>
        </nav>
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class SettingsPageComponent {}
```

- [ ] **Step 2: Create `src/app/pages/settings/profile/profile.component.ts`**

```typescript
import { Component, OnInit, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { NgIf } from '@angular/common';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-profile-settings',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf],
  template: `
    <div class="max-w-lg">
      <h2 class="text-xl font-semibold mb-4">Profile & Account Settings</h2>
      <p class="text-sm text-on-surface-variant mb-6">
        Update your name and email address.
      </p>

      <div
        *ngIf="successMessage()"
        class="mb-4 px-4 py-3 bg-green-500/10 border border-green-500/30 rounded-lg text-sm text-green-500"
        role="alert"
      >
        {{ successMessage() }}
      </div>

      <div
        *ngIf="errorMessage()"
        class="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-500"
        role="alert"
      >
        {{ errorMessage() }}
      </div>

      <form [formGroup]="profileForm" (ngSubmit)="onSubmit()" class="space-y-4">
        <div>
          <label for="full_name" class="block text-sm font-medium mb-1"
            >Full Name</label
          >
          <input
            id="full_name"
            type="text"
            formControlName="full_name"
            class="w-full px-4 py-2.5 bg-surface border border-on-surface/20 rounded-lg text-sm focus:outline-none focus:border-primary transition-colors"
            [class.border-red-500]="
              profileForm.get('full_name')?.invalid &&
              profileForm.get('full_name')?.touched
            "
          />
        </div>

        <div>
          <label for="email" class="block text-sm font-medium mb-1"
            >Email</label
          >
          <input
            id="email"
            type="email"
            formControlName="email"
            class="w-full px-4 py-2.5 bg-surface border border-on-surface/20 rounded-lg text-sm focus:outline-none focus:border-primary transition-colors"
            [class.border-red-500]="
              profileForm.get('email')?.invalid &&
              profileForm.get('email')?.touched
            "
          />
        </div>

        <button
          type="submit"
          [disabled]="profileForm.invalid || isSubmitting()"
          class="px-6 py-2.5 bg-primary text-background rounded-lg text-sm font-medium hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ isSubmitting() ? 'Saving...' : 'Save Changes' }}
        </button>
      </form>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class ProfileSettingsComponent implements OnInit {
  profileForm: FormGroup;
  isSubmitting = signal(false);
  successMessage = signal('');
  errorMessage = signal('');

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
  ) {
    this.profileForm = this.fb.group({
      full_name: ['', [Validators.required, Validators.minLength(1)]],
      email: ['', [Validators.required, Validators.email]],
    });
  }

  async ngOnInit(): Promise<void> {
    const user = this.authService.currentUser();
    if (user) {
      this.profileForm.patchValue({
        full_name: user.full_name,
        email: user.email,
      });
    }
  }

  async onSubmit(): Promise<void> {
    if (this.profileForm.invalid) return;
    this.isSubmitting.set(true);
    this.successMessage.set('');
    this.errorMessage.set('');
    try {
      await this.authService.updateProfile(this.profileForm.value);
      this.successMessage.set('Profile updated successfully.');
    } catch (err: any) {
      this.errorMessage.set(err.message || 'Failed to update profile.');
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
```

- [ ] **Step 3: Create `src/app/pages/settings/change-password/change-password.component.ts`**

```typescript
import { Component, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { NgIf } from '@angular/common';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf],
  template: `
    <div class="max-w-lg">
      <h2 class="text-xl font-semibold mb-4">Change Password</h2>
      <p class="text-sm text-on-surface-variant mb-6">
        Enter your current password and a new password.
      </p>

      <div
        *ngIf="successMessage()"
        class="mb-4 px-4 py-3 bg-green-500/10 border border-green-500/30 rounded-lg text-sm text-green-500"
        role="alert"
      >
        {{ successMessage() }}
      </div>

      <div
        *ngIf="errorMessage()"
        class="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-500"
        role="alert"
      >
        {{ errorMessage() }}
      </div>

      <form
        [formGroup]="passwordForm"
        (ngSubmit)="onSubmit()"
        class="space-y-4"
      >
        <div>
          <label for="current_password" class="block text-sm font-medium mb-1"
            >Current Password</label
          >
          <input
            id="current_password"
            type="password"
            formControlName="current_password"
            class="w-full px-4 py-2.5 bg-surface border border-on-surface/20 rounded-lg text-sm focus:outline-none focus:border-primary transition-colors"
            [class.border-red-500]="
              passwordForm.get('current_password')?.invalid &&
              passwordForm.get('current_password')?.touched
            "
          />
        </div>

        <div>
          <label for="new_password" class="block text-sm font-medium mb-1"
            >New Password</label
          >
          <input
            id="new_password"
            type="password"
            formControlName="new_password"
            class="w-full px-4 py-2.5 bg-surface border border-on-surface/20 rounded-lg text-sm focus:outline-none focus:border-primary transition-colors"
            [class.border-red-500]="
              passwordForm.get('new_password')?.invalid &&
              passwordForm.get('new_password')?.touched
            "
          />
          <p class="text-xs text-on-surface-variant mt-1">
            Minimum 8 characters.
          </p>
        </div>

        <button
          type="submit"
          [disabled]="passwordForm.invalid || isSubmitting()"
          class="px-6 py-2.5 bg-primary text-background rounded-lg text-sm font-medium hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ isSubmitting() ? 'Changing...' : 'Change Password' }}
        </button>
      </form>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class ChangePasswordComponent {
  passwordForm: FormGroup;
  isSubmitting = signal(false);
  successMessage = signal('');
  errorMessage = signal('');

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
  ) {
    this.passwordForm = this.fb.group({
      current_password: ['', [Validators.required]],
      new_password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  async onSubmit(): Promise<void> {
    if (this.passwordForm.invalid) return;
    this.isSubmitting.set(true);
    this.successMessage.set('');
    this.errorMessage.set('');
    try {
      await this.authService.changePassword(
        this.passwordForm.value.current_password,
        this.passwordForm.value.new_password,
      );
      this.successMessage.set('Password changed successfully.');
      this.passwordForm.reset();
    } catch (err: any) {
      this.errorMessage.set(err.message || 'Failed to change password.');
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
```

- [ ] **Step 4: Create `src/app/pages/settings/app-settings/app-settings.component.ts`**

This reuses the same theme/language controls from the existing `<app-settings>` dropdown.

```typescript
import { Component } from '@angular/core';
import { SettingsComponent } from '../../../components/settings/settings.component';

@Component({
  selector: 'app-app-settings-page',
  standalone: true,
  imports: [SettingsComponent],
  template: `
    <div class="max-w-lg">
      <h2 class="text-xl font-semibold mb-4">App Settings</h2>
      <p class="text-sm text-on-surface-variant mb-6">
        Configure theme, language, and other preferences.
      </p>
      <app-settings></app-settings>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class AppSettingsPageComponent {}
```

- [ ] **Step 5: Update routes in `app.routes.ts`**

Add settings routes:

```typescript
// Add imports:
import { SettingsPageComponent } from './pages/settings/settings.component';
import { ProfileSettingsComponent } from './pages/settings/profile/profile.component';
import { ChangePasswordComponent } from './pages/settings/change-password/change-password.component';
import { AppSettingsPageComponent } from './pages/settings/app-settings/app-settings.component';

// Add to routes array:
{
  path: 'settings',
  component: SettingsPageComponent,
  canActivate: [AuthGuard],
  children: [
    { path: '', redirectTo: 'profile', pathMatch: 'full' },
    { path: 'profile', component: ProfileSettingsComponent },
    { path: 'change-password', component: ChangePasswordComponent },
    { path: 'app-settings', component: AppSettingsPageComponent },
  ],
},
```

- [ ] **Step 6: Update existing SettingsComponent to be usable standalone**

The existing `<app-settings>` in `settings.component.ts` is a floating dropdown panel with an inline form. It should already work standalone since it's just template + form. Verify it doesn't depend on transcriber-specific props. If it does, make it self-contained.

---

### Task 4: Theme Initialization Fix

**Files:**

- Modify: `src/app/app.ts`

Ensure theme is reapplied from localStorage on app cold start, so login/register/landing pages inherit the correct theme.

- [ ] **Step 1: Theme re-application in AppComponent**

Add `ngOnInit` to `AppComponent`:

```typescript
import { Component, OnInit } from '@angular/core';
import { SpeechService } from './services/speech/speech.service';

export class AppComponent implements OnInit {
  constructor(private speechService: SpeechService) {}

  ngOnInit(): void {
    this.speechService.applyTheme();
  }
}
```

- [ ] **Step 2: Add `applyTheme()` to SpeechService if not already public**

Check `SpeechService` — it should already have `initTheme()` or `applyTheme()`. If named `initTheme`, call that. If no public method exists, add one:

```typescript
  public applyTheme(): void {
    const family = this.themeFamily();
    const mode = this.themeMode();
    document.documentElement.className = `theme-${family}-${mode}`;
  }
```

---

### Task 5: Mic Button Centering

**Files:**

- Modify: `src/app/pages/transcriber/transcriber.component.html`
- (Possibly modify) `src/app/pages/transcriber/transcriber.component.scss`

- [ ] **Step 1: Add centering wrapper around `<app-recorder>`**

In `transcriber.component.html`, find `<app-recorder>` and wrap it:

```html
<div class="flex justify-center items-center py-8">
  <app-recorder></app-recorder>
</div>
```

Also ensure the grid cell containing the mic has the right layout. Check if the recorder is inside a grid. If so, the parent grid cell should have `place-items: center` or `display: flex; justify-content: center; align-items: center;`.

---

### Task 6: Smart Landing Page

**Files:**

- Modify: `src/app/pages/home/home.component.ts`
- Modify: `src/app/components/navbar/navbar.component.html` (logo behavior)

- [ ] **Step 1: Redirect logged-in users from landing page**

In `home.component.ts`:

```typescript
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

export class HomeComponent implements OnInit {
  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/transcriber']);
    }
  }
}
```

- [ ] **Step 2: Smart logo link in navbar**

In `navbar.component.html`, make the logo routerLink dynamic:

```html
<a
  [routerLink]="isLoggedIn() ? '/transcriber' : '/'"
  class="flex items-center gap-2"
>
  <span class="text-lg font-bold">Speech to Text</span>
</a>
```

---

### Task 7: Footer Everywhere

**Files:**

- Modify: `src/app/app.ts`
- Modify: `src/app/app.ts` template
- Modify: `src/app/pages/home/home.component.html` (remove footer)
- Modify: `src/styles.scss` (optional sticky footer styles)

- [ ] **Step 1: Move footer from HomeComponent to AppComponent**

In `app.ts`, update template:

```html
<div class="min-h-screen flex flex-col">
  <router-outlet></router-outlet>
  <app-footer class="mt-auto"></app-footer>
</div>
```

Add imports: `FooterComponent` and `RouterOutlet`.

- [ ] **Step 2: Remove footer from HomeComponent**

In `home.component.html`, remove the `<app-footer>` tag. Keep the rest of the content.

- [ ] **Step 3: Add sticky footer CSS to AppComponent**

The `min-h-screen flex flex-col` on the wrapper + `mt-auto` on the footer handles sticky positioning. Ensure `<router-outlet>` wrapper gets `flex-1`:

In `app.ts`, wrap the `<router-outlet>` in a div with `flex-1`:

```html
<div class="min-h-screen flex flex-col">
  <div class="flex-1">
    <router-outlet></router-outlet>
  </div>
  <app-footer></app-footer>
</div>
```

This ensures the footer is pushed to the bottom even on short pages.
