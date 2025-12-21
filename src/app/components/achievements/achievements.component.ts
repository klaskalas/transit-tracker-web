import {Component, computed, OnInit, Signal} from '@angular/core';
import {AchievementCardComponent} from './achievement-card/achievement-card.component';
import {Achievement} from '../../models/achievement.model';
import {TransitService} from '../../services/transit.service';
import {CommonModule} from '@angular/common';
import {toSignal} from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-achievements',
  templateUrl: './achievements.component.html',
  imports: [
    CommonModule,
    AchievementCardComponent,
  ],
  styleUrls: ['./achievements.component.scss']
})
export class AchievementsComponent implements OnInit {
  achievementsSignal: Signal<Achievement[]>;
  statusFilter: 'all' | 'unlocked' | 'locked' = 'all';
  tierFilter: 'all' | 'bronze' | 'silver' | 'gold' = 'all';

  constructor(private transitService: TransitService) {
    this.achievementsSignal = toSignal(this.transitService.achievements$);
  }

  ngOnInit(): void {}

  getUnlockedAchievements(achievements: Achievement[]): Achievement[] {
    return achievements.filter(achievement => achievement.unlocked);
  }

  getLockedAchievements(achievements: Achievement[]): Achievement[] {
    return achievements.filter(achievement => !achievement.unlocked);
  }

  readonly unlockedAchievements = computed(() =>
    this.getUnlockedAchievements(this.achievementsSignal() || [])
  );

  readonly lockedAchievements = computed(() =>
    this.getLockedAchievements(this.achievementsSignal() || [])
  );

  readonly totalAchievements = computed(() => (this.achievementsSignal() || []).length);
  readonly unlockedCount = computed(() => this.unlockedAchievements().length);
  readonly lockedCount = computed(() => this.lockedAchievements().length);

  readonly completionPercent = computed(() => {
    const total = this.totalAchievements();
    if (total === 0) {
      return 0;
    }
    return Math.round((this.unlockedCount() / total) * 100);
  });

  readonly filteredAchievements = computed(() => {
    const achievements = this.achievementsSignal() || [];
    return achievements.filter(achievement => {
      const matchesStatus =
        this.statusFilter === 'all' ||
        (this.statusFilter === 'unlocked' && achievement.unlocked) ||
        (this.statusFilter === 'locked' && !achievement.unlocked);
      const tier = this.getAchievementTier(achievement);
      const matchesTier = this.tierFilter === 'all' || tier === this.tierFilter;
      return matchesStatus && matchesTier;
    });
  });

  readonly tierSummary = computed(() => {
    const achievements = this.achievementsSignal() || [];
    const tiers: Array<{ key: 'gold' | 'silver' | 'bronze'; label: string; total: number; unlocked: number }> = [
      { key: 'gold', label: 'Gold', total: 0, unlocked: 0 },
      { key: 'silver', label: 'Silver', total: 0, unlocked: 0 },
      { key: 'bronze', label: 'Bronze', total: 0, unlocked: 0 },
    ];

    achievements.forEach(achievement => {
      const tier = this.getAchievementTier(achievement);
      const target = tiers.find(item => item.key === tier);
      if (!target) {
        return;
      }
      target.total += 1;
      if (achievement.unlocked) {
        target.unlocked += 1;
      }
    });

    return tiers;
  });

  setStatusFilter(filter: 'all' | 'unlocked' | 'locked'): void {
    this.statusFilter = filter;
  }

  setTierFilter(filter: 'all' | 'bronze' | 'silver' | 'gold'): void {
    this.tierFilter = filter;
  }

  getAchievementTier(achievement: Achievement): 'bronze' | 'silver' | 'gold' {
    if (achievement.points >= 300) {
      return 'gold';
    }
    if (achievement.points >= 200) {
      return 'silver';
    }
    return 'bronze';
  }
}
