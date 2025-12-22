import {AchievementCategory} from '../models/achievement.model';

export type AchievementRuleType =
  | 'count_lines'
  | 'distinct_cities'
  | 'distinct_countries'
  | 'count_metro'
  | 'lines_in_day'
  | 'weekend_lines'
  | 'streak_days'
  | 'all_types';

export interface AchievementRule {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  requirement: number;
  points: number;
  ruleType: AchievementRuleType;
}

export const achievementRules: AchievementRule[] = [
  {
    id: 'first-ride',
    title: 'First Ride',
    description: 'Collect your first transit line',
    icon: 'star',
    category: 'milestone',
    requirement: 1,
    points: 50,
    ruleType: 'count_lines'
  },
  {
    id: 'city-explorer',
    title: 'City Explorer',
    description: 'Collect lines from 3 different cities',
    icon: 'map',
    category: 'regional',
    requirement: 3,
    points: 150,
    ruleType: 'distinct_cities'
  },
  {
    id: 'metro-master',
    title: 'Metro Master',
    description: 'Collect 5 metro lines',
    icon: 'train',
    category: 'type',
    requirement: 5,
    points: 200,
    ruleType: 'count_metro'
  },
  {
    id: 'on-a-roll',
    title: 'On a Roll',
    description: 'Collect lines 3 days in a row',
    icon: 'bolt',
    category: 'streak',
    requirement: 3,
    points: 150,
    ruleType: 'streak_days'
  },
  {
    id: 'weekend-warrior',
    title: 'Weekend Warrior',
    description: 'Collect 5 lines on weekends',
    icon: 'calendar',
    category: 'milestone',
    requirement: 5,
    points: 150,
    ruleType: 'weekend_lines'
  },
  {
    id: 'speed-demon',
    title: 'Speed Demon',
    description: 'Collect 3 lines in one day',
    icon: 'clock',
    category: 'milestone',
    requirement: 3,
    points: 200,
    ruleType: 'lines_in_day'
  },
  {
    id: 'globe-trotter',
    title: 'Globe Trotter',
    description: 'Collect lines from 5 countries',
    icon: 'globe',
    category: 'regional',
    requirement: 5,
    points: 250,
    ruleType: 'distinct_countries'
  },
  {
    id: 'multimodal-master',
    title: 'Multimodal Master',
    description: 'Collect every major type of transit',
    icon: 'sitemap',
    category: 'type',
    requirement: 4,
    points: 300,
    ruleType: 'all_types'
  },
  {
    id: 'century-club',
    title: 'Century Club',
    description: 'Collect 100 transit lines',
    icon: 'trophy',
    category: 'milestone',
    requirement: 100,
    points: 500,
    ruleType: 'count_lines'
  },
  {
    id: 'underground-king',
    title: 'Underground King',
    description: 'Collect 50 metro lines',
    icon: 'train',
    category: 'type',
    requirement: 50,
    points: 400,
    ruleType: 'count_metro'
  }
];
