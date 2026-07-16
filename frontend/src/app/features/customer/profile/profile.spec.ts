import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { environment } from '../../../../environments/environment';
import { CustomerProfile } from './profile';

describe('CustomerProfile', () => {
  beforeEach(async () => {
    localStorage.setItem('smart_hire_access_token', 'jwt-token');
    localStorage.setItem(
      'smart_hire_current_user',
      JSON.stringify({
        id: 1,
        email: 'customer@example.com',
        full_name: 'Customer',
        phone: null,
        role: 'customer',
        status: 'active',
        email_verified: false,
        created_at: '',
        updated_at: '',
      }),
    );

    await TestBed.configureTestingModule({
      imports: [CustomerProfile],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();
  });

  it('updates permitted profile fields', () => {
    const fixture = TestBed.createComponent(CustomerProfile);
    fixture.detectChanges();

    const http = TestBed.inject(HttpTestingController);
    http.expectOne(`${environment.apiUrl}/auth/me`).flush({
      id: 1,
      email: 'customer@example.com',
      full_name: 'Customer',
      phone: null,
      role: 'customer',
      status: 'active',
      email_verified: false,
      created_at: '',
      updated_at: '',
    });

    fixture.componentInstance.form.setValue({ full_name: 'Updated Customer', phone: '0711111111' });
    fixture.componentInstance.save();

    const request = http.expectOne(`${environment.apiUrl}/users/me`);
    expect(request.request.body).toEqual({ full_name: 'Updated Customer', phone: '0711111111' });
  });
});
