import {RouteType} from './enums';

export interface TransitLine {
  id: string;
  agencyId: string;
  gtfsRouteId: string;
  shortName: string;
  longName: string;
  routeType: RouteType;
  region: string;
  color: string;
  completed: boolean;
  completedDate?: Date;
  points: number;
}

export interface FilterOptions {
  types: RouteType[];
  regions: string[];
  completionStatus: 'all' | 'completed' | 'incomplete';
}
