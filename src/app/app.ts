import { Component, inject } from '@angular/core';
import { RecorderComponent } from './components/recorder/recorder.component';
import { TranscriptionComponent } from './components/transcription/transcription.component';
import { ControlsComponent } from './components/controls/controls.component';
import { SettingsComponent } from './components/settings/settings.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RecorderComponent, TranscriptionComponent, ControlsComponent, SettingsComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
})
export class App {}
