export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  requirement: number;
  progress: number;
  unlocked: boolean;
  unlockedDate?: Date;
  points: number;
}

export type AchievementCategory = 'regional' | 'type' | 'milestone' | 'streak';
