import { Injectable, signal, computed, inject, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import {
  SpeechProvider,
  TranscriptResult,
  SpeechError,
  RecordingState,
} from './speech-provider.interface';
import { BrowserSpeechService } from './browser-speech.service';

export type Theme = 'gruvbox' | 'glassmorphic' | 'light' | 'dark';

@Injectable({
  providedIn: 'root',
})
export class SpeechService implements OnDestroy {
  private speechProvider: SpeechProvider;
  private destroy$ = new Subject<void>();

  private finalTextSignal = signal('');
  private interimTextSignal = signal('');
  private stateSignal = signal<RecordingState>('idle');
  private errorSignal = signal<SpeechError | null>(null);
  private isSupportedSignal = signal(true);
  private languageSignal = signal('en-US');
  private themeSignal = signal<Theme>('gruvbox');

  displayText = computed(() => this.finalTextSignal() + this.interimTextSignal());
  wordCount = computed(() => {
    const text = this.finalTextSignal().trim();
    return text ? text.split(/\s+/).length : 0;
  });

  constructor() {
    this.speechProvider = inject(BrowserSpeechService);
    this.initializeFromStorage();
    this.subscribeToProvider();
  }

  private initializeFromStorage(): void {
    const savedLang = localStorage.getItem('voice-to-text-lang');
    const savedTheme = localStorage.getItem('voice-to-text-theme') as Theme | null;

    if (savedLang) {
      this.languageSignal.set(savedLang);
    }

    if (savedTheme) {
      this.themeSignal.set(savedTheme);
      this.applyTheme(savedTheme);
    } else {
      this.applyTheme('gruvbox');
    }
  }

  private applyTheme(theme: Theme): void {
    const root = document.documentElement;
    root.classList.remove(
      'dark',
      'theme-gruvbox',
      'theme-glassmorphic',
      'theme-light',
      'theme-dark',
    );

    const themeMap: Record<Theme, string> = {
      gruvbox: 'theme-gruvbox',
      glassmorphic: 'theme-glassmorphic',
      light: 'theme-light',
      dark: 'theme-dark',
    };

    root.classList.add(themeMap[theme]);
  }

  private subscribeToProvider(): void {
    this.speechProvider.transcript$
      .pipe(takeUntil(this.destroy$))
      .subscribe((result: TranscriptResult) => {
        if (result.isFinal) {
          this.finalTextSignal.set(result.text);
          this.interimTextSignal.set('');
        } else {
          this.interimTextSignal.set(result.text.replace(this.finalTextSignal(), ''));
        }
      });

    this.speechProvider.error$.pipe(takeUntil(this.destroy$)).subscribe((error: SpeechError) => {
      this.errorSignal.set(error);
      this.stateSignal.set('error');
    });

    this.speechProvider.isRecording$
      .pipe(takeUntil(this.destroy$))
      .subscribe((isRecording: boolean) => {
        this.stateSignal.set(isRecording ? 'recording' : 'idle');
      });

    this.speechProvider.isSupported$
      .pipe(takeUntil(this.destroy$))
      .subscribe((supported: boolean) => {
        this.isSupportedSignal.set(supported);
        if (!supported) {
          this.stateSignal.set('unsupported');
        }
      });
  }

  startRecording(): void {
    this.errorSignal.set(null);
    this.stateSignal.set('requesting');
    this.speechProvider.startRecording();
  }

  stopRecording(): void {
    this.speechProvider.stopRecording();
  }

  clearText(): void {
    this.finalTextSignal.set('');
    this.interimTextSignal.set('');
    if ('resetTranscript' in this.speechProvider) {
      (this.speechProvider as { resetTranscript?: () => void }).resetTranscript?.();
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

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcription-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  setLanguage(lang: string): void {
    this.languageSignal.set(lang);
    localStorage.setItem('voice-to-text-lang', lang);
  }

  setTheme(theme: Theme): void {
    this.themeSignal.set(theme);
    localStorage.setItem('voice-to-text-theme', theme);
    this.applyTheme(theme);
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

  get theme(): Theme {
    return this.themeSignal();
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
