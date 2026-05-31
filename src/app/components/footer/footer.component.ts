import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-footer',
  imports: [CommonModule, RouterModule],
  template: `
    <footer class="bg-background border-t border-outline px-6 py-12">
      <div
        class="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6"
      >
        <div class="flex items-center gap-2 text-sm text-on-surface-variant">
          <div
            class="w-6 h-6 bg-primary rounded flex items-center justify-center text-background text-xs font-bold"
          >
            S
          </div>
          <span>SpeechText</span>
        </div>
        <div class="flex items-center gap-6 text-sm text-on-surface-variant">
          <a routerLink="/" class="hover:text-primary transition-colors"
            >Home</a
          >
          <a
            routerLink="/transcriber"
            class="hover:text-primary transition-colors"
            >Transcriber</a
          >
          <a href="#" class="hover:text-primary transition-colors">Privacy</a>
          <a href="#" class="hover:text-primary transition-colors">Terms</a>
        </div>
        <p class="text-xs text-on-surface-variant">
          &copy; {{ year }} SpeechText. All rights reserved.
        </p>
      </div>
    </footer>
  `,
})
export class FooterComponent {
  year = new Date().getFullYear();
}
