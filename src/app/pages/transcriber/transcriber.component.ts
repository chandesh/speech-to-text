import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { RecorderComponent } from '../../components/recorder/recorder.component';
import { TranscriptionComponent } from '../../components/transcription/transcription.component';
import { ControlsComponent } from '../../components/controls/controls.component';
import { SettingsComponent } from '../../components/settings/settings.component';

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
    SettingsComponent,
  ],
  template: `
    <app-navbar></app-navbar>
    <main class="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
      <div class="max-w-5xl mx-auto space-y-6">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="lg:col-span-2 space-y-6">
            <div
              class="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden"
            >
              <app-transcription></app-transcription>
              <app-controls></app-controls>
            </div>
            <div class="flex justify-center items-center py-8">
              <app-recorder></app-recorder>
            </div>
          </div>
          <div class="lg:col-span-1">
            <app-settings></app-settings>
          </div>
        </div>
      </div>
    </main>
  `,
})
export class TranscriberComponent {}
