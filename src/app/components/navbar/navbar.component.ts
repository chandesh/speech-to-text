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
            routerLink="/"
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

          <div
            *ngIf="authService.isLoggedIn()"
            class="flex items-center gap-3 p-1 pl-2 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
          >
            <div
              class="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold border-2 border-white dark:border-slate-700"
            >
              {{ authService.currentUser()?.full_name?.charAt(0) }}
            </div>
            <div class="text-right px-2 mr-2">
              <p
                class="text-xs font-bold text-slate-900 dark:text-white leading-none"
              >
                {{ authService.currentUser()?.full_name }}
              </p>
              <button
                (click)="logout()"
                class="text-xs text-red-500 hover:text-red-600 font-medium"
              >
                Logout
              </button>
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

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
