import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Card} from 'primeng/card';
import {ButtonDirective} from 'primeng/button';
import {TransitLine} from '../../../models/transit.model';
import {CommonModule} from '@angular/common';
import {RouteType} from '../../../models/enums';
import {RouteService} from '../../../services/route-service';
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
    FontAwesomeModule
  ],
  styleUrls: ['./transit-line-card.component.scss']
})
export class TransitLineCardComponent {
  constructor(private routeService: RouteService) { }

  @Input() line!: TransitLine;
  @Output() toggleCompletion = new EventEmitter<string>();

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

  previewLine(routeId: string) {
    console.log('Previewing line', routeId);
    this.routeService.setSelectedRoute(routeId);
  }
}
