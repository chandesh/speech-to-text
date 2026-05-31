import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SpeechService } from './services/speech/speech.service';
import { FooterComponent } from './components/footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, FooterComponent],
  template: `
    <div class="min-h-screen flex flex-col">
      <div class="flex-1">
        <router-outlet></router-outlet>
      </div>
      <app-footer></app-footer>
    </div>
  `,
  styleUrls: ['./app.scss'],
})
export class App {
  private speechService = inject(SpeechService);
}
