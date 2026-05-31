import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NavbarComponent],
  template: `
    <div class="min-h-screen bg-white dark:bg-slate-900">
      <app-navbar></app-navbar>
      <div class="max-w-4xl mx-auto px-4 py-8">
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white mb-6">
          Settings
        </h1>
        <nav
          class="flex gap-6 mb-8 border-b border-slate-200 dark:border-slate-700"
        >
          <a
            routerLink="/settings/profile"
            routerLinkActive="text-blue-600 border-b-2 border-blue-600"
            class="pb-3 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Profile
          </a>
          <a
            routerLink="/settings/change-password"
            routerLinkActive="text-blue-600 border-b-2 border-blue-600"
            class="pb-3 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Change Password
          </a>
          <a
            routerLink="/settings/app-settings"
            routerLinkActive="text-blue-600 border-b-2 border-blue-600"
            class="pb-3 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            App Settings
          </a>
        </nav>
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  styles: [':host { display: block; }'],
})
export class SettingsPageComponent {}
