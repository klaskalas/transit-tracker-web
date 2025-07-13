import {Component, computed, OnInit, Signal} from '@angular/core';
import {AchievementCardComponent} from '../achievement-card/achievement-card.component';
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
}
