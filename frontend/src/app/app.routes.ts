import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './features/admin/admin-layout/admin-layout';
import { AdminDashboardComponent } from './features/admin/admin-dashboard/admin-dashboard';
import { UserManagementComponent } from './features/admin/user-management/user-management';
import { CategoryManagementComponent } from './features/admin/category-management/category-management';
import { ServiceModerationComponent } from './features/admin/service-moderation/service-moderation';
import { BookingMonitoringComponent } from './features/admin/booking-monitoring/booking-monitoring';
import { ReviewModerationComponent } from './features/admin/review-moderation/review-moderation';
import { PaymentManagementComponent } from './features/admin/payment-management/payment-management';
import { TestSystemComponent } from './features/admin/test-system/test-system';
import { PaymentStatusComponent } from './features/payments/payment-status/payment-status';
import { SubmitReviewFormComponent } from './features/reviews/submit-review-form/submit-review-form';
import { ProviderReviewListComponent } from './features/reviews/provider-review-list/provider-review-list';
import { LoginComponent } from './features/admin/login/login';
import { authGuard } from './core/guards/auth.guard';

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
