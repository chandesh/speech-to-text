import { Component, inject } from '@angular/core';
import {
  SpeechService,
  ThemeMode,
  ThemeFamily,
} from '../../../services/speech/speech.service';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-app-settings-page',
  standalone: true,
  imports: [NgFor],
  template: `
    <div class="max-w-lg">
      <h2 class="text-xl font-semibold text-on-surface mb-4">App Settings</h2>
      <p class="text-sm text-on-surface-variant mb-6">
        Configure theme, language, and other preferences.
      </p>

      <div class="space-y-6">
        <div>
          <label class="block text-sm font-medium text-on-surface mb-2"
            >Language</label
          >
          <select
            (change)="speechService.setLanguage($any($event.target).value)"
            [value]="speechService.language"
            class="w-full px-3 py-2 bg-surface border border-outline rounded-lg text-sm text-on-surface focus:outline-none focus:border-primary"
          >
            <option *ngFor="let lang of languages" [value]="lang.code">
              {{ lang.name }}
            </option>
          </select>
        </div>

        <div>
          <span class="block text-sm font-medium text-on-surface mb-2"
            >Theme Mode</span
          >
          <div class="flex gap-2">
            <button
              *ngFor="let mode of themeModes"
              (click)="speechService.setThemeMode(mode)"
              [class]="
                speechService.themeMode === mode
                  ? 'bg-primary text-background border-primary'
                  : 'bg-surface text-on-surface-variant border-outline hover:border-primary'
              "
              class="flex-1 px-3 py-2 text-xs font-medium uppercase tracking-wider rounded border transition-all capitalize"
            >
              {{ mode }}
            </button>
          </div>
        </div>

        <div>
          <span class="block text-sm font-medium text-on-surface mb-2"
            >Theme Family</span
          >
          <div class="grid grid-cols-2 gap-2">
            <button
              *ngFor="let family of themeFamilies"
              (click)="speechService.setThemeFamily(family)"
              [class]="
                speechService.themeFamily === family
                  ? 'bg-primary text-background border-primary'
                  : 'bg-surface text-on-surface-variant border-outline hover:border-primary'
              "
              class="px-3 py-2 text-xs font-medium uppercase tracking-wider rounded border transition-all capitalize"
            >
              {{ family }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [':host { display: block; }'],
})
export class AppSettingsPageComponent {
  speechService = inject(SpeechService);
  languages = [
    { code: 'en-US', name: 'English (US)' },
    { code: 'en-GB', name: 'English (UK)' },
    { code: 'es-ES', name: 'Spanish' },
    { code: 'fr-FR', name: 'French' },
    { code: 'de-DE', name: 'German' },
    { code: 'it-IT', name: 'Italian' },
    { code: 'pt-BR', name: 'Portuguese (Brazil)' },
    { code: 'ja-JP', name: 'Japanese' },
    { code: 'ko-KR', name: 'Korean' },
    { code: 'zh-CN', name: 'Chinese (Simplified)' },
    { code: 'hi-IN', name: 'Hindi' },
    { code: 'ar-SA', name: 'Arabic' },
    { code: 'ru-RU', name: 'Russian' },
    { code: 'nl-NL', name: 'Dutch' },
    { code: 'sv-SE', name: 'Swedish' },
    { code: 'da-DK', name: 'Danish' },
    { code: 'no-NO', name: 'Norwegian' },
    { code: 'fi-FI', name: 'Finnish' },
    { code: 'pl-PL', name: 'Polish' },
    { code: 'tr-TR', name: 'Turkish' },
  ];
  themeFamilies: ThemeFamily[] = ['gruvbox', 'glassmorphic', 'oceanic'];
  themeModes: ThemeMode[] = ['light', 'dark'];
}
