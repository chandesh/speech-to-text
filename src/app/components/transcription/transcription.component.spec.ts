import { TestBed } from '@angular/core/testing';
import { vi, describe, it, beforeEach, expect } from 'vitest';
import { TranscriptionComponent } from './transcription.component';
import { SpeechService } from '../../services/speech/speech.service';
import { BrowserSpeechService } from '../../services/speech/browser-speech.service';
import { Component } from '@angular/core';

@Component({
  selector: 'app-host',
  template: '<app-transcription></app-transcription>',
  standalone: true,
  imports: [TranscriptionComponent]
})
class HostComponent {}

describe('TranscriptionComponent', () => {
  let component: TranscriptionComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [BrowserSpeechService]
    });
    const fixture = TestBed.createComponent(HostComponent);
    component = fixture.debugElement.children[0].componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have speech service injected', () => {
    expect(component.speechService).toBeTruthy();
  });
});
