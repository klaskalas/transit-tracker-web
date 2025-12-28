import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, firstValueFrom, map } from 'rxjs';
import { TransitLine, FilterOptions } from '../models/transit.model';
import { Achievement } from '../models/achievement.model';
import { UserStats } from '../models/user-stats.model';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AuthService } from './auth.service';
import { achievementRules, AchievementRule } from '../data/achievement-rules';
import { RouteType } from '../models/enums';
import { UserAchievement } from '../models/user-achievement.model';

type VisitResponse = {
  routeId: number;
  completed: boolean;
  completedDate?: string | null;
};

@Injectable({
  providedIn: 'root'
})
export class TransitService {
  private transitLinesSubject = new BehaviorSubject<TransitLine[]>([]);
  private achievementsSubject = new BehaviorSubject<Achievement[]>([]);
  private userStatsSubject = new BehaviorSubject<UserStats>(this.getEmptyUserStats());
  private persistedUnlocks = new Map<string, Date>();
  private readonly pageSize = 25;
  private offset = 0;
  private hasMoreRoutes = true;
  private isLoadingRoutes = false;
  private isLoadingAllRoutes = false;

  transitLines$ = this.transitLinesSubject.asObservable();
  achievements$ = this.achievementsSubject.asObservable();
  userStats$ = this.userStatsSubject.asObservable();

  private baseUrl = 'https://localhost:7233';

  constructor(private http: HttpClient, private authService: AuthService) {
    this.authService.user$.subscribe(() => this.loadInitialData());
    this.loadInitialData();
  }

  private loadInitialData() {
    this.loadUnlockedAchievements();

    this.resetRoutes();
    this.loadNextPage();
  }

  private fetchTransitLines(offset: number, limit: number): Observable<TransitLine[]> {
    const endpoint = this.authService.getToken() ? 'with-progress' : '';
    const url = endpoint ? `${this.baseUrl}/api/routes/${endpoint}` : `${this.baseUrl}/api/routes`;
    const params = new HttpParams()
      .set('offset', offset)
      .set('limit', limit);

    return this.http.get<TransitLine[]>(url, { params }).pipe(
      map(lines => lines.map(line => ({
        ...line,
        completed: line.completed ?? false,
        completedDate: line.completedDate ? new Date(line.completedDate) : undefined
      })))
    );
  }

  loadNextPage(): void {
    if (!this.hasMoreRoutes || this.isLoadingRoutes) {
      return;
    }

    this.isLoadingRoutes = true;
    this.fetchTransitLines(this.offset, this.pageSize).subscribe({
      next: lines => {
        this.applyLoadedRoutes(lines, this.offset > 0);
        this.offset += lines.length;
        if (lines.length < this.pageSize) {
          this.hasMoreRoutes = false;
        }
      },
      error: () => {
        this.isLoadingRoutes = false;
      },
      complete: () => {
        this.isLoadingRoutes = false;
      }
    });
  }

  ensureAllRoutesLoaded(): void {
    if (!this.hasMoreRoutes || this.isLoadingAllRoutes) {
      return;
    }

    this.isLoadingAllRoutes = true;
    const loadRemaining = async () => {
      try {
        while (this.hasMoreRoutes) {
          const lines = await firstValueFrom(this.fetchTransitLines(this.offset, this.pageSize));
          const normalized = lines ?? [];
          this.applyLoadedRoutes(normalized, this.offset > 0);
          this.offset += normalized.length;
          if (normalized.length < this.pageSize) {
            this.hasMoreRoutes = false;
          }
        }
      } finally {
        this.isLoadingAllRoutes = false;
      }
    };

    void loadRemaining();
  }

  getFilteredTransitLines(filters: FilterOptions): Observable<TransitLine[]> {
    return this.transitLines$.pipe(
      map(lines => lines.filter(line => {
        const matchesType = !filters.types.length || filters.types.includes(line.routeType);
        const matchesRegion = !filters.regions.length || filters.regions.includes(line.region);
        const matchesCompletion =
          filters.completionStatus === 'all' ||
          (filters.completionStatus === 'completed' && line.completed) ||
          (filters.completionStatus === 'incomplete' && !line.completed);
        return matchesType && matchesRegion && matchesCompletion;
      }))
    );
  }

