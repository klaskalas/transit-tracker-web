import {Component, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouteService } from '../route-service';
import { ActivatedRoute } from '@angular/router';
import {GeoJSONSourceComponent, LayerComponent, MapComponent} from 'ngx-mapbox-gl';
import mapboxgl from 'mapbox-gl';

@Component({
  selector: 'app-route-viewer',
  standalone: true,
  imports: [CommonModule, GeoJSONSourceComponent, LayerComponent, MapComponent, LayerComponent],
  templateUrl: './route-viewer.html',
  providers: [RouteService]
})
export class RouteViewerComponent implements OnInit {
  geoJson: any;

  constructor(
    private routeService: RouteService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {

  }

  readonly routePaint: mapboxgl.LinePaint = {
    'line-color': '#007cbf',
    'line-width': 4
  };

  onMapCreate(map: mapboxgl.Map) {
    const shapeId = this.route.snapshot.paramMap.get('shapeId')!;
    this.routeService.getRouteByShapeId(shapeId).subscribe(route => {
      const geometry = JSON.parse(route);

      this.geoJson = {
        type: "FeatureCollection",
        features: [{
          type: "Feature",
          geometry: geometry,
          properties: {
            name: "Example Line",
            description: "This is a sample LineString"
          }
        }]
      };

      const coords = geometry.coordinates;
      if (!coords?.length) return;

      const bounds = coords.reduce(
        (b: mapboxgl.LngLatBounds, coord: number[]) =>
          b.extend(coord as [number, number]),
        new mapboxgl.LngLatBounds(coords[0], coords[0])
      );

      map.fitBounds(bounds, { padding: 40 });
    });
  }
}
