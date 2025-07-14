import {Component, effect, inject, OnInit} from '@angular/core';
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
})
export class RouteViewerComponent implements OnInit {
  private routeService = inject(RouteService);

  geoJson: FeatureCollection;
  readonly routeId = this.routeService.selectedRouteId;
  map: mapboxgl.Map;

  constructor() {
    effect(() => {
      const routeId = this.routeId();
      if (!routeId || !this.map) return;

      if (routeId) {
        this.routeService.getShapeByRouteId(routeId).subscribe(geoJson => {
          this.geoJson = geoJson;
          this.fitMapToLineStringCoordinates(geoJson);
        });
      }
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

}
