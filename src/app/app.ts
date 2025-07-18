import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BottomNavComponent } from './components/bottom-nav/bottom-nav.component';

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
}
