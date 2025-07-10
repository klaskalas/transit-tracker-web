import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import mapboxgl from 'mapbox-gl';
import {GeoJSONSourceComponent, LayerComponent, MapComponent} from 'ngx-mapbox-gl';
import type { Feature, LineString } from 'geojson';

@Component({
  selector: 'app-route-map',
  standalone: true,
  imports: [CommonModule, ],
  templateUrl: './route-map.html',
  styleUrls: ['./route-map.scss']
})
export class RouteMapComponent {


}
