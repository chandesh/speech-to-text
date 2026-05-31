import { Component, signal } from '@angular/core';
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
  selector: 'app-register',
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
            Create Account
          </h1>
          <p class="text-slate-500 dark:text-slate-400">
            Join thousands of users today
          </p>
        </div>

        @if (errorMessage()) {
          <div
            class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-2xl px-4 py-3 text-sm text-center"
          >
            {{ errorMessage() }}
          </div>
        }

        @if (successMessage()) {
          <div
            class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 rounded-2xl px-4 py-3 text-sm text-center"
          >
            {{ successMessage() }}
          </div>
        }

        <form
          [formGroup]="regForm"
          (ngSubmit)="onSubmit()"
          class="space-y-6 relative"
        >
          <div class="space-y-4">
            <div class="space-y-2">
              <label
                class="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1"
                >Full Name</label
              >
              <input
                formControlName="fullName"
                type="text"
                placeholder="John Doe"
                class="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all outline-none"
              />
            </div>

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
              <label
                class="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1"
                >Password</label
              >
              <input
                [type]="showPassword ? 'text' : 'password'"
                formControlName="password"
                placeholder="••••••••"
                class="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all outline-none"
              />
              <div class="flex justify-between px-1">
                <span class="text-xs text-slate-400">Min 6 characters</span>
                <button
                  type="button"
                  (click)="showPassword = !showPassword"
                  class="text-xs text-blue-600 hover:underline"
                >
                  Show
                </button>
              </div>
            </div>

            <div class="space-y-2">
              <label
                class="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1"
                >Confirm Password</label
              >
              <input
                [type]="showPassword ? 'text' : 'password'"
                formControlName="confirmPassword"
                placeholder="••••••••"
                class="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            [disabled]="regForm.invalid || authService.isLoading()"
            class="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-semibold shadow-lg shadow-blue-500/30 transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {{
              authService.isLoading() ? 'Creating account...' : 'Get Started'
            }}
          </button>
        </form>

        <p class="text-center text-sm text-slate-500 dark:text-slate-400">
          Already have an account?
          <a
            routerLink="/login"
            class="text-blue-600 hover:underline font-semibold"
            >Login</a
          >
        </p>
      </div>
    </div>
  `,
  providers: [FormBuilder],
})
export class RegisterComponent {
  showPassword = false;
  regForm: FormGroup;
  errorMessage = signal('');
  successMessage = signal('');

  constructor(
    private fb: FormBuilder,
    public authService: AuthService,
    private router: Router,
  ) {
    this.regForm = this.fb.group(
      {
        fullName: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
      },
      { validators: this.passwordMatchValidator },
    );
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmPassword')?.value
      ? null
      : { mismatch: true };
  }

  async onSubmit() {
    if (this.regForm.invalid) return;
    this.errorMessage.set('');
    this.successMessage.set('');
    const { fullName, email, password } = this.regForm.value;
    try {
      await this.authService.register({ email, password, full_name: fullName });
      this.successMessage.set('Account created successfully! Redirecting...');
      setTimeout(() => this.router.navigate(['/transcriber']), 1500);
    } catch (err) {
      this.errorMessage.set(
        err instanceof Error ? err.message : 'Registration failed',
      );
    }
  }
}
