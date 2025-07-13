import {Component, inject, OnInit} from '@angular/core';
import {CommonModule, DecimalPipe} from '@angular/common';
import {Card} from 'primeng/card';
import {ProgressBar} from 'primeng/progressbar';
import {ButtonDirective} from 'primeng/button';
import {TransitService} from '../../services/transit.service';
import {UserStats} from '../../models/user-stats.model';
import {toSignal} from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  imports: [
    CommonModule,
    DecimalPipe,
    Card,
    ProgressBar,
    ButtonDirective
  ],
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  private transitService = inject(TransitService);
  readonly userStatsSignal = toSignal(this.transitService.userStats$, { initialValue: null });

  ngOnInit(): void {}

  shareProgress(): void {
    if (navigator.share) {
      navigator.share({
        title: 'TransitTracker Progress',
        text: 'Check out my transit exploration progress!',
        url: window.location.href
      });
    } else {
      const text = 'Check out my transit exploration progress on TransitTracker!';
      navigator.clipboard.writeText(text);
      alert('Progress shared to clipboard!');
    }
  }

  exportData(): void {
    alert('Data export feature coming soon!');
  }

  resetProgress(): void {
    if (confirm('Are you sure you want to reset all progress? This action cannot be undone.')) {
      alert('Reset functionality coming soon!');
    }
  }

  getUnlockedAchievementsCount(stats: UserStats): number {
    return stats.achievements.filter(a => a.unlocked).length;
  }
}
