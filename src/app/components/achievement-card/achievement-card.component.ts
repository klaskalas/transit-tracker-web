import { Component, Input } from '@angular/core';
import {Card} from 'primeng/card';
import {CommonModule, DecimalPipe} from '@angular/common';
import {ProgressBar} from 'primeng/progressbar';
import {Achievement} from '../../models/achievement.model';

@Component({
  selector: 'app-achievement-card',
  templateUrl: './achievement-card.component.html',
  imports: [
    CommonModule,
    Card,
    DecimalPipe,
    ProgressBar
  ],
  styleUrls: ['./achievement-card.component.scss']
})
export class AchievementCardComponent {
  @Input() achievement!: Achievement;

  getProgressPercentage(): number {
    return (this.achievement.progress / this.achievement.requirement) * 100;
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  }
}
