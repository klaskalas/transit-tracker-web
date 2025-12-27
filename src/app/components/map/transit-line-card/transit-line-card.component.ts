import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Card} from 'primeng/card';
import {ButtonDirective} from 'primeng/button';
import {TagModule} from 'primeng/tag';
import {TransitLine} from '../../../models/transit.model';
import {CommonModule} from '@angular/common';
import {RouteType} from '../../../models/enums';
import {RouteService} from '../../../services/route-service';
import {FeatureCollection, LineString, MultiLineString} from 'geojson';
import {take} from 'rxjs';
import {FontAwesomeModule, IconDefinition} from '@fortawesome/angular-fontawesome';
import {
  faBusSimple,
  faCableCar, faCar, faHorse,
  faPlane,
  faShip,
  faTrain,
  faTrainSubway,
  faTrainTram
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-transit-line-card',
  templateUrl: './transit-line-card.component.html',
  imports: [
    CommonModule,
    Card,
    ButtonDirective,
    TagModule,
    FontAwesomeModule
  ],
  styleUrls: ['./transit-line-card.component.scss']
})
export class TransitLineCardComponent implements OnInit {
  constructor(private routeService: RouteService) {}

  @Input() line!: TransitLine;
  @Output() toggleCompletion = new EventEmitter<number>();
  @Output() selectLine = new EventEmitter<TransitLine>();
  thumbnailPath = '';
  readonly thumbnailViewBox = '0 0 200 90';

  getLineColor(): string {
    return this.line?.color || '#0ea5e9';
  }

  getPrimeTypeIcon(type: RouteType): IconDefinition {
    // Railway Services (100-199)
    if (type >= 100 && type <= 199) {
      return faTrain;
    }

    // Coach Services (200-299)
    if (type >= 200 && type <= 299) {
      return faBusSimple;
    }

    // Urban Railway Services (400-499)
    if (type >= 400 && type <= 499) {
      if (type === RouteType.Metro || type === RouteType.Underground) {
        return faTrainSubway;
      }
      return faTrain;
    }

    // Bus Services (700-799)
    if (type >= 700 && type <= 799) {
      return faBusSimple;
    }

    // Trolleybus (800-899)
    if (type === RouteType.Trolleybus) {
      return faBusSimple;
    }

    // Tram Services (900-999)
    if (type >= 900 && type <= 999) {
      return faTrainTram;
    }

    // Special Transport Types (1000+)
    switch (type) {
      case RouteType.WaterTransport:
      case RouteType.FerryService:
      case RouteType.WaterTaxi:
        return faShip;
      case RouteType.AirService:
        return faPlane;
      case RouteType.AerialLift:
      case RouteType.Telecabin:
      case RouteType.CableCar:
      case RouteType.ChairLift:
      case RouteType.DragLift:
      case RouteType.SmallTelecabin:
      case RouteType.Funicular:
        return faCableCar;
      case RouteType.TaxiService:
      case RouteType.CommunalTaxi:
      case RouteType.RailTaxi:
      case RouteType.BikeTaxi:
      case RouteType.LicensedTaxi:
      case RouteType.PrivateHireVehicle:
        return faCar;
      case RouteType.HorseDrawnCarriage:
        return faHorse;
      default:
        return faTrain;
    }
  }

  getTypeLabel(type: RouteType): string {
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
    if (type >= 1000 && type <= 1499) {
      return 'Lift';
    }
    if (type >= 1500 && type <= 1599) {
      return 'Taxi';
    }
    if (type >= 1200 && type <= 1299) {
      return 'Ferry';
    }
    if (type >= 1100 && type <= 1199) {
      return 'Air';
    }
    return 'Transit';
  }

  onToggleCompletion(): void {
    this.toggleCompletion.emit(this.line.id);
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  }

  previewLine() {
    this.selectLine.emit(this.line);
  }

  getStopCount(points: number, stopCount?: number): number {
    if (typeof stopCount === 'number' && stopCount > 0) {
      return stopCount;
    }
    return Math.max(10, Math.round(points / 2));
  }

  getDistance(points: number): string {
    return (Math.max(5, points / 3)).toFixed(1);
  }

  ngOnInit(): void {
    if (!this.line?.id) {
      return;
    }
    this.routeService.getShapeByRouteId(this.line.id).pipe(take(1)).subscribe({
      next: geoJson => {
        this.thumbnailPath = this.buildThumbnailPath(geoJson);
      }
    });
  }

  private buildThumbnailPath(geoJson: FeatureCollection): string {
    const coords = this.extractCoordinates(geoJson);
    if (coords.length < 2) {
      return '';
    }

    let minX = coords[0][0];
    let maxX = coords[0][0];
    let minY = coords[0][1];
    let maxY = coords[0][1];

    coords.forEach(([x, y]) => {
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    });

    const width = maxX - minX || 1;
    const height = maxY - minY || 1;
    const padding = 8;
    const targetW = 200 - padding * 2;
    const targetH = 90 - padding * 2;
    const scale = Math.min(targetW / width, targetH / height);

    return coords
      .map(([x, y], index) => {
        const px = padding + (x - minX) * scale;
        const py = padding + (maxY - y) * scale;
        return `${index === 0 ? 'M' : 'L'}${px.toFixed(1)} ${py.toFixed(1)}`;
      })
      .join(' ');
  }

  private extractCoordinates(geoJson: FeatureCollection): [number, number][] {
    const coords: [number, number][] = [];
    geoJson.features.forEach(feature => {
      if (feature.geometry?.type === 'LineString') {
        coords.push(...(feature.geometry as LineString).coordinates as [number, number][]);
      }
      if (feature.geometry?.type === 'MultiLineString') {
        (feature.geometry as MultiLineString).coordinates.forEach(line => {
          coords.push(...(line as [number, number][]));
        });
      }
    });
    return coords;
  }
}
