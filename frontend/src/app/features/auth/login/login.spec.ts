import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { environment } from '../../../../environments/environment';
import { Login } from './login';

describe('Login', () => {
  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();
  });

  it('validates required fields', () => {
    const fixture = TestBed.createComponent(Login);
    fixture.componentInstance.submit();

    expect(fixture.componentInstance.form.invalid).toBe(true);
  });

  it('stores token after login', () => {
    const fixture = TestBed.createComponent(Login);
    const router = TestBed.inject(Router);
    vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    fixture.componentInstance.form.setValue({
      email: 'customer@example.com',
      password: 'Password123',
    });

    fixture.componentInstance.submit();

    const http = TestBed.inject(HttpTestingController);
    http.expectOne(`${environment.apiUrl}/auth/login`).flush({
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

    expect(localStorage.getItem('smart_hire_access_token')).toBe('jwt-token');
  });
});
