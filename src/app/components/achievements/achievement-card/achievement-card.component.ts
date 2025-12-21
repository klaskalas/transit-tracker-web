import { Component, Input } from '@angular/core';
import {Card} from 'primeng/card';
import {CommonModule, DecimalPipe} from '@angular/common';
import {ProgressBar} from 'primeng/progressbar';
import {Achievement} from '../../../models/achievement.model';

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

  getTierLabel(): 'Bronze' | 'Silver' | 'Gold' {
    if (this.achievement.points >= 300) {
      return 'Gold';
    }
    if (this.achievement.points >= 200) {
      return 'Silver';
    }
    return 'Bronze';
  }

  getTierClass(): string {
    return `tier-${this.getTierLabel().toLowerCase()}`;
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  }
}
