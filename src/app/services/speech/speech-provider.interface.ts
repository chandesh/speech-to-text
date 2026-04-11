export interface TranscriptResult {
  text: string;
  isFinal: boolean;
  timestamp: number;
}

export interface SpeechError {
  code: string;
  message: string;
}

export type RecordingState = 'idle' | 'requesting' | 'recording' | 'error' | 'unsupported';

export interface SpeechProvider {
  startRecording(): void;
  stopRecording(): void;
  transcript$: import('rxjs').Observable<TranscriptResult>;
  error$: import('rxjs').Observable<SpeechError>;
  isRecording$: import('rxjs').Observable<boolean>;
  isSupported$: import('rxjs').Observable<boolean>;
}
