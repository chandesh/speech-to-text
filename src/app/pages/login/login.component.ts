import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../services/auth/auth.service';
import { Router, RouterModule } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div
      class="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-900"
    >
      <div
        class="w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-700 p-8 space-y-8 overflow-hidden relative"
      >
        <div
          class="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full -mr-16 -mt-16"
        ></div>

        <div class="text-center space-y-2 relative">
          <h1 class="text-3xl font-bold text-slate-900 dark:text-white">
            Welcome Back
          </h1>
          <p class="text-slate-500 dark:text-slate-400">
            Please enter your details to log in
          </p>
        </div>

        <form
          [formGroup]="loginForm"
          (ngSubmit)="onSubmit()"
          class="space-y-6 relative"
        >
          <div class="space-y-4">
            <div class="space-y-2">
              <label
                class="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1"
                >Email Address</label
              >
              <input
                formControlName="email"
                type="email"
                placeholder="name@company.com"
                class="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all outline-none"
              />
            </div>

            <div class="space-y-2">
              <div class="flex justify-between items-center">
                <label
                  class="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1"
                  >Password</label
                >
                <a href="#" class="text-xs text-blue-600 hover:underline"
                  >Forgot password?</a
                >
              </div>
              <div class="relative">
                <input
                  [type]="showPassword ? 'text' : 'password'"
                  formControlName="password"
                  placeholder="••••••••"
                  class="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                />
                <button
                  type="button"
                  (click)="showPassword = !showPassword"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {{ showPassword ? 'Hide' : 'Show' }}
                </button>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <input
              type="checkbox"
              id="remember"
              class="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <label
              for="remember"
              class="text-sm text-slate-600 dark:text-slate-400 cursor-pointer"
              >Remember me</label
            >
          </div>

          <button
            type="submit"
            [disabled]="loginForm.invalid || authService.isLoading()"
            class="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-semibold shadow-lg shadow-blue-500/30 transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {{ authService.isLoading() ? 'Signing in...' : 'Sign In' }}
          </button>
        </form>

        <div class="relative space-y-6">
          <div class="relative flex items-center">
            <div
              class="flex-grow border-t border-slate-200 dark:border-slate-700"
            ></div>
            <span
              class="flex-shrink mx-4 text-xs text-slate-400 uppercase font-medium"
              >Or continue with</span
            >
            <div
              class="flex-grow border-t border-slate-200 dark:border-slate-700"
            ></div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <button
              class="py-3 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2 text-sm font-medium"
            >
              <img src="https://www.google.com/favicon.ico" class="w-4 h-4" />
              Google
            </button>
            <button
              class="py-3 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2 text-sm font-medium"
            >
              <img src="https://github.com/favicon.ico" class="w-4 h-4" />
              GitHub
            </button>
          </div>
        </div>

        <p class="text-center text-sm text-slate-500 dark:text-slate-400">
          Don't have an account?
          <a
            routerLink="/register"
            class="text-blue-600 hover:underline font-semibold"
            >Sign up</a
          >
        </p>
      </div>
    </div>
  `,
  providers: [FormBuilder],
})
export class LoginComponent {
  showPassword = false;
  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public authService: AuthService,
    private router: Router,
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  async onSubmit() {
    if (this.loginForm.invalid) return;
    const { email, password } = this.loginForm.value;
    await this.authService.login(email, password);
    this.router.navigate(['/transcriber']);
  }
}
