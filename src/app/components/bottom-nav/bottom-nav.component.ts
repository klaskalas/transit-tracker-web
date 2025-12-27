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
  protected activeRoute: string = 'explore';

  constructor(private router: Router) {}

  ngOnInit() {
    // Set initial active route based on current URL
    this.activeRoute = this.normalizeRoute(this.router.url.split('/')[1]);

    // Subscribe to router events to update active route
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.activeRoute = this.normalizeRoute(event.urlAfterRedirects.split('/')[1]);
    });
  }

  protected navigateTo(route: string) {
    this.router.navigate([route]);
  }

  private normalizeRoute(route: string | undefined): string {
    if (!route) {
      return 'explore';
    }
    return route === 'lines' ? 'explore' : route;
  }
}
