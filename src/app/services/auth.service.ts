import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable, tap} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {AuthResponse, AuthUser} from '../models/auth.model';

type LoginPayload = {
  email: string;
  password: string;
};

type RegisterPayload = {
  email: string;
  password: string;
  displayName?: string;
};

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly baseUrl = 'https://localhost:7233/api/auth';
  private readonly tokenKey = 'transit_tracker_token';
  private readonly userKey = 'transit_tracker_user';
  private readonly userSubject = new BehaviorSubject<AuthUser | null>(this.getStoredUser());

  readonly user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient) {}

  login(payload: LoginPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, payload).pipe(
      tap(response => this.storeAuth(response))
    );
  }

  register(payload: RegisterPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/register`, payload).pipe(
      tap(response => this.storeAuth(response))
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.userSubject.next(null);
  }

  getToken(): string | null {
    const token = localStorage.getItem(this.tokenKey);
    if (!token || !this.isTokenValid(token)) {
      this.clearStoredAuth();
      return null;
    }
    return token;
  }

  getCurrentUser(): AuthUser | null {
    return this.userSubject.value;
  }

  private storeAuth(response: AuthResponse): void {
    localStorage.setItem(this.tokenKey, response.accessToken);
    localStorage.setItem(this.userKey, JSON.stringify(response.user));
    this.userSubject.next(response.user);
  }

  private getStoredUser(): AuthUser | null {
    const stored = localStorage.getItem(this.userKey);
    if (!stored) {
      return null;
    }
    try {
      return JSON.parse(stored) as AuthUser;
    } catch {
      return null;
    }
  }

  private isTokenValid(token: string): boolean {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return false;
    }
    try {
      const payload = JSON.parse(atob(this.padBase64(parts[1])));
      if (!payload?.exp) {
        return false;
      }
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }

  private padBase64(value: string): string {
    const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
    return normalized.padEnd(normalized.length + (4 - (normalized.length % 4)) % 4, '=');
  }

  private clearStoredAuth(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.userSubject.next(null);
  }
}
