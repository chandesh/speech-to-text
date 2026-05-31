import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-footer',
  imports: [CommonModule, RouterModule],
  template: `
    <footer
      class="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-6 py-12"
    >
      <div class="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div class="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <div class="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">S</div>
          <span>SpeechText</span>
        </div>
        <div class="flex items-center gap-6 text-sm text-slate-500 dark:text-slate-400">
          <a routerLink="/" class="hover:text-blue-600 transition-colors">Home</a>
          <a routerLink="/transcriber" class="hover:text-blue-600 transition-colors">Transcriber</a>
          <a href="#" class="hover:text-blue-600 transition-colors">Privacy</a>
          <a href="#" class="hover:text-blue-600 transition-colors">Terms</a>
        </div>
        <p class="text-xs text-slate-400 dark:text-slate-500">
          &copy; {{ year }} SpeechText. All rights reserved.
        </p>
      </div>
    </footer>
  `,
})
export class FooterComponent {
  year = new Date().getFullYear();
}
