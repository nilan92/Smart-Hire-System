import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { environment } from '../../../../environments/environment';
import { ProviderProfile } from './profile';

describe('ProviderProfile', () => {
  beforeEach(async () => {
    localStorage.setItem('smart_hire_access_token', 'jwt-token');
    localStorage.setItem(
      'smart_hire_current_user',
      JSON.stringify({
        id: 2,
        email: 'provider@example.com',
        full_name: 'Provider',
        phone: null,
        role: 'provider',
        status: 'active',
        email_verified: false,
        created_at: '',
        updated_at: '',
      }),
    );

    await TestBed.configureTestingModule({
      imports: [ProviderProfile],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();
  });

  it('updates permitted provider fields', () => {
    const fixture = TestBed.createComponent(ProviderProfile);
    fixture.detectChanges();

    const http = TestBed.inject(HttpTestingController);
    http.expectOne(`${environment.apiUrl}/auth/me`).flush({
      id: 2,
      email: 'provider@example.com',
      full_name: 'Provider',
      phone: null,
      role: 'provider',
      status: 'active',
      email_verified: false,
      created_at: '',
      updated_at: '',
    });
    http.expectOne(`${environment.apiUrl}/users/provider-profile`).flush({
      user_id: 2,
      bio: 'Old bio',
      years_experience: 3,
      verification_status: 'unverified',
      avg_rating: '0.00',
      total_reviews: 0,
      created_at: '',
      updated_at: '',
    });

    fixture.componentInstance.form.setValue({
      full_name: 'Updated Provider',
      phone: '0722222222',
      bio: 'New bio',
      years_experience: 5,
    });
    fixture.componentInstance.save();

    expect(http.expectOne(`${environment.apiUrl}/users/me`).request.body).toEqual({
      full_name: 'Updated Provider',
      phone: '0722222222',
    });
    expect(http.expectOne(`${environment.apiUrl}/users/provider-profile`).request.body).toEqual({
      bio: 'New bio',
      years_experience: 5,
    });
  });
});
