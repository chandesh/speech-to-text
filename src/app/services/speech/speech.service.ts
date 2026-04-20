import { Injectable, signal, computed, inject, OnDestroy } from "@angular/core";
import { Subject, takeUntil } from "rxjs";
import {
  SpeechProvider,
  TranscriptResult,
  SpeechError,
  RecordingState,
} from "./speech-provider.interface";
import { BrowserSpeechService } from "./browser-speech.service";

export type ThemeFamily = "gruvbox" | "glassmorphic" | "oceanic";
export type ThemeMode = "light" | "dark";

@Injectable({
  providedIn: "root",
})
export class SpeechService implements OnDestroy {
  private speechProvider: SpeechProvider;
  private destroy$ = new Subject<void>();

  private finalTextSignal = signal("");
  private interimTextSignal = signal("");
  private stateSignal = signal<RecordingState>("idle");
  private errorSignal = signal<SpeechError | null>(null);
  private isSupportedSignal = signal(true);
  private languageSignal = signal("en-US");
  private themeFamilySignal = signal<ThemeFamily>("gruvbox");
  private themeModeSignal = signal<ThemeMode>("dark");

  displayText = computed(
    () => this.finalTextSignal() + this.interimTextSignal(),
  );
  wordCount = computed(() => {
    const text = this.finalTextSignal().trim();
    return text ? text.split(/\s+/).length : 0;
  });

  activeTheme = computed(() => {
    const family = this.themeFamilySignal();
    const mode = this.themeModeSignal();
    return `${family}-${mode}`;
  });

  constructor() {
    this.speechProvider = inject(BrowserSpeechService);
    this.initializeFromStorage();
    this.subscribeToProvider();
  }

  private initializeFromStorage(): void {
    const savedLang = localStorage.getItem("voice-to-text-lang");
    const savedTheme = localStorage.getItem("voice-to-text-theme");

    if (savedLang) {
      this.languageSignal.set(savedLang);
    }

    if (savedTheme) {
      // Try to parse the theme key format (family-mode)
      const parts = savedTheme.split('-');
      if (parts.length === 2 && (parts[1] === 'light' || parts[1] === 'dark')) {
        // Validate that the family is one of our supported families
        const validFamilies: ThemeFamily[] = ["gruvbox", "glassmorphic", "oceanic"];
        if (validFamilies.includes(parts[0] as ThemeFamily)) {
          this.themeFamilySignal.set(parts[0] as ThemeFamily);
          this.themeModeSignal.set(parts[1] as ThemeMode);
        } else {
          // Fallback to default
          this.themeFamilySignal.set("gruvbox");
          this.themeModeSignal.set("dark");
        }
      } else {
        // Handle legacy format or invalid format
        this.themeFamilySignal.set("gruvbox");
        this.themeModeSignal.set("dark");
      }
    } else {
      this.themeFamilySignal.set("gruvbox");
      this.themeModeSignal.set("dark");
    }
    
    this.applyTheme(this.activeTheme());
  }

  private applyTheme(themeKey: string): void {
    const root = document.documentElement;
    // Remove all theme classes (more comprehensive approach)
    const themeClasses = Array.from(root.classList).filter(cls => cls.startsWith('theme-'));
    root.classList.remove(...themeClasses);
    
    // Also remove the generic dark class if present
    root.classList.remove("dark");

    // Add the new theme class
    const className = `theme-${themeKey}`;
    root.classList.add(className);
    
    // Also apply the theme to the body element to ensure it takes effect
    document.body.className = document.body.className.replace(/theme-\S+/g, '') + ' ' + className;
  }

  private subscribeToProvider(): void {
    this.speechProvider.transcript$
      .pipe(takeUntil(this.destroy$))
      .subscribe((result: TranscriptResult) => {
        if (result.isFinal) {
          this.finalTextSignal.set(result.text);
          this.interimTextSignal.set("");
        } else {
          this.interimTextSignal.set(
            result.text.replace(this.finalTextSignal(), ""),
          );
        }
      });

    this.speechProvider.error$
      .pipe(takeUntil(this.destroy$))
      .subscribe((error: SpeechError) => {
        this.errorSignal.set(error);
        this.stateSignal.set("error");
      });

    this.speechProvider.isRecording$
      .pipe(takeUntil(this.destroy$))
      .subscribe((isRecording: boolean) => {
        this.stateSignal.set(isRecording ? "recording" : "idle");
      });

    this.speechProvider.isSupported$
      .pipe(takeUntil(this.destroy$))
      .subscribe((supported: boolean) => {
        this.isSupportedSignal.set(supported);
        if (!supported) {
          this.stateSignal.set("unsupported");
        }
      });
  }

  startRecording(): void {
    this.errorSignal.set(null);
    this.stateSignal.set("requesting");
    this.speechProvider.startRecording();
  }

  stopRecording(): void {
    this.speechProvider.stopRecording();
  }

  clearText(): void {
    this.finalTextSignal.set("");
    this.interimTextSignal.set("");
    if ("resetTranscript" in this.speechProvider) {
      (
        this.speechProvider as { resetTranscript?: () => void }
      ).resetTranscript?.();
    }
  }

  async copyToClipboard(): Promise<boolean> {
    const text = this.displayText();
    if (!text) return false;

    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  }

  downloadText(): void {
    const text = this.displayText();
    if (!text) return;

    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transcription-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  setLanguage(lang: string): void {
    this.languageSignal.set(lang);
    localStorage.setItem("voice-to-text-lang", lang);
  }

  setThemeFamily(family: ThemeFamily): void {
    this.themeFamilySignal.set(family);
    this.updateThemeStorage();
  }

  setThemeMode(mode: ThemeMode): void {
    this.themeModeSignal.set(mode);
    this.updateThemeStorage();
  }

  private updateThemeStorage(): void {
    const themeKey = this.activeTheme();
    localStorage.setItem("voice-to-text-theme", themeKey);
    this.applyTheme(themeKey);
  }

  get state(): RecordingState {
    return this.stateSignal();
  }

  get error(): SpeechError | null {
    return this.errorSignal();
  }

  get language(): string {
    return this.languageSignal();
  }

  get themeFamily(): ThemeFamily {
    return this.themeFamilySignal();
  }

  get themeMode(): ThemeMode {
    return this.themeModeSignal();
  }

  get activeThemeValue(): string {
    return this.activeTheme();
  }

  get finalText(): string {
    return this.finalTextSignal();
  }

  get interimText(): string {
    return this.interimTextSignal();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
