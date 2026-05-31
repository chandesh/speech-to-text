import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [CommonModule, RouterModule, NavbarComponent],
  template: `
    <app-navbar></app-navbar>
    <div
      class="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300"
    >
      <!-- Hero Section -->
      <section class="relative py-20 px-6 overflow-hidden">
        <div class="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div class="flex flex-col space-y-6 text-center lg:text-left">
            <h1
              class="text-5xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white"
            >
              Real-Time
              <span class="text-blue-600 dark:text-blue-400"
                >Speech to Text</span
              >
            </h1>
            <p class="text-lg text-slate-600 dark:text-slate-400 max-w-2xl">
              Turn your voice into text instantly with our browser-based live
              transcription tool. Privacy-first, fast, and accurate.
            </p>
            <div class="flex flex-wrap gap-4 justify-center lg:justify-start">
              <a
                routerLink="/transcriber"
                class="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-semibold transition-all transform hover:scale-105 shadow-lg shadow-blue-500/30"
              >
                Start Transcribing
              </a>
              <a
                routerLink="/login"
                class="px-8 py-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-2xl font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
              >
                Login
              </a>
            </div>
          </div>
          <div class="relative group">
            <div
              class="absolute -inset-4 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-3xl blur opacity-20 group-hover:opacity-30 transition-opacity"
            ></div>
            <div
              class="relative bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-700 transform rotate-2 group-hover:rotate-0 transition-transform duration-500"
            >
              <div
                class="flex items-center gap-3 mb-4 border-b border-slate-100 dark:border-slate-700 pb-3"
              >
                <div class="w-3 h-3 rounded-full bg-red-400"></div>
                <div class="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div class="w-3 h-3 rounded-full bg-green-400"></div>
              </div>
              <div
                class="space-y-3 font-mono text-sm text-slate-700 dark:text-slate-300"
              >
                <p class="opacity-50">Recognizing voice...</p>
                <p
                  class="animate-pulse inline-block border-r-2 border-blue-500 pr-1"
                >
                  "Welcome to the future of speech recognition. This is a live
                  transcription preview..."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Features Section -->
      <section class="py-20 px-6 bg-white dark:bg-slate-800/50">
        <div class="max-w-7xl mx-auto">
          <div class="text-center mb-16">
            <h2 class="text-3xl font-bold text-slate-900 dark:text-white mb-4">
              Everything you need to transcribe
            </h2>
            <p class="text-slate-600 dark:text-slate-400">
              Powerful features designed for modern productivity
            </p>
          </div>
          <div class="grid md:grid-cols-3 gap-8">
            <div
              *ngFor="let feature of features"
              class="p-8 rounded-3xl border border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 hover:border-blue-500 dark:hover:border-blue-400 transition-all group"
            >
              <div
                class="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"
              >
                <span class="text-2xl">{{ feature.icon }}</span>
              </div>
              <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-3">
                {{ feature.title }}
              </h3>
              <p class="text-slate-600 dark:text-slate-400">
                {{ feature.desc }}
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- How It Works -->
      <section class="py-20 px-6 bg-slate-50 dark:bg-slate-900">
        <div class="max-w-5xl mx-auto text-center">
          <h2 class="text-3xl font-bold text-slate-900 dark:text-white mb-16">
            How It Works
          </h2>
          <div class="grid md:grid-cols-3 gap-12 relative">
            <div
              *ngFor="let step of steps; let i = index"
              class="flex flex-col items-center space-y-4 relative z-10"
            >
              <div
                class="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-4 shadow-xl shadow-blue-500/40"
              >
                {{ i + 1 }}
              </div>
              <h3 class="text-xl font-bold text-slate-900 dark:text-white">
                {{ step.title }}
              </h3>
              <p class="text-slate-600 dark:text-slate-400">{{ step.desc }}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [],
})
export class HomeComponent implements OnInit {
  features = [
    {
      icon: '⚡',
      title: 'Real-time',
      desc: 'Instant transcription as you speak with zero lag.',
    },
    {
      icon: '🌐',
      title: 'Multi-language',
      desc: 'Support for dozens of languages across the globe.',
    },
    {
      icon: '📱',
      title: 'PWA Ready',
      desc: 'Install it on your device and use it offline anywhere.',
    },
    {
      icon: '📥',
      title: 'Easy Export',
      desc: 'Copy your text or download as a file with one click.',
    },
    {
      icon: '🔒',
      title: 'Privacy-First',
      desc: 'Processing happens in your browser. Your data stays yours.',
    },
    {
      icon: '🎨',
      title: 'Custom Themes',
      desc: 'Beautiful themes to match your environment.',
    },
  ];

  steps = [
    {
      title: 'Allow Mic',
      desc: 'Grant microphone access when prompted by the browser.',
    },
    {
      title: 'Start Speaking',
      desc: 'Click the record button and speak naturally into your mic.',
    },
    {
      title: 'Get Result',
      desc: 'Review your transcription and export it to your desired format.',
    },
  ];

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/transcriber']);
    }
  }
}
