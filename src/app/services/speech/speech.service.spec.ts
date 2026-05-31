import { TestBed } from '@angular/core/testing';
import { vi, describe, it, beforeEach, afterEach, expect } from 'vitest';
import { SpeechService } from './speech.service';
import { BrowserSpeechService } from './browser-speech.service';

describe('SpeechService', () => {
  let service: SpeechService;

  function removeThemeClasses() {
    const classes = Array.from(document.documentElement.classList).filter((c) =>
      c.startsWith('theme-'),
    );
    document.documentElement.classList.remove(...classes);
  }

  beforeEach(() => {
    localStorage.clear();
    removeThemeClasses();
    TestBed.configureTestingModule({
      providers: [BrowserSpeechService],
    });
    service = TestBed.inject(SpeechService);
  });

  afterEach(() => {
    service.ngOnDestroy();
    localStorage.clear();
    removeThemeClasses();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have initial state as idle', () => {
    expect(service.state).toBe('idle');
  });

  it('should have empty final text initially', () => {
    expect(service.finalText).toBe('');
  });

  it('should have empty interim text initially', () => {
    expect(service.interimText).toBe('');
  });

  it('should have empty display text initially', () => {
    expect(service.displayText()).toBe('');
  });

  it('should have zero word count initially', () => {
    expect(service.wordCount()).toBe(0);
  });

  it('should have dark mode by default', () => {
    expect(service.themeMode).toBe('dark');
  });

  it('should clear text', () => {
    service.clearText();
    expect(service.finalText).toBe('');
    expect(service.interimText).toBe('');
  });

  it('should set language and persist to localStorage', () => {
    service.setLanguage('es-ES');
    expect(service.language).toBe('es-ES');
    expect(localStorage.getItem('voice-to-text-lang')).toBe('es-ES');
  });

  it('should toggle theme mode', () => {
    service.setThemeMode('light');
    expect(service.themeMode).toBe('light');
    expect(
      document.documentElement.classList.contains('theme-gruvbox-light'),
    ).toBe(true);

    service.setThemeMode('dark');
    expect(service.themeMode).toBe('dark');
    expect(
      document.documentElement.classList.contains('theme-gruvbox-dark'),
    ).toBe(true);
  });

  it('should restore theme from localStorage', () => {
    localStorage.setItem('voice-to-text-theme', 'oceanic-light');
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [BrowserSpeechService],
    });
    const restoredService = TestBed.inject(SpeechService);
    expect(restoredService.themeFamily).toBe('oceanic');
    expect(restoredService.themeMode).toBe('light');
    restoredService.ngOnDestroy();
  });

  it('should restore language from localStorage', () => {
    localStorage.setItem('voice-to-text-lang', 'fr-FR');
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [BrowserSpeechService],
    });
    const restoredService = TestBed.inject(SpeechService);
    expect(restoredService.language).toBe('fr-FR');
    restoredService.ngOnDestroy();
  });

  it('should download text without error when empty', () => {
    expect(() => service.downloadText()).not.toThrow();
  });

  it('should return false when copying empty text', async () => {
    const result = await service.copyToClipboard();
    expect(result).toBe(false);
  });
});
