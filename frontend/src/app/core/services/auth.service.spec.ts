import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
  });

  it('clears token and user state on logout', () => {
    const service = TestBed.inject(AuthService);

    service.login({ email: 'customer@example.com', password: 'Password123' }).subscribe();
    TestBed.inject(HttpTestingController).expectOne(`${environment.apiUrl}/auth/login`).flush({
      access_token: 'jwt-token',
      token_type: 'bearer',
      user: {
        id: 1,
        email: 'customer@example.com',
        full_name: 'Customer',
        phone: null,
        role: 'customer',
        status: 'active',
        email_verified: false,
        created_at: '',
        updated_at: '',
      },
    });

    service.logout();

    expect(localStorage.getItem('smart_hire_access_token')).toBeNull();
    expect(service.currentUser()).toBeNull();
  });
});
