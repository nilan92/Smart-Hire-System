import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Routes } from '@angular/router';

import { CustomerLayout } from './customer-layout';

@Component({ template: '' })
class BlankComponent {
}

describe('CustomerLayout', () => {
  const routes: Routes = [{ path: '', component: BlankComponent }];

  beforeEach(async () => {
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
      imports: [CustomerLayout],
      providers: [provideRouter(routes)],
    }).compileComponents();
  });

  it('renders navigation and router outlet shell', () => {
    const fixture = TestBed.createComponent(CustomerLayout);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('router-outlet')).toBeTruthy();

    // "My Profile" lives inside the navbar's profile dropdown, collapsed by default.
    const profileButton: HTMLElement = fixture.nativeElement.querySelector('.profile-btn');
    expect(profileButton).toBeTruthy();
    profileButton.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('My Profile');
  });
});
