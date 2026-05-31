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
      <h2 class="text-xl font-semibold text-slate-900 dark:text-white mb-4">
        Change Password
      </h2>
      <p class="text-sm text-slate-500 mb-6">
        Enter your current password and a new password.
      </p>

      <div
        *ngIf="successMessage()"
        class="mb-4 px-4 py-3 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-lg text-sm text-green-700 dark:text-green-400"
        role="alert"
      >
        {{ successMessage() }}
      </div>
      <div
        *ngIf="errorMessage()"
        class="mb-4 px-4 py-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg text-sm text-red-700 dark:text-red-400"
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
          <label
            for="current_password"
            class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
            >Current Password</label
          >
          <input
            id="current_password"
            type="password"
            formControlName="current_password"
            class="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
            [class.border-red-500]="
              passwordForm.get('current_password')?.invalid &&
              passwordForm.get('current_password')?.touched
            "
          />
        </div>
        <div>
          <label
            for="new_password"
            class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
            >New Password</label
          >
          <input
            id="new_password"
            type="password"
            formControlName="new_password"
            class="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
            [class.border-red-500]="
              passwordForm.get('new_password')?.invalid &&
              passwordForm.get('new_password')?.touched
            "
          />
          <p class="text-xs text-slate-500 mt-1">Minimum 8 characters.</p>
        </div>
        <button
          type="submit"
          [disabled]="passwordForm.invalid || isSubmitting()"
          class="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ isSubmitting() ? 'Changing...' : 'Change Password' }}
        </button>
      </form>
    </div>
  `,
  styles: [':host { display: block; }'],
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