  toggleLineCompletion(lineId: number): void {
    if (this.authService.getToken()) {
      const lines = this.transitLinesSubject.value;
      const lineIndex = lines.findIndex(line => line.id === lineId);
      if (lineIndex !== -1) {
        lines[lineIndex].completed = !lines[lineIndex].completed;
        lines[lineIndex].completedDate = lines[lineIndex].completed ? new Date() : undefined;
        this.transitLinesSubject.next([...lines]);
        this.updateUserStats();
      }

      this.http.post<VisitResponse>(`${this.baseUrl}/api/routes/${lineId}/visited`, {}).subscribe({
        next: response => {
          const updatedLines = this.transitLinesSubject.value;
          const responseIndex = updatedLines.findIndex(line => line.id === response.routeId);
          if (responseIndex !== -1) {
            updatedLines[responseIndex].completed = response.completed;
            updatedLines[responseIndex].completedDate = response.completedDate ? new Date(response.completedDate) : undefined;
            this.transitLinesSubject.next([...updatedLines]);
            this.updateUserStats();
          }
        },
        error: () => {
          const revertedLines = this.transitLinesSubject.value;
          const revertIndex = revertedLines.findIndex(line => line.id === lineId);
          if (revertIndex !== -1) {
            revertedLines[revertIndex].completed = !revertedLines[revertIndex].completed;
            revertedLines[revertIndex].completedDate = revertedLines[revertIndex].completed ? new Date() : undefined;
            this.transitLinesSubject.next([...revertedLines]);
            this.updateUserStats();
          }
        }
      });
      return;
    }

    const lines = this.transitLinesSubject.value;
    const lineIndex = lines.findIndex(line => line.id === lineId);

    if (lineIndex !== -1) {
      lines[lineIndex].completed = !lines[lineIndex].completed;
      lines[lineIndex].completedDate = lines[lineIndex].completed ? new Date() : undefined;

      this.transitLinesSubject.next([...lines]);
      this.updateUserStats();
    }
  }

  private getEmptyUserStats(): UserStats {
    return {
      totalLines: 0,
      completedLines: 0,
      totalPoints: 0,
      level: 1,
      achievements: [],
      streakDays: 0,
      favoriteRegion: 'N/A'
    };
  }

  private updateUserStats(): void {
    const lines = this.transitLinesSubject.value;
    const completedLines = lines.filter(line => line.completed);
    const totalPoints = completedLines.reduce((sum, line) => sum + line.points, 0);
    const level = Math.floor(totalPoints / 1000) + 1;
    const achievements = this.computeAchievements(lines);

    const stats: UserStats = {
      totalLines: lines.length,
      completedLines: completedLines.length,
      totalPoints,
      level,
      achievements,
      streakDays: this.getMaxStreakDays(completedLines),
      favoriteRegion: this.getTopRegion(completedLines)
    };

    this.achievementsSubject.next(achievements);
    this.userStatsSubject.next(stats);
    this.persistUnlockedAchievements(achievements);
  }

  private resetRoutes(): void {
    this.transitLinesSubject.next([]);
    this.offset = 0;
    this.hasMoreRoutes = true;
    this.isLoadingRoutes = false;
    this.isLoadingAllRoutes = false;
  }

  private applyLoadedRoutes(lines: TransitLine[], append: boolean): void {
    const existing = this.transitLinesSubject.value;
    const merged = append ? [...existing, ...lines] : [...lines];
    const byId = new Map<number, TransitLine>();
    merged.forEach(line => {
      byId.set(line.id, line);
    });
    const next = Array.from(byId.values());
    this.transitLinesSubject.next(next);
    this.updateUserStats();
  }

  private computeAchievements(lines: TransitLine[]): Achievement[] {
    const completedLines = lines.filter(line => line.completed);
    const previous = this.achievementsSubject.value;
    const stats = this.buildAchievementStats(completedLines);

    return achievementRules.map(rule => {
      const progress = this.getRuleProgress(rule, stats);
      const existing = previous.find(item => item.id === rule.id);
      const persistedUnlock = this.persistedUnlocks.get(rule.id);
      const unlocked = progress >= rule.requirement || existing?.unlocked || !!persistedUnlock;
      const unlockedDate = unlocked
        ? (persistedUnlock ?? existing?.unlockedDate ?? new Date())
        : undefined;

      return {
        id: rule.id,
        title: rule.title,
        description: rule.description,
        icon: rule.icon,
        category: rule.category,
        requirement: rule.requirement,
        progress,
        unlocked,
        unlockedDate,
        points: rule.points
      };
    });
  }

  private loadUnlockedAchievements(): void {
    if (!this.authService.getToken()) {
      this.persistedUnlocks.clear();
      return;
    }

    this.http.get<UserAchievement[]>(`${this.baseUrl}/api/achievements/unlocked`).subscribe({
      next: unlocks => {
        this.persistedUnlocks.clear();
        unlocks.forEach(item => {
          this.persistedUnlocks.set(item.achievementId, new Date(item.unlockedAt));
        });
        this.updateUserStats();
      }
    });
  }

