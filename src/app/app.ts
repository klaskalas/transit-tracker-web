import { Component, effect, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { BottomNavComponent } from './components/bottom-nav/bottom-nav.component';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    BottomNavComponent,
  ],
  templateUrl: './app.html',
  standalone: true,
  styleUrl: './app.scss'
})
export class App {
  protected title = 'transit-tracker';
  private authService = inject(AuthService);
  readonly authUserSignal = toSignal(this.authService.user$, { initialValue: null });
  private document = inject(DOCUMENT);

  constructor() {
    effect(() => {
      const isAuthed = !!this.authUserSignal();
      this.document.body.classList.toggle('no-nav', !isAuthed);
    });
  }
}
