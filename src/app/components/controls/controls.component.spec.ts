import { TestBed } from '@angular/core/testing';
import { vi, describe, it, beforeEach, expect } from 'vitest';
import { ControlsComponent } from './controls.component';
import { SpeechService } from '../../services/speech/speech.service';
import { BrowserSpeechService } from '../../services/speech/browser-speech.service';
import { Component } from '@angular/core';

@Component({
  selector: 'app-host',
  template: '<app-controls></app-controls>',
  standalone: true,
  imports: [ControlsComponent]
})
class HostComponent {}

describe('ControlsComponent', () => {
  let component: ControlsComponent;

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

  it('should return false for canDownload when no text', () => {
    expect(component.canDownload()).toBe(false);
  });

  it('should initialize copyFeedback as false', () => {
    expect(component.copyFeedback()).toBe(false);
  });
});