  private persistUnlockedAchievements(achievements: Achievement[]): void {
    if (!this.authService.getToken()) {
      return;
    }

    const newlyUnlocked = achievements.filter(achievement =>
      achievement.unlocked && !this.persistedUnlocks.has(achievement.id)
    );

    if (!newlyUnlocked.length) {
      return;
    }

    newlyUnlocked.forEach(achievement => {
      this.persistedUnlocks.set(achievement.id, achievement.unlockedDate ?? new Date());
    });

    this.http.post(`${this.baseUrl}/api/achievements/unlocked`, {
      achievementIds: newlyUnlocked.map(achievement => achievement.id)
    }).subscribe();
  }

  private buildAchievementStats(lines: TransitLine[]) {
    const distinctCities = new Set(lines.map(line => line.region).filter(Boolean));
    const distinctCountries = new Set(lines.map(line => line.agency?.countryCode).filter(Boolean));
    const metroCount = lines.filter(line => this.isMetro(line.routeType)).length;
    const busCount = lines.filter(line => this.isBus(line.routeType)).length;
    const tramCount = lines.filter(line => this.isTram(line.routeType)).length;
    const trainCount = lines.filter(line => this.isTrain(line.routeType)).length;
    const weekendCount = lines.filter(line => this.isWeekend(line.completedDate)).length;
    const maxLinesInDay = this.getMaxLinesInDay(lines);
    const maxStreakDays = this.getMaxStreakDays(lines);
    const uniqueTypeCount = [metroCount, busCount, tramCount, trainCount].filter(count => count > 0).length;

    return {
      totalLines: lines.length,
      distinctCities: distinctCities.size,
      distinctCountries: distinctCountries.size,
      metroCount,
      busCount,
      tramCount,
      trainCount,
      weekendCount,
      maxLinesInDay,
      maxStreakDays,
      uniqueTypeCount
    };
  }

  private getRuleProgress(rule: AchievementRule, stats: ReturnType<typeof this.buildAchievementStats>): number {
    switch (rule.ruleType) {
      case 'count_lines':
        return stats.totalLines;
      case 'distinct_cities':
        return stats.distinctCities;
      case 'distinct_countries':
        return stats.distinctCountries;
      case 'count_metro':
        return stats.metroCount;
      case 'lines_in_day':
        return stats.maxLinesInDay;
      case 'weekend_lines':
        return stats.weekendCount;
      case 'streak_days':
        return stats.maxStreakDays;
      case 'all_types':
        return stats.uniqueTypeCount;
      default:
        return 0;
    }
  }

  private getMaxLinesInDay(lines: TransitLine[]): number {
    const counts = new Map<string, number>();
    lines.forEach(line => {
      if (!line.completedDate) {
        return;
      }
      const key = this.getDateKey(line.completedDate);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    });
    return Math.max(0, ...counts.values());
  }

  private getMaxStreakDays(lines: TransitLine[]): number {
    const dates = Array.from(new Set(
      lines
        .map(line => line.completedDate)
        .filter(Boolean)
        .map(date => this.getDateKey(date as Date))
    )).sort();

    let max = 0;
    let current = 0;
    let previousDate: Date | null = null;

    dates.forEach(dateKey => {
      const date = new Date(`${dateKey}T00:00:00`);
      if (previousDate) {
        const diff = (date.getTime() - previousDate.getTime()) / 86400000;
        current = diff === 1 ? current + 1 : 1;
      } else {
        current = 1;
      }
      if (current > max) {
        max = current;
      }
      previousDate = date;
    });

    return max;
  }

  private getTopRegion(lines: TransitLine[]): string {
    const counts = new Map<string, number>();
    lines.forEach(line => {
      if (!line.region) {
        return;
      }
      counts.set(line.region, (counts.get(line.region) ?? 0) + 1);
    });
    let topRegion = 'N/A';
    let topCount = 0;
    counts.forEach((count, region) => {
      if (count > topCount) {
        topCount = count;
        topRegion = region;
      }
    });
    return topRegion;
  }

  private getDateKey(date: Date): string {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private isWeekend(date?: Date): boolean {
    if (!date) {
      return false;
    }
    const day = date.getDay();
    return day === 0 || day === 6;
  }

  private isMetro(type: RouteType): boolean {
    return (type >= 400 && type <= 499) || type === RouteType.Metro || type === RouteType.Underground;
  }

  private isBus(type: RouteType): boolean {
    return type >= 700 && type <= 799;
  }

  private isTram(type: RouteType): boolean {
    return type >= 900 && type <= 999;
  }

  private isTrain(type: RouteType): boolean {
    return type >= 100 && type <= 199;
  }
}
