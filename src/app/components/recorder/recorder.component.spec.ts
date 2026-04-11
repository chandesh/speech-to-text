import { TestBed } from '@angular/core/testing';
import { vi, describe, it, beforeEach, expect } from 'vitest';
import { RecorderComponent } from './recorder.component';
import { SpeechService } from '../../services/speech/speech.service';
import { BrowserSpeechService } from '../../services/speech/browser-speech.service';
import { Component } from '@angular/core';

@Component({
  selector: 'app-host',
  template: '<app-recorder></app-recorder>',
  standalone: true,
  imports: [RecorderComponent]
})
class HostComponent {}

describe('RecorderComponent', () => {
  let component: RecorderComponent;

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

  it('should return idle status text', () => {
    expect(component.getStatusText()).toContain('Tap to start');
  });

  it('should return correct aria label for idle state', () => {
    expect(component.getAriaLabel()).toBe('Start recording');
  });
});
