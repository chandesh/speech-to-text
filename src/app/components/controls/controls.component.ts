import { Component, inject, signal } from '@angular/core';
import { NgIf } from '@angular/common';
import { SpeechService } from '../../services/speech/speech.service';

const API_CONFIG = {
  ENDPOINT: '/api/transcribe',
  TIMEOUTS: {
    COPY_FEEDBACK: 2000,
    SUCCESS_FEEDBACK: 3000,
    ERROR_FEEDBACK: 5000,
  },
};

@Component({
  selector: 'app-controls',
  standalone: true,
  imports: [NgIf],
  templateUrl: './controls.component.html',
  styleUrls: ['./controls.component.scss'],
})
export class ControlsComponent {
  speechService = inject(SpeechService);
  copyFeedback = signal(false);
  isSubmitting = signal(false);
  submitSuccess = signal(false);
  submitError = signal<string | null>(null);

  canDownload(): boolean {
    return this.speechService.displayText().length > 0;
  }

  async copyText(): Promise<void> {
    const success = await this.speechService.copyToClipboard();
    if (success) {
      this.copyFeedback.set(true);
      setTimeout(() => this.copyFeedback.set(false), API_CONFIG.TIMEOUTS.COPY_FEEDBACK);
    }
  }

  clearText(): void {
    this.speechService.clearText();
  }

  downloadText(): void {
    this.speechService.downloadText();
  }

  async submitText(): Promise<void> {
    const text = this.speechService.displayText();
    if (!text || text.trim().length === 0) {
      return;
    }

    this.isSubmitting.set(true);
    this.submitError.set(null);
    this.submitSuccess.set(false);

    try {
      const response = await fetch(API_CONFIG.ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          language: this.speechService.language,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      this.submitSuccess.set(true);
      setTimeout(() => this.submitSuccess.set(false), API_CONFIG.TIMEOUTS.SUCCESS_FEEDBACK);
    } catch (err) {
      this.submitError.set(err instanceof Error ? err.message : 'Submission failed');
      setTimeout(() => this.submitError.set(null), API_CONFIG.TIMEOUTS.ERROR_FEEDBACK);
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
