import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import mapboxgl from 'mapbox-gl';
import {GeoJSONSourceComponent, LayerComponent, MapComponent} from 'ngx-mapbox-gl';
import type { Feature, LineString } from 'geojson';

@Component({
  selector: 'app-route-map',
  standalone: true,
  imports: [CommonModule, MapComponent, GeoJSONSourceComponent, LayerComponent],
  templateUrl: './route-map.html',
  styleUrls: ['./route-map.scss']
})
export class RouteMapComponent {

  readonly routePaint: mapboxgl.LinePaint = {
    'line-color': '#007cbf',
    'line-width': 4
  };

  @Input({ required: true }) geoJsonShape!: Feature<LineString>;

  onMapCreate(map: mapboxgl.Map) {
    const coords = this.geoJsonShape.geometry.coordinates;

    if (!coords?.length) return;

    const bounds = coords.reduce(
      (b: mapboxgl.LngLatBounds, coord: number[]) => b.extend(coord as [number, number]),
      new mapboxgl.LngLatBounds(coords[0] as [number, number], coords[0] as [number, number])
    );

    map.fitBounds(bounds, { padding: 40 });
  }
}
