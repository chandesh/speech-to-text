import { Component, inject, HostListener } from "@angular/core";
import { NgIf, NgFor } from "@angular/common";
import {
  SpeechService,
  ThemeFamily,
  ThemeMode,
} from "../../services/speech/speech.service";

interface Language {
  code: string;
  name: string;
}

const LANGUAGES: Language[] = [
  { code: "en-US", name: "English (US)" },
  { code: "en-GB", name: "English (UK)" },
  { code: "es-ES", name: "Spanish" },
  { code: "fr-FR", name: "French" },
  { code: "de-DE", name: "German" },
  { code: "it-IT", name: "Italian" },
  { code: "pt-BR", name: "Portuguese (Brazil)" },
  { code: "ja-JP", name: "Japanese" },
  { code: "ko-KR", name: "Korean" },
  { code: "zh-CN", name: "Chinese (Simplified)" },
  { code: "hi-IN", name: "Hindi" },
  { code: "ar-SA", name: "Arabic" },
  { code: "ru-RU", name: "Russian" },
  { code: "nl-NL", name: "Dutch" },
  { code: "sv-SE", name: "Swedish" },
  { code: "da-DK", name: "Danish" },
  { code: "no-NO", name: "Norwegian" },
  { code: "fi-FI", name: "Finnish" },
  { code: "pl-PL", name: "Polish" },
  { code: "tr-TR", name: "Turkish" },
];

const THEME_FAMILIES: ThemeFamily[] = ["gruvbox", "glassmorphic", "oceanic"];

const THEME_MODES: ThemeMode[] = ["light", "dark"];

@Component({
  selector: "app-settings",
  standalone: true,
  imports: [NgIf, NgFor],
  templateUrl: "./settings.component.html",
  styleUrls: ["./settings.component.scss"],
})
export class SettingsComponent {
  speechService = inject(SpeechService);
  languages = LANGUAGES;
  themeFamilies = THEME_FAMILIES;
  themeModes = THEME_MODES;
  isOpen = false;

  @HostListener("document:keydown.escape")
  onEscapeKey(): void {
    if (this.isOpen) {
      this.close();
    }
  }

  @HostListener("document:mousedown", ["$event"])
  onDocumentClick(event: MouseEvent): void {
    if (!this.isOpen) return;

    const target = event.target as HTMLElement;
    if (!target.closest("app-settings")) {
      this.close();
    }
  }

  changeLanguage(code: string): void {
    this.speechService.setLanguage(code);
  }

  setThemeFamily(family: ThemeFamily): void {
    this.speechService.setThemeFamily(family);
  }

  setThemeMode(mode: ThemeMode): void {
    this.speechService.setThemeMode(mode);
  }

  togglePanel(): void {
    this.isOpen = !this.isOpen;
  }

  close(): void {
    this.isOpen = false;
  }
}
