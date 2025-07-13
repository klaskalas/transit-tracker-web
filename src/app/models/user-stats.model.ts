import {Achievement} from './achievement.model';

export interface UserStats {
  totalLines: number;
  completedLines: number;
  totalPoints: number;
  level: number;
  achievements: Achievement[];
  streakDays: number;
  favoriteRegion: string;
}
