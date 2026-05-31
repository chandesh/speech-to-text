import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SpeechService } from './services/speech/speech.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule],
  template: `<router-outlet></router-outlet>`,
  styleUrls: ['./app.scss'],
})
export class App {
  private speechService = inject(SpeechService);
}
