import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register').then((m) => m.Register),
  },
  {
    path: 'unauthorized',
    loadComponent: () =>
      import('./features/auth/unauthorized/unauthorized').then((m) => m.Unauthorized),
  },
  {
    path: 'customer/profile',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['customer'] },
    loadComponent: () =>
      import('./features/customer/profile/profile').then((m) => m.CustomerProfile),
  },
  {
    path: 'provider/profile',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['provider'] },
    loadComponent: () =>
      import('./features/provider/profile/profile').then((m) => m.ProviderProfile),
  },
  {
    path: 'admin/dashboard',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin'] },
    loadComponent: () =>
      import('./features/admin/dashboard/dashboard').then((m) => m.AdminDashboard),
  },
  { path: '**', redirectTo: 'login' },
];
