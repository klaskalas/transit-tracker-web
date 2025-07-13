import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { TransitLine, FilterOptions, TransitType } from '../models/transit.model';
import { Achievement } from '../models/achievement.model';
import {UserStats} from '../models/user-stats.model';

@Injectable({
  providedIn: 'root'
})
export class TransitService {
  private transitLinesSubject = new BehaviorSubject<TransitLine[]>(this.getMockTransitLines());
  private achievementsSubject = new BehaviorSubject<Achievement[]>(this.getMockAchievements());
  private userStatsSubject = new BehaviorSubject<UserStats>(this.getMockUserStats());

  transitLines$ = this.transitLinesSubject.asObservable();
  achievements$ = this.achievementsSubject.asObservable();
  userStats$ = this.userStatsSubject.asObservable();

  constructor() {}

  getFilteredTransitLines(filters: FilterOptions): Observable<TransitLine[]> {
    const lines = this.transitLinesSubject.value;
    const filtered = lines.filter(line => {
      const typeMatch = filters.types.length === 0 || filters.types.includes(line.type);
      const regionMatch = filters.regions.length === 0 || filters.regions.includes(line.region);
      const completionMatch = filters.completionStatus === 'all' ||
        (filters.completionStatus === 'completed' && line.completed) ||
        (filters.completionStatus === 'incomplete' && !line.completed);

      return typeMatch && regionMatch && completionMatch;
    });

    return new BehaviorSubject(filtered).asObservable();
  }

  toggleLineCompletion(lineId: string): void {
    const lines = this.transitLinesSubject.value;
    const lineIndex = lines.findIndex(line => line.id === lineId);

    if (lineIndex !== -1) {
      lines[lineIndex].completed = !lines[lineIndex].completed;
      lines[lineIndex].completedDate = lines[lineIndex].completed ? new Date() : undefined;

      this.transitLinesSubject.next([...lines]);
      this.updateUserStats();
      this.checkAchievements();
    }
  }

  private updateUserStats(): void {
    const lines = this.transitLinesSubject.value;
    const completedLines = lines.filter(line => line.completed);
    const totalPoints = completedLines.reduce((sum, line) => sum + line.points, 0);
    const level = Math.floor(totalPoints / 1000) + 1;

    const stats: UserStats = {
      totalLines: lines.length,
      completedLines: completedLines.length,
      totalPoints,
      level,
      achievements: this.achievementsSubject.value,
      streakDays: 7, // Mock data
      favoriteRegion: 'Stockholm'
    };

    this.userStatsSubject.next(stats);
  }

  private checkAchievements(): void {
    const achievements = this.achievementsSubject.value;
    const lines = this.transitLinesSubject.value;
    const completedLines = lines.filter(line => line.completed);

    achievements.forEach(achievement => {
      if (!achievement.unlocked) {
        let progress = 0;

        switch (achievement.category) {
          case 'milestone':
            progress = completedLines.length;
            break;
          case 'regional':
            const regionLines = completedLines.filter(line =>
              line.region === achievement.description.split(' ')[0]
            );
            progress = regionLines.length;
            break;
          case 'type':
            const typeLines = completedLines.filter(line =>
              line.type === achievement.description.toLowerCase().split(' ')[0] as TransitType
            );
            progress = typeLines.length;
            break;
        }

        achievement.progress = progress;
        if (progress >= achievement.requirement) {
          achievement.unlocked = true;
          achievement.unlockedDate = new Date();
        }
      }
    });

    this.achievementsSubject.next([...achievements]);
  }

  private getMockTransitLines(): TransitLine[] {
    return [
      {
        id: '1',
        name: 'Blue Line',
        type: 'metro',
        region: 'Stockholm',
        color: '#0066CC',
        stops: ['T-Centralen', 'Kungsträdgården', 'Rådhuset'],
        operatingHours: '05:00 - 01:00',
        completed: true,
        completedDate: new Date('2024-01-15'),
        points: 150
      },
      {
        id: '2',
        name: 'Tram 7',
        type: 'tram',
        region: 'Stockholm',
        color: '#00AA44',
        stops: ['Sergels torg', 'Waldemarsudde', 'Djurgården'],
        operatingHours: '06:00 - 23:00',
        completed: false,
        points: 100
      },
      {
        id: '3',
        name: 'Express 101',
        type: 'bus',
        region: 'Stockholm',
        color: '#FF6600',
        stops: ['Arlanda', 'City Terminal', 'Brommaplan'],
        operatingHours: '24/7',
        completed: true,
        completedDate: new Date('2024-01-20'),
        points: 75
      },
      {
        id: '4',
        name: 'Regional Train',
        type: 'train',
        region: 'Stockholm',
        color: '#9900CC',
        stops: ['Stockholm Central', 'Uppsala', 'Gävle'],
        operatingHours: '05:30 - 23:30',
        completed: false,
        points: 200
      }
    ];
  }

  private getMockAchievements(): Achievement[] {
    return [
      {
        id: '1',
        title: 'First Ride',
        description: 'Complete your first transit line',
        icon: 'star',
        category: 'milestone',
        requirement: 1,
        progress: 2,
        unlocked: true,
        unlockedDate: new Date('2024-01-15'),
        points: 50
      },
      {
        id: '2',
        title: 'Stockholm Explorer',
        description: 'Complete 10 lines in Stockholm',
        icon: 'map',
        category: 'regional',
        requirement: 10,
        progress: 2,
        unlocked: false,
        points: 200
      },
      {
        id: '3',
        title: 'Metro Master',
        description: 'Complete all metro lines',
        icon: 'train',
        category: 'type',
        requirement: 5,
        progress: 1,
        unlocked: false,
        points: 300
      }
    ];
  }

  private getMockUserStats(): UserStats {
    return {
      totalLines: 4,
      completedLines: 2,
      totalPoints: 225,
      level: 1,
      achievements: [],
      streakDays: 7,
      favoriteRegion: 'Stockholm'
    };
  }
}
