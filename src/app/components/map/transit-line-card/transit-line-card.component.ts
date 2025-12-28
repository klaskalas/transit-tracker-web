import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Card} from 'primeng/card';
import {ButtonDirective} from 'primeng/button';
import {TagModule} from 'primeng/tag';
import {TransitLine} from '../../../models/transit.model';
import {CommonModule} from '@angular/common';
import {RouteType} from '../../../models/enums';
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
export class TransitLineCardComponent {
  @Input() line!: TransitLine;
  @Output() toggleCompletion = new EventEmitter<number>();
  @Output() selectLine = new EventEmitter<TransitLine>();

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

  getDistanceKm(line: TransitLine): string {
    const meters = line.longestTripLengthMeters;
    if (typeof meters === 'number' && meters > 0) {
      return (meters / 1000).toFixed(1);
    }
    return (Math.max(5, line.points / 3)).toFixed(1);
  }

}
