import { Injectable } from '@angular/core';

const TOKEN_KEY = 'smart_hire_access_token';

@Injectable({ providedIn: 'root' })
export class TokenService {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }

  clearToken(): void {
    localStorage.removeItem(TOKEN_KEY);
  }

  hasToken(): boolean {
    return Boolean(this.getToken());
  }
}
