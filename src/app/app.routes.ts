import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { AuthGuard } from './guards/auth.guard';

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
  { path: '**', redirectTo: '', pathMatch: 'full' },
];
