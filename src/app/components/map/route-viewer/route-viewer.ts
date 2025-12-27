import {Component, effect, inject, Input, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouteService } from '../../../services/route-service';
import {GeoJSONSourceComponent, LayerComponent, MapComponent} from 'ngx-mapbox-gl';
import mapboxgl from 'mapbox-gl';
import {FeatureCollection} from 'geojson';

@Component({
  selector: 'app-route-viewer',
  standalone: true,
  imports: [CommonModule, GeoJSONSourceComponent, LayerComponent, MapComponent, LayerComponent],
  templateUrl: './route-viewer.html',
  styleUrls: ['./route-viewer.scss'],
})
export class RouteViewerComponent implements OnInit {
  private routeService = inject(RouteService);

  geoJson: FeatureCollection;
  readonly routeId = this.routeService.selectedRouteId;
  map: mapboxgl.Map;
  @Input() interactive = true;

  constructor() {
    effect(() => {
      const routeId = this.routeId();
      if (!routeId || !this.map) return;

      this.loadRouteShape(routeId);
    });
  }

  ngOnInit(): void {

  }

  readonly routePaint: mapboxgl.LinePaint = {
    'line-color': '#007cbf',
    'line-width': 4
  };

  onMapCreate(map: mapboxgl.Map) {
    this.map = map;
    if (!this.interactive) {
      map.scrollZoom.disable();
      map.boxZoom.disable();
      map.dragRotate.disable();
      map.dragPan.disable();
      map.keyboard.disable();
      map.doubleClickZoom.disable();
      map.touchZoomRotate.disable();
    }
    const routeId = this.routeId();
    if (routeId) {
      this.loadRouteShape(routeId);
    }
  }

  private fitMapToLineStringCoordinates(geoJson: FeatureCollection): void {
    const features = geoJson.features;

    if (!features?.length) return;

    // Flatten all LineString coordinates
    const allCoords: [number, number][] = features.flatMap(feature => {
      if (feature.geometry?.type === 'LineString') {
        return feature.geometry.coordinates as [number, number][];
      }
      return [];
    });

    if (!allCoords.length) return;

    // Fit the map bounds to all collected coordinates
    const bounds = allCoords.reduce(
      (b, coord) => b.extend(coord),
      new mapboxgl.LngLatBounds(allCoords[0], allCoords[0])
    );

    this.map.fitBounds(bounds, { padding: 40 });
  }

  private loadRouteShape(routeId: number): void {
    this.routeService.getShapeByRouteId(routeId).subscribe(geoJson => {
      this.geoJson = geoJson;
      this.fitMapToLineStringCoordinates(geoJson);
    });
  }
}
