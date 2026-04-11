import { TestBed } from '@angular/core/testing';
import { vi, describe, it, beforeEach, expect } from 'vitest';
import { BrowserSpeechService } from './browser-speech.service';

describe('BrowserSpeechService', () => {
  let service: BrowserSpeechService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BrowserSpeechService);
  });

  afterEach(() => {
    service.ngOnDestroy();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should expose transcript$ observable', () => {
    expect(service.transcript$).toBeTruthy();
  });

  it('should expose error$ observable', () => {
    expect(service.error$).toBeTruthy();
  });

  it('should expose isRecording$ observable', () => {
    expect(service.isRecording$).toBeTruthy();
  });

  it('should expose isSupported$ observable', () => {
    expect(service.isSupported$).toBeTruthy();
  });

  it('should stop recording without error when not recording', () => {
    expect(() => service.stopRecording()).not.toThrow();
  });

  it('should reset transcript without error', () => {
    expect(() => service.resetTranscript()).not.toThrow();
  });

  it('should set language without error', () => {
    expect(() => service.setLanguage('es-ES')).not.toThrow();
  });

  it('should clean up on destroy', () => {
    expect(() => service.ngOnDestroy()).not.toThrow();
  });

  it('should not throw when startRecording is called without Speech API', () => {
    expect(() => service.startRecording()).not.toThrow();
  });
});
