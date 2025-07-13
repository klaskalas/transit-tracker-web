import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { TransitLine, FilterOptions } from '../models/transit.model';
import { Achievement } from '../models/achievement.model';
import {UserStats} from '../models/user-stats.model';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class TransitService {
  private transitLinesSubject = new BehaviorSubject<TransitLine[]>([]);
  private achievementsSubject = new BehaviorSubject<Achievement[]>(this.getMockAchievements());
  private userStatsSubject = new BehaviorSubject<UserStats>(this.getMockUserStats());

  transitLines$ = this.transitLinesSubject.asObservable();
  achievements$ = this.achievementsSubject.asObservable();
  userStats$ = this.userStatsSubject.asObservable();

  private baseUrl = 'http://localhost:5134';

  constructor(private http: HttpClient) {
    this.loadInitialData();
  }

  private loadInitialData() {
    this.getTransitLines().subscribe(lines => {
      this.transitLinesSubject.next(lines);
    });
  }

  getTransitLines(): Observable<TransitLine[]> {
    return this.http.get<TransitLine[]>(`${this.baseUrl}/api/routes`);
  }

  getFilteredTransitLines(filters: FilterOptions): Observable<TransitLine[]> {
    return this.http.get<TransitLine[]>(`${this.baseUrl}/api/routes`, {
      params: {
        types: filters.types.join(','),
        regions: filters.regions.join(','),
        completionStatus: filters.completionStatus
      }
    });
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
      achievements: this.getMockAchievements(),
      streakDays: 7,
      favoriteRegion: 'Stockholm'
    };
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
      streakDays: 7,
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
}
