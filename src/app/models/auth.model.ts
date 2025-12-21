export interface AuthUser {
  id: string;
  email: string;
  displayName?: string | null;
}

export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}
