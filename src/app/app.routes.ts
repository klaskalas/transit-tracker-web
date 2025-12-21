import { Routes } from '@angular/router';
import {RouteViewerComponent} from './components/map/route-viewer/route-viewer';
import {MapComponent} from './components/map/map.component';
import {ProgressComponent} from './components/progress/progress.component';
import {AchievementsComponent} from './components/achievements/achievements.component';
import {ProfileComponent} from './components/profile/profile.component';
import {AuthComponent} from './components/auth/auth.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'map',
    pathMatch: 'full'
  },
  {
    path: 'map',
    component: MapComponent,
  },
  {
    path: 'progress',
    component: ProgressComponent,
  },
  {
    path: 'achievements',
    component: AchievementsComponent,
  },
  {
    path: 'profile',
    component: ProfileComponent,
  },
  {
    path: 'login',
    component: AuthComponent,
  },
  {
    path: 'routes/:shapeId',
    component: RouteViewerComponent,
  }
];
