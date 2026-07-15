import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../../environments/environment';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });
  });

  it('adds Authorization header when token exists', () => {
    localStorage.setItem('smart_hire_access_token', 'jwt-token');
    TestBed.inject(HttpClient).get(`${environment.apiUrl}/auth/me`).subscribe();

    const request = TestBed.inject(HttpTestingController).expectOne(`${environment.apiUrl}/auth/me`);

    expect(request.request.headers.get('Authorization')).toBe('Bearer jwt-token');
  });
});
