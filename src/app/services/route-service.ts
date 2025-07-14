import {Injectable, signal} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RouteService {
  constructor(private http: HttpClient) {}

  private readonly _selectedRouteId = signal<string | null>(null);
  readonly selectedRouteId = this._selectedRouteId.asReadonly();

  baseUrl = 'http://localhost:5134';

  setSelectedRoute(id: string): void {
    console.log(`Selected route: ${id}`);
    this._selectedRouteId.set(id);
  }

  getShapeByRouteId(routeId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/routes/${routeId}/shape`);
  }
}
