import { Component, inject } from '@angular/core';
import { NgIf } from '@angular/common';
import { SpeechService } from '../../services/speech/speech.service';

@Component({
  selector: 'app-transcription',
  standalone: true,
  imports: [NgIf],
  templateUrl: './transcription.component.html',
  styleUrls: ['./transcription.component.scss']
})
export class TranscriptionComponent {
  speechService = inject(SpeechService);
}
