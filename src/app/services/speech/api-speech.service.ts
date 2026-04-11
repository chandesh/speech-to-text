import { Injectable, OnDestroy } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { SpeechProvider, TranscriptResult, SpeechError } from './speech-provider.interface';

const API_CONFIG = {
  DEFAULT_BASE_URL: 'http://localhost:8080',
  STORAGE_KEY: 'voice-to-text-api-url',
  AUDIO_TYPE: 'audio/webm',
  CHUNK_INTERVAL: 1000,
};

@Injectable({
  providedIn: 'root',
})
export class ApiSpeechService implements SpeechProvider, OnDestroy {
  private transcriptSubject = new Subject<TranscriptResult>();
  private errorSubject = new Subject<SpeechError>();
  private isRecordingSubject = new Subject<boolean>();
  private isSupportedSubject = new Subject<boolean>();
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];

  constructor() {
    this.isSupportedSubject.next(true);
  }

  get transcript$(): Observable<TranscriptResult> {
    return this.transcriptSubject.asObservable();
  }

  get error$(): Observable<SpeechError> {
    return this.errorSubject.asObservable();
  }

  get isRecording$(): Observable<boolean> {
    return this.isRecordingSubject.asObservable();
  }

  get isSupported$(): Observable<boolean> {
    return this.isSupportedSubject.asObservable();
  }

  async startRecording(): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);
      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event: BlobEvent) => {
        this.audioChunks.push(event.data);
      };

      this.mediaRecorder.onstop = async () => {
        await this.sendAudioToBackend();
        stream.getTracks().forEach((track) => track.stop());
      };

      this.mediaRecorder.start(API_CONFIG.CHUNK_INTERVAL);
      this.isRecordingSubject.next(true);
    } catch (err) {
      this.errorSubject.next({
        code: 'microphone-error',
        message: err instanceof Error ? err.message : 'Failed to access microphone',
      });
    }
  }

  stopRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
      this.isRecordingSubject.next(false);
    }
  }

  private async sendAudioToBackend(): Promise<void> {
    const baseUrl = localStorage.getItem(API_CONFIG.STORAGE_KEY) || API_CONFIG.DEFAULT_BASE_URL;

    const audioBlob = new Blob(this.audioChunks, { type: API_CONFIG.AUDIO_TYPE });
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');

    try {
      const response = await fetch(`${baseUrl}/transcribe`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      this.transcriptSubject.next({
        text: data.transcript || '',
        isFinal: true,
        timestamp: Date.now(),
      });
    } catch (err) {
      this.errorSubject.next({
        code: 'api-error',
        message: err instanceof Error ? err.message : 'Failed to transcribe audio',
      });
    }
  }

  ngOnDestroy(): void {
    this.stopRecording();
    this.transcriptSubject.complete();
    this.errorSubject.complete();
    this.isRecordingSubject.complete();
    this.isSupportedSubject.complete();
  }
}
