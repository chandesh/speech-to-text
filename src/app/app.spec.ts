import { TestBed } from '@angular/core/testing';
import { vi, describe, it, beforeEach, expect } from 'vitest';
import { App } from './app';
import { SpeechService } from './services/speech/speech.service';
import { BrowserSpeechService } from './services/speech/browser-speech.service';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [BrowserSpeechService]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should have speech service injected', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app.speechService).toBeTruthy();
  });

  it('should render header with Voice to Text title', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Voice to Text');
  });

  it('should toggle settings', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app.showSettings).toBe(false);
    app.toggleSettings();
    expect(app.showSettings).toBe(true);
    app.toggleSettings();
    expect(app.showSettings).toBe(false);
  });

  it('should close settings', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    app.showSettings = true;
    app.closeSettings();
    expect(app.showSettings).toBe(false);
  });
});
