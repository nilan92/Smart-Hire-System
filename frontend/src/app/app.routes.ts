import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { APP_ROUTES } from './core/utils/app-routes';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./features/home/home').then((m) => m.Home) },
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
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/customer/dashboard/dashboard').then((m) => m.CustomerDashboard),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/customer/profile/profile').then((m) => m.CustomerProfile),
      },
      {
        path: 'services',
        loadComponent: () =>
          import('./features/customer/browse-services/browse-services').then((m) => m.CustomerBrowseServices),
      },
      {
        path: 'favourites',
        loadComponent: () =>
          import('./features/customer/favourites/favourites').then((m) => m.CustomerFavourites),
      },
      {
        path: 'bookings',
        loadComponent: () =>
          import('./features/customer/bookings/bookings').then((m) => m.CustomerBookings),
      },
      {
        path: 'notifications',
        loadComponent: () =>
          import('./features/customer/notifications/notifications').then((m) => m.CustomerNotifications),
      },
      {
        path: 'reviews',
        loadComponent: () =>
          import('./features/customer/reviews/reviews').then((m) => m.CustomerReviews),
      },
      {
        path: 'ai-assistant',
        loadComponent: () =>
          import('./features/customer/ai-assistant/ai-assistant').then((m) => m.CustomerAiAssistant),
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
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/provider/dashboard/dashboard').then((m) => m.ProviderDashboard),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/provider/profile/profile').then((m) => m.ProviderProfile),
      },
      {
        path: 'services',
        loadComponent: () =>
          import('./features/provider/services/services').then((m) => m.ProviderServices),
      },
      {
        path: 'service-areas',
        loadComponent: () =>
          import('./features/provider/service-areas/service-areas').then((m) => m.ProviderServiceAreas),
      },
      {
        path: 'booking-requests',
        loadComponent: () =>
          import('./features/provider/booking-requests/booking-requests').then((m) => m.ProviderBookingRequests),
      },
      {
        path: 'availability',
        loadComponent: () =>
          import('./features/provider/availability/availability').then((m) => m.ProviderAvailability),
      },
      {
        path: 'notifications',
        loadComponent: () =>
          import('./features/provider/notifications/notifications').then((m) => m.ProviderNotifications),
      },
      {
        path: 'reviews',
        loadComponent: () =>
          import('./features/provider/reviews/reviews').then((m) => m.ProviderReviews),
      },
      {
        path: 'payments',
        loadComponent: () =>
          import('./features/provider/payments/payments').then((m) => m.ProviderPayments),
      },
      {
        path: 'ai-insights',
        loadComponent: () =>
          import('./features/provider/ai-insights/ai-insights').then((m) => m.ProviderAiInsights),
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
