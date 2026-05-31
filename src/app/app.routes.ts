import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { AuthGuard } from './guards/auth.guard';
import { SettingsPageComponent } from './pages/settings/settings.component';
import { ProfileSettingsComponent } from './pages/settings/profile/profile.component';
import { ChangePasswordComponent } from './pages/settings/change-password/change-password.component';
import { AppSettingsPageComponent } from './pages/settings/app-settings/app-settings.component';

export const appRoutes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: 'transcriber',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./pages/transcriber/transcriber.component').then(
        (m) => m.TranscriberComponent,
      ),
  },
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
  { path: '**', redirectTo: '', pathMatch: 'full' },
];
