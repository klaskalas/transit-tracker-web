import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RouteService {
  constructor(private http: HttpClient) {}

  baseUrl = 'http://localhost:5134';

  getRouteByShapeId(shapeId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/routes/${shapeId}/shape`);
  }
}
