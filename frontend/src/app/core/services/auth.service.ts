import { HttpClient } from '@angular/common/http';
import { Injectable, computed, signal } from '@angular/core';
import { Observable, tap, timeout } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  LoginRequest,
  ProviderProfile,
  ProviderProfileUpdate,
  RegisterRequest,
  TokenResponse,
  User,
  UserProfileUpdate,
} from '../models/auth.models';

const TOKEN_KEY = 'smart_hire_access_token';
const USER_KEY = 'smart_hire_current_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = environment.apiUrl;
  private readonly currentUserSignal = signal<User | null>(this.readStoredUser());

  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isAuthenticated = computed(() => Boolean(this.currentUserSignal()) || Boolean(this.getToken()));

  constructor(private readonly http: HttpClient) {}

  login(payload: LoginRequest): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(`${this.apiUrl}/auth/login`, payload).pipe(
      tap((response) => {
        localStorage.setItem(TOKEN_KEY, response.access_token);
        localStorage.setItem(USER_KEY, JSON.stringify(response.user));
        this.currentUserSignal.set(response.user);
      }),
    );
  }

  register(payload: RegisterRequest): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/auth/register`, payload);
  }

  loadCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/auth/me`).pipe(
      timeout(10000),
      tap((user) => {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        this.currentUserSignal.set(user);
      }),
    );
  }

  updateUserProfile(payload: UserProfileUpdate): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/users/me`, payload).pipe(
      tap((user) => {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        this.currentUserSignal.set(user);
      }),
    );
  }

  loadProviderProfile(): Observable<ProviderProfile> {
    return this.http.get<ProviderProfile>(`${this.apiUrl}/users/provider-profile`).pipe(timeout(10000));
  }

  updateProviderProfile(payload: ProviderProfileUpdate): Observable<ProviderProfile> {
    return this.http.put<ProviderProfile>(`${this.apiUrl}/users/provider-profile`, payload);
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.currentUserSignal.set(null);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  private readStoredUser(): User | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw) as User;
    } catch {
      localStorage.removeItem(USER_KEY);
      return null;
    }
  }
}
