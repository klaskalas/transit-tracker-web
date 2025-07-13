import { Component, Input, Output, EventEmitter } from '@angular/core';
import {Card} from 'primeng/card';
import {ButtonDirective} from 'primeng/button';
import {TransitLine} from '../../models/transit.model';
import {CommonModule} from '@angular/common';

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
  @Input() line!: TransitLine;
  @Output() toggleCompletion = new EventEmitter<string>();

  getPrimeTypeIcon(type: string): string {
    switch (type) {
      case 'bus': return 'pi-bus';
      case 'train': return 'pi-train';
      case 'tram': return 'pi-compass';
      case 'metro': return 'pi-directions';
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
}
