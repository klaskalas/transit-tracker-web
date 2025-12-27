import {Component, OnDestroy, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActivatedRoute, Router} from '@angular/router';
import {Observable, map} from 'rxjs';
import {TransitLine} from '../../../models/transit.model';
import {TransitService} from '../../../services/transit.service';
import {RouteService} from '../../../services/route-service';
import {RouteViewerComponent} from '../route-viewer/route-viewer';
import {ButtonDirective} from 'primeng/button';

@Component({
  selector: 'app-line-detail',
  standalone: true,
  imports: [CommonModule, RouteViewerComponent, ButtonDirective],
  templateUrl: './line-detail.component.html',
  styleUrls: ['./line-detail.component.scss']
})
export class LineDetailComponent implements OnInit, OnDestroy {
  line$!: Observable<TransitLine | undefined>;
  private lineId!: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private transitService: TransitService,
    private routeService: RouteService
  ) {}

  ngOnInit(): void {
    this.lineId = Number(this.route.snapshot.paramMap.get('lineId'));
    if (Number.isNaN(this.lineId)) {
      this.router.navigate(['explore']);
      return;
    }
    this.routeService.setSelectedRoute(this.lineId);
    this.line$ = this.transitService.transitLines$.pipe(
      map(lines => lines.find(line => line.id === this.lineId))
    );
  }

  ngOnDestroy(): void {
    this.routeService.clearSelectedRoute();
  }

  goBack(): void {
    this.router.navigate(['explore']);
  }

  toggleVisited(): void {
    this.transitService.toggleLineCompletion(this.lineId);
  }

  getTypeLabel(type: number): string {
    if (type >= 100 && type <= 199) {
      return 'Train';
    }
    if (type >= 200 && type <= 299) {
      return 'Coach';
    }
    if (type >= 400 && type <= 499) {
      return 'Metro';
    }
    if (type >= 700 && type <= 799) {
      return 'Bus';
    }
    if (type >= 900 && type <= 999) {
      return 'Tram';
    }
    if (type >= 1200 && type <= 1299) {
      return 'Ferry';
    }
    if (type >= 1100 && type <= 1199) {
      return 'Air';
    }
    return 'Transit';
  }
}
