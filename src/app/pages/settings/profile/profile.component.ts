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
      <h2 class="text-xl font-semibold text-slate-900 dark:text-white mb-4">
        Profile & Account Settings
      </h2>
      <p class="text-sm text-slate-500 mb-6">
        Update your name and email address.
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

      <form [formGroup]="profileForm" (ngSubmit)="onSubmit()" class="space-y-4">
        <div>
          <label
            for="full_name"
            class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
            >Full Name</label
          >
          <input
            id="full_name"
            type="text"
            formControlName="full_name"
            class="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
            [class.border-red-500]="
              profileForm.get('full_name')?.invalid &&
              profileForm.get('full_name')?.touched
            "
          />
        </div>
        <div>
          <label
            for="email"
            class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
            >Email</label
          >
          <input
            id="email"
            type="email"
            formControlName="email"
            class="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
            [class.border-red-500]="
              profileForm.get('email')?.invalid &&
              profileForm.get('email')?.touched
            "
          />
        </div>
        <button
          type="submit"
          [disabled]="profileForm.invalid || isSubmitting()"
          class="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ isSubmitting() ? 'Saving...' : 'Save Changes' }}
        </button>
      </form>
    </div>
  `,
  styles: [':host { display: block; }'],
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
      full_name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
    });
  }

  ngOnInit(): void {
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
