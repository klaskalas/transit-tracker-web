import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Card} from 'primeng/card';
import {ButtonDirective} from 'primeng/button';
import {TransitLine} from '../../../models/transit.model';
import {CommonModule} from '@angular/common';
import {RouteType} from '../../../models/enums';
import {RouteService} from '../../../services/route-service';

@Component({
  selector: 'app-transit-line-card',
  templateUrl: './transit-line-card.component.html',
  imports: [
    CommonModule,
    Card,
    ButtonDirective
  ],
  styleUrls: ['./transit-line-card.component.scss']
})
export class TransitLineCardComponent {
  constructor(private routeService: RouteService) { }

  @Input() line!: TransitLine;
  @Output() toggleCompletion = new EventEmitter<string>();

  getPrimeTypeIcon(type: RouteType): string {
    switch (type) {
      case RouteType.Bus:
        return 'pi-bus';
      case RouteType.LongDistanceTrain:
      case RouteType.LocalTrain:
      case RouteType.HighSpeedRail:
        return 'pi-train';
      case RouteType.Tram:
        return 'pi-compass';
      case RouteType.Subway:
        return 'pi-directions';
      default: return 'pi-map';
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
