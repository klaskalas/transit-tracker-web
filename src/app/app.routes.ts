import { Routes } from '@angular/router';
import {RouteViewerComponent} from './route-viewer/route-viewer';
export const routes: Routes = [
  {
    path: 'routes/:shapeId',
    component: RouteViewerComponent,
  }
];
