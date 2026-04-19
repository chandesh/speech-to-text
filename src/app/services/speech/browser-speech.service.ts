import { Injectable, OnDestroy } from "@angular/core";
import { Observable, Subject } from "rxjs";
import {
  SpeechProvider,
  TranscriptResult,
  SpeechError,
} from "./speech-provider.interface";

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  0: SpeechRecognitionAlternative;
  length: number;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResult[];
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent {
  error: string;
  message?: string;
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

declare const webkitSpeechRecognition: unknown;

@Injectable({
  providedIn: "root",
})
export class BrowserSpeechService implements SpeechProvider, OnDestroy {
  private recognition: SpeechRecognitionInstance | null = null;
  private transcriptSubject = new Subject<TranscriptResult>();
  private errorSubject = new Subject<SpeechError>();
  private isRecordingSubject = new Subject<boolean>();
  private isSupportedSubject = new Subject<boolean>();
  private isCurrentlyRecording = false;
  private finalTranscript = "";

  private static readonly ERROR_MESSAGES: Record<string, string> = {
    "no-speech": "No speech was detected. Please try again.",
    "audio-capture":
      "No microphone was found. Please ensure a microphone is connected.",
    "not-allowed":
      "Microphone permission was denied. Please allow microphone access.",
    network:
      "Speech recognition service is unavailable. Please check your internet connection.",
    aborted: "Speech recognition was aborted.",
    "service-not-allowed": "Speech recognition service is not allowed.",
  };

  constructor() {
    this.checkSupport();
  }

  private checkSupport(): void {
    const win = window as unknown as {
      SpeechRecognition?: unknown;
      webkitSpeechRecognition?: unknown;
    };
    const supported = !!(win.SpeechRecognition || win.webkitSpeechRecognition);
    this.isSupportedSubject.next(supported);
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

  startRecording(): void {
    if (this.isCurrentlyRecording) {
      return;
    }

    const win = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionInstance;
      webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
    };
    const SpeechRecognitionAPI =
      win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      this.errorSubject.next({
        code: "not-supported",
        message:
          "Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.",
      });
      return;
    }

    this.recognition = new SpeechRecognitionAPI();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang =
      localStorage.getItem("voice-to-text-lang") || "en-US";

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;
        if (result.isFinal) {
          this.finalTranscript += transcript;
          this.transcriptSubject.next({
            text: this.finalTranscript,
            isFinal: true,
            timestamp: Date.now(),
          });
        } else {
          interimTranscript += transcript;
          this.transcriptSubject.next({
            text: this.finalTranscript + interimTranscript,
            isFinal: false,
            timestamp: Date.now(),
          });
        }
      }
    };

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      this.errorSubject.next({
        code: event.error,
        message:
          BrowserSpeechService.ERROR_MESSAGES[event.error] ||
          `An error occurred: ${event.error}`,
      });

      if (event.error === "not-allowed") {
        this.isCurrentlyRecording = false;
        this.isRecordingSubject.next(false);
      }
    };

    this.recognition.onend = () => {
      if (this.isCurrentlyRecording) {
        this.recognition?.start();
      } else {
        this.isRecordingSubject.next(false);
      }
    };

    try {
      this.recognition.start();
      this.isCurrentlyRecording = true;
      this.finalTranscript = "";
      this.isRecordingSubject.next(true);
    } catch {
      this.errorSubject.next({
        code: "start-failed",
        message: "Failed to start recording",
      });
    }
  }

  stopRecording(): void {
    if (this.recognition && this.isCurrentlyRecording) {
      this.isCurrentlyRecording = false;
      this.recognition.stop();
      this.isRecordingSubject.next(false);
    }
  }

  resetTranscript(): void {
    this.finalTranscript = "";
  }

  setLanguage(lang: string): void {
    if (this.recognition) {
      this.recognition.lang = lang;
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
