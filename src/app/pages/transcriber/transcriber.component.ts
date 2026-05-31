import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { RecorderComponent } from '../../components/recorder/recorder.component';
import { TranscriptionComponent } from '../../components/transcription/transcription.component';
import { ControlsComponent } from '../../components/controls/controls.component';

@Component({
  standalone: true,
  selector: 'app-transcriber',
  imports: [
    CommonModule,
    RouterModule,
    NavbarComponent,
    RecorderComponent,
    TranscriptionComponent,
    ControlsComponent,
  ],
  template: `
    <app-navbar></app-navbar>
    <main class="min-h-screen bg-background p-6">
      <div class="max-w-5xl mx-auto space-y-6">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="lg:col-span-3 space-y-6">
            <div
              class="bg-surface rounded-3xl shadow-xl border border-outline overflow-hidden"
            >
              <app-transcription></app-transcription>
              <app-controls></app-controls>
            </div>
            <div class="flex justify-center items-center py-8">
              <app-recorder></app-recorder>
            </div>
          </div>
        </div>
      </div>
    </main>
  `,
})
export class TranscriberComponent {}
