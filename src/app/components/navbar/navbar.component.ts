import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  standalone: true,
  selector: 'app-navbar',
  imports: [CommonModule, RouterModule],
  template: `
    <nav
      class="sticky top-0 z-50 backdrop-blur-md bg-white/70 dark:bg-slate-900/70 border-b border-slate-200 dark:border-slate-800 px-6 py-4"
    >
      <div class="max-w-7xl mx-auto flex items-center justify-between">
        <div class="flex items-center gap-8">
          <a
            [routerLink]="authService.isLoggedIn() ? '/transcriber' : '/'"
            class="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <div
              class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white"
            >
              S
            </div>
            <span>SpeechText</span>
          </a>

          <div
            class="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-400"
          >
            <a
              *ngIf="!authService.isLoggedIn()"
              routerLink="/"
              class="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >Home</a
            >
            <a
              *ngIf="authService.isLoggedIn()"
              routerLink="/transcriber"
              class="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >Transcriber</a
            >
          </div>
        </div>

        <div class="flex items-center gap-4">
          <div
            *ngIf="!authService.isLoggedIn()"
            class="flex items-center gap-3"
          >
            <a
              routerLink="/login"
              class="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 transition-colors"
              >Login</a
            >
            <a
              routerLink="/register"
              class="px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-semibold hover:bg-blue-700 transition-all"
              >Sign Up</a
            >
          </div>

          <div *ngIf="authService.isLoggedIn()" class="relative">
            <button
              (click)="toggleDropdown()"
              class="flex items-center gap-2 px-3 py-2 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              aria-haspopup="true"
              [attr.aria-expanded]="dropdownOpen"
            >
              <span
                class="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold border-2 border-white dark:border-slate-700"
              >
                {{ userInitials() }}
              </span>
              <span
                class="hidden sm:inline text-sm font-medium text-slate-900 dark:text-white"
                >{{ authService.currentUser()?.full_name }}</span
              >
              <svg
                class="w-4 h-4 text-slate-500 transition-transform"
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
              (click)="closeDropdown()"
              class="fixed inset-0 z-40"
            ></div>

            <div
              *ngIf="dropdownOpen"
              class="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 py-2"
            >
              <div
                class="px-4 py-3 border-b border-slate-200 dark:border-slate-700"
              >
                <p class="text-sm font-medium text-slate-900 dark:text-white">
                  {{ authService.currentUser()?.full_name }}
                </p>
                <p class="text-xs text-slate-500 truncate">
                  {{ authService.currentUser()?.email }}
                </p>
              </div>
              <a
                routerLink="/settings/profile"
                (click)="dropdownOpen = false"
                class="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
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
                class="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
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
                routerLink="/settings/app-settings"
                (click)="dropdownOpen = false"
                class="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
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
              <div
                class="border-t border-slate-200 dark:border-slate-700 mt-2 pt-2"
              >
                <button
                  (click)="logout()"
                  class="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
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
          </div>

          <button class="md:hidden p-2 text-slate-600 dark:text-slate-400">
            <svg
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16m-7 6h7"
              ></path>
            </svg>
          </button>
        </div>
      </div>
    </nav>
  `,
})
export class NavbarComponent {
  authService = inject(AuthService);
  private router = inject(Router);
  dropdownOpen = false;

  userInitials(): string {
    const name = this.authService.currentUser()?.full_name || '';
    if (!name) return '?';
    return name
      .split(/\s+/)
      .filter(Boolean)
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
  }

  closeDropdown(): void {
    this.dropdownOpen = false;
  }

  async logout(): Promise<void> {
    this.dropdownOpen = false;
    await this.authService.logout();
    this.router.navigate(['/']);
  }
}
