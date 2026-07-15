import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, Routes } from '@angular/router';
import { Component } from '@angular/core';

import { authGuard } from './auth.guard';

@Component({ template: '' })
class BlankComponent {}

describe('authGuard', () => {
  const routes: Routes = [{ path: 'login', component: BlankComponent }];

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideRouter(routes)],
    });
  });

  it('rejects missing token', () => {
    const result = TestBed.runInInjectionContext(() => authGuard({} as never, {} as never));

    expect(TestBed.inject(Router).serializeUrl(result as never)).toBe('/login');
  });
});
