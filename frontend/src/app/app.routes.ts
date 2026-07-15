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

export const routes: Routes = [
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', component: AdminDashboardComponent },
      { path: 'users', component: UserManagementComponent },
      { path: 'categories', component: CategoryManagementComponent },
      { path: 'services', component: ServiceModerationComponent },
      { path: 'bookings', component: BookingMonitoringComponent },
      { path: 'reviews', component: ReviewModerationComponent },
      { path: 'payments', component: PaymentManagementComponent },
      { path: 'test-system', component: TestSystemComponent }
    ]
  },
  { path: 'login', component: LoginComponent },
  { path: 'payments/status', component: PaymentStatusComponent },
  { path: 'reviews/submit', component: SubmitReviewFormComponent },
  { path: 'reviews/provider/:id', component: ProviderReviewListComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' }
];
