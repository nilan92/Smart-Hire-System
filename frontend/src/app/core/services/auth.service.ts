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
import { TokenService } from './token.service';
import { API_ENDPOINTS } from '../utils/api-endpoints';
import { APP_ROUTES } from '../utils/app-routes';

const USER_KEY = 'smart_hire_current_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = environment.apiUrl;
  private readonly currentUserSignal = signal<User | null>(this.readStoredUser());

  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isAuthenticated = computed(() => Boolean(this.currentUserSignal()) || Boolean(this.getToken()));

  constructor(
    private readonly http: HttpClient,
    private readonly tokenService: TokenService,
  ) {}

  login(payload: LoginRequest): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(`${this.apiUrl}${API_ENDPOINTS.auth.login}`, payload).pipe(
      tap((response) => {
        this.tokenService.setToken(response.access_token);
        localStorage.setItem(USER_KEY, JSON.stringify(response.user));
        this.currentUserSignal.set(response.user);
      }),
    );
  }

  register(payload: RegisterRequest): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}${API_ENDPOINTS.auth.register}`, payload);
  }

  loadCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}${API_ENDPOINTS.auth.me}`).pipe(
      timeout(10000),
      tap((user) => {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        this.currentUserSignal.set(user);
      }),
    );
  }

  updateUserProfile(payload: UserProfileUpdate): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}${API_ENDPOINTS.users.me}`, payload).pipe(
      tap((user) => {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        this.currentUserSignal.set(user);
      }),
    );
  }

  loadProviderProfile(): Observable<ProviderProfile> {
    return this.http.get<ProviderProfile>(`${this.apiUrl}${API_ENDPOINTS.users.providerProfile}`).pipe(timeout(10000));
  }

  updateProviderProfile(payload: ProviderProfileUpdate): Observable<ProviderProfile> {
    return this.http.put<ProviderProfile>(`${this.apiUrl}${API_ENDPOINTS.users.providerProfile}`, payload);
  }

  logout(): void {
    this.tokenService.clearToken();
    localStorage.removeItem(USER_KEY);
    this.currentUserSignal.set(null);
  }

  getToken(): string | null {
    return this.tokenService.getToken();
  }

  getRoleRedirect(user: User | null = this.currentUserSignal()): string {
    if (user?.role === 'admin') {
      return APP_ROUTES.admin.dashboard;
    }
    if (user?.role === 'provider') {
      return APP_ROUTES.provider.profile;
    }
    if (user?.role === 'customer') {
      return APP_ROUTES.customer.profile;
    }
    return APP_ROUTES.unauthorized;
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
