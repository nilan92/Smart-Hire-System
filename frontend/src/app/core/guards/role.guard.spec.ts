import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, provideRouter, Router, Routes } from '@angular/router';

import { roleGuard } from './role.guard';

@Component({ template: '' })
class BlankComponent {}

describe('roleGuard', () => {
  const routes: Routes = [{ path: 'unauthorized', component: BlankComponent }];

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideRouter(routes)],
    });
  });

  it('rejects incorrect role', () => {
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
    const route = new ActivatedRouteSnapshot();
    route.data = { roles: ['provider'] };

    const result = TestBed.runInInjectionContext(() => roleGuard(route, {} as never));

    expect(TestBed.inject(Router).serializeUrl(result as never)).toBe('/unauthorized');
  });
});
