import {RouteType} from './enums';

export interface TransitLine {
  id: number;
  agency: Agency;
  gtfsRouteId: string;
  shortName: string;
  longName: string;
  routeType: RouteType;
  region: string;
  color: string;
  stopCount?: number;
  completed: boolean;
  completedDate?: Date;
  points: number;
}

export interface FilterOptions {
  types: RouteType[];
  regions: string[];
  completionStatus: 'all' | 'completed' | 'incomplete';
}

export interface Agency {
  id: number;
  name: string;
  agencyUrl: string;
  timezone: string;
  countryCode: string;
}
