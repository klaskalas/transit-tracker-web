import { Routes } from '@angular/router';
import {MapComponent} from './components/map/map.component';
import {ProgressComponent} from './components/progress/progress.component';
import {AchievementsComponent} from './components/achievements/achievements.component';
import {ProfileComponent} from './components/profile/profile.component';
import {AuthComponent} from './components/auth/auth.component';
import {authGuard} from './services/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'explore',
    pathMatch: 'full'
  },
  {
    path: 'explore',
    component: MapComponent,
    canActivate: [authGuard],
  },
  {
    path: 'map',
    redirectTo: 'explore',
    pathMatch: 'full'
  },
  {
    path: 'progress',
    component: ProgressComponent,
    canActivate: [authGuard],
  },
  {
    path: 'achievements',
    component: AchievementsComponent,
    canActivate: [authGuard],
  },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [authGuard],
  },
  {
    path: 'login',
    component: AuthComponent,
  },
  {
    path: 'lines/:lineId',
    loadComponent: () => import('./components/map/line-detail/line-detail.component').then(m => m.LineDetailComponent),
    canActivate: [authGuard],
  }
];
