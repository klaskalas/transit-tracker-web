import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { TransitService } from '../../services/transit.service';
import { UserStats } from '../../models/user-stats.model';
import { TransitLine } from '../../models/transit.model';
import { ProgressBar } from 'primeng/progressbar';
import { Card } from 'primeng/card';
import {RouteType} from '../../models/enums';

@Component({
  selector: 'app-progress',
  standalone: true,
  templateUrl: './progress.component.html',
  styleUrls: ['./progress.component.scss'],
  imports: [
    CommonModule,
    ProgressBar,
    Card,
    DecimalPipe
  ]
})
export class ProgressComponent implements OnInit {
  private transitService = inject(TransitService);

  userStatsSignal = signal<UserStats | null>(null);
  transitLinesSignal = signal<TransitLine[] | null>(null);

  ngOnInit(): void {
    this.transitService.userStats$.subscribe(stats => this.userStatsSignal.set(stats));
    this.transitService.transitLines$.subscribe(lines => this.transitLinesSignal.set(lines));
  }

  getCompletionPercentage(completed: number, total: number): number {
    return total > 0 ? (completed / total) * 100 : 0;
  }

  getTypeStats(lines: TransitLine[]) {
    const types = [RouteType.Bus, RouteType.Tram, RouteType.LocalTrain, RouteType.LongDistanceTrain, RouteType.Subway];
    return types.map(routeType => {
      const typeLines = lines.filter(line => line.routeType === routeType);
      const completed = typeLines.filter(line => line.completed).length;
      return {
        routeType,
        total: typeLines.length,
        completed,
        percentage: this.getCompletionPercentage(completed, typeLines.length)
      };
    }).filter(stat => stat.total > 0);
  }

  getRegionStats(lines: TransitLine[]) {
    const regions = [...new Set(lines.map(line => line.region))];
    return regions.map(region => {
      const regionLines = lines.filter(line => line.region === region);
      const completed = regionLines.filter(line => line.completed).length;
      return {
        region,
        total: regionLines.length,
        completed,
        percentage: this.getCompletionPercentage(completed, regionLines.length)
      };
    });
  }

  protected readonly RouteType = RouteType;
}
