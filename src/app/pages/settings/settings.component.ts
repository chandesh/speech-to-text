import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NavbarComponent],
  template: `
    <div class="min-h-screen bg-background">
      <app-navbar></app-navbar>
      <div class="max-w-4xl mx-auto px-4 py-8">
        <h1 class="text-2xl font-bold text-on-surface mb-6">Settings</h1>
        <nav class="flex gap-6 mb-8 border-b border-outline">
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
  styles: [':host { display: block; }'],
})
export class SettingsPageComponent {}
