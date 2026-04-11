import { TestBed } from '@angular/core/testing';
import { vi, describe, it, beforeEach, afterEach, expect } from 'vitest';
import { SpeechService } from './speech.service';
import { BrowserSpeechService } from './browser-speech.service';

describe('SpeechService', () => {
  let service: SpeechService;

  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
    TestBed.configureTestingModule({
      providers: [BrowserSpeechService]
    });
    service = TestBed.inject(SpeechService);
  });

  afterEach(() => {
    service.ngOnDestroy();
    localStorage.clear();
    document.documentElement.classList.remove('dark');
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

  it('should support browser provider by default', () => {
    expect(service.provider).toBe('browser');
  });

  it('should have dark mode disabled by default', () => {
    expect(service.darkMode).toBe(false);
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

  it('should toggle dark mode', () => {
    service.toggleDarkMode();
    expect(service.darkMode).toBe(true);
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    service.toggleDarkMode();
    expect(service.darkMode).toBe(false);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('should restore dark mode from localStorage', () => {
    localStorage.setItem('voice-to-text-dark-mode', 'true');
    document.documentElement.classList.add('dark');
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [BrowserSpeechService]
    });
    const restoredService = TestBed.inject(SpeechService);
    expect(restoredService.darkMode).toBe(true);
    restoredService.ngOnDestroy();
  });

  it('should restore language from localStorage', () => {
    localStorage.setItem('voice-to-text-lang', 'fr-FR');
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [BrowserSpeechService]
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
