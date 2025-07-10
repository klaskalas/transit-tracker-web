import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouteService } from '../route-service';
import { ActivatedRoute } from '@angular/router';
import {RouteMapComponent} from '../route-map/route-map';

@Component({
  selector: 'app-route-viewer',
  standalone: true,
  imports: [CommonModule, RouteMapComponent],
  template: `
    <ng-container *ngIf="geoJsonShape">
      <app-route-map [geoJsonShape]="geoJsonShape"></app-route-map>
    </ng-container>
  `,
  providers: [RouteService]
})
export class RouteViewerComponent implements OnInit {
  geoJsonShape: any;

  constructor(
    private routeService: RouteService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const shapeId = this.route.snapshot.paramMap.get('shapeId')!;
    this.routeService.getRouteByShapeId(shapeId).subscribe(route => {
      this.geoJsonShape = route.geoJsonShape;
    });
  }
}
