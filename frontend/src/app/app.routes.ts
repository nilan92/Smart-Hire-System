import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { APP_ROUTES } from './core/utils/app-routes';

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
    path: 'not-found',
    loadComponent: () =>
      import('./features/auth/not-found/not-found').then((m) => m.NotFound),
  },
  {
    path: 'customer',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['customer'] },
    loadComponent: () =>
      import('./shared/layouts/customer-layout/customer-layout').then((m) => m.CustomerLayout),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'profile' },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/customer/profile/profile').then((m) => m.CustomerProfile),
      },
    ],
  },
  {
    path: 'provider',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['provider'] },
    loadComponent: () =>
      import('./shared/layouts/provider-layout/provider-layout').then((m) => m.ProviderLayout),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'profile' },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/provider/profile/profile').then((m) => m.ProviderProfile),
      },
    ],
  },
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin'] },
    loadComponent: () => import('./features/admin/admin-layout/admin-layout').then((m) => m.AdminLayoutComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/admin/admin-dashboard/admin-dashboard').then((m) => m.AdminDashboardComponent),
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./features/admin/user-management/user-management').then((m) => m.UserManagementComponent),
      },
      {
        path: 'categories',
        loadComponent: () =>
          import('./features/admin/category-management/category-management').then((m) => m.CategoryManagementComponent),
      },
      {
        path: 'services',
        loadComponent: () =>
          import('./features/admin/service-moderation/service-moderation').then((m) => m.ServiceModerationComponent),
      },
      {
        path: 'bookings',
        loadComponent: () =>
          import('./features/admin/booking-monitoring/booking-monitoring').then((m) => m.BookingMonitoringComponent),
      },
      {
        path: 'reviews',
        loadComponent: () =>
          import('./features/admin/review-moderation/review-moderation').then((m) => m.ReviewModerationComponent),
      },
      {
        path: 'payments',
        loadComponent: () =>
          import('./features/admin/payment-management/payment-management').then((m) => m.PaymentManagementComponent),
      },
      {
        path: 'test-system',
        loadComponent: () => import('./features/admin/test-system/test-system').then((m) => m.TestSystemComponent),
      },
    ],
  },
  {
    path: 'payments/status',
    loadComponent: () =>
      import('./features/payments/payment-status/payment-status').then((m) => m.PaymentStatusComponent),
  },
  { path: '**', redirectTo: APP_ROUTES.notFound.slice(1) },
];
