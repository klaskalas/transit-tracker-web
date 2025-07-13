export interface TransitLine {
  id: string;
  name: string;
  type: TransitType;
  region: string;
  color: string;
  stops: string[];
  operatingHours: string;
  completed: boolean;
  completedDate?: Date;
  points: number;
}

export type TransitType = 'train' | 'tram' | 'metro' | 'bus';

export interface FilterOptions {
  types: TransitType[];
  regions: string[];
  completionStatus: 'all' | 'completed' | 'incomplete';
}
