import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { NavbarComponent } from './components/navbar/navbar.component';

// Since the original app seems to have a main app component managing a a a transcription screen,
// we'll treat the main app's root logic as the /transcriber page.
// In a real migration, we'd move a lot of app.ts logic to TranscriberComponent.

export const appRoutes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { 
    path: 'transcriber', 
    loadComponent: () => import('./pages/transcriber/transcriber.component').then(m => m.TranscriberComponent) 
  },
  { path: '**', redirectTo: '' }
];
