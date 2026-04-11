import {
  Component,
  inject,
  ElementRef,
  ViewChild,
  OnDestroy,
  signal,
  computed,
} from '@angular/core';
import { NgIf } from '@angular/common';
import { SpeechService } from '../../services/speech/speech.service';
import { RecordingState } from '../../services/speech/speech-provider.interface';

const WAVEFORM_CONFIG = {
  FFT_SIZE: 64,
  BAR_WIDTH: 4,
  BAR_GAP: 2,
  BAR_RADIUS: 2,
  MAX_FREQ_VALUE: 255,
  HEIGHT_MULTIPLIER: 0.8,
};

const STATUS_MESSAGES: Record<RecordingState, { default: string; recording: string }> = {
  idle: { default: 'Tap to start recording', recording: '' },
  requesting: { default: 'Requesting microphone access...', recording: '' },
  recording: { default: '', recording: 'Recording... Tap to stop' },
  error: { default: 'Error occurred. Tap to retry', recording: '' },
  unsupported: { default: 'Speech recognition not supported', recording: '' },
};

@Component({
  selector: 'app-recorder',
  standalone: true,
  imports: [NgIf],
  templateUrl: './recorder.component.html',
  styleUrls: ['./recorder.component.scss'],
})
export class RecorderComponent implements OnDestroy {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  speechService = inject(SpeechService);

  isRecording = computed(() => this.speechService.state === 'recording');
  statusText = computed(() => {
    const state = this.speechService.state;
    if (state === 'recording') {
      return STATUS_MESSAGES[state].recording;
    }
    return STATUS_MESSAGES[state].default;
  });
  ariaLabel = computed(() => (this.isRecording() ? 'Stop recording' : 'Start recording'));

  private animationId: number | null = null;
  private audioContext: AudioContext | null = null;
  private analyzer: AnalyserNode | null = null;
  private dataArray: Uint8Array | null = null;

  async toggleRecording(): Promise<void> {
    if (this.speechService.state === 'recording') {
      this.speechService.stopRecording();
      this.stopVisualization();
    } else {
      this.speechService.startRecording();
      await this.startVisualization();
    }
  }

  private async startVisualization(): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioContext = new AudioContextClass();

      const source = this.audioContext.createMediaStreamSource(stream);
      this.analyzer = this.audioContext.createAnalyser();
      this.analyzer.fftSize = WAVEFORM_CONFIG.FFT_SIZE;
      source.connect(this.analyzer);

      this.dataArray = new Uint8Array(this.analyzer.frequencyBinCount);
      this.draw();
    } catch {
      // Visualization failure is non-critical - recording continues
    }
  }

  private draw = (): void => {
    if (!this.analyzer || !this.canvasRef || !this.dataArray) return;

    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    this.analyzer.getByteFrequencyData(this.dataArray as Uint8Array<ArrayBuffer>);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const { BAR_WIDTH, BAR_GAP, BAR_RADIUS, MAX_FREQ_VALUE, HEIGHT_MULTIPLIER } = WAVEFORM_CONFIG;
    const centerX = canvas.width / 2;
    const primaryColor =
      getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim() ||
      '#fb4934';

    ctx.fillStyle = primaryColor;

    this.dataArray.forEach((value: number, i: number) => {
      const height = (value / MAX_FREQ_VALUE) * canvas.height * HEIGHT_MULTIPLIER;
      const x =
        centerX + i * (BAR_WIDTH + BAR_GAP) - (this.dataArray!.length * (BAR_WIDTH + BAR_GAP)) / 2;
      ctx.beginPath();
      ctx.roundRect(x, (canvas.height - height) / 2, BAR_WIDTH, height, BAR_RADIUS);
      ctx.fill();
    });

    this.animationId = requestAnimationFrame(this.draw);
  };

  private stopVisualization(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }

  ngOnDestroy(): void {
    this.stopVisualization();
  }
}
