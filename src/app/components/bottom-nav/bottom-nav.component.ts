import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { ButtonDirective } from 'primeng/button';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-bottom-nav',
  templateUrl: './bottom-nav.component.html',
  styleUrls: ['./bottom-nav.component.scss'],
  standalone: true,
  imports: [
    ButtonDirective,
  ]
})
export class BottomNavComponent implements OnInit {
  protected activeRoute: string = 'map';

  constructor(private router: Router) {}

  ngOnInit() {
    // Set initial active route based on current URL
    this.activeRoute = this.router.url.split('/')[1] || 'map';

    // Subscribe to router events to update active route
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.activeRoute = event.urlAfterRedirects.split('/')[1] || 'map';
    });
  }

  protected navigateTo(route: string) {
    this.router.navigate([route]);
  }
}
