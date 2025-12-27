import {Injectable, signal} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Observable, shareReplay} from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RouteService {
  constructor(private http: HttpClient) {}

  private readonly _selectedRouteId = signal<number | null>(null);
  readonly selectedRouteId = this._selectedRouteId.asReadonly();
  private readonly shapeCache = new Map<number, Observable<any>>();

  baseUrl = 'https://localhost:7233';

  setSelectedRoute(id: number | null): void {
    if (id === null) {
      this._selectedRouteId.set(null);
      return;
    }
    console.log(`Selected route: ${id}`);
    this._selectedRouteId.set(id);
  }

  clearSelectedRoute(): void {
    this._selectedRouteId.set(null);
  }

  getShapeByRouteId(routeId: number): Observable<any> {
    const cached = this.shapeCache.get(routeId);
    if (cached) {
      return cached;
    }
    const request$ = this.http.get(`${this.baseUrl}/api/routes/${routeId}/shape`).pipe(
      shareReplay(1)
    );
    this.shapeCache.set(routeId, request$);
    return request$;
  }
}
