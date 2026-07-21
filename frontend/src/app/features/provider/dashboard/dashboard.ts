import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { catchError, of, take } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { API_ENDPOINTS } from '../../../core/utils/api-endpoints';
import { User, ProviderProfile } from '../../../core/models/auth.models';
import { Booking } from '../../../core/models/booking.models';
import { AuthService } from '../../../core/services/auth.service';
import { BookingStore } from '../../../core/services/booking.service';
import { ToastService } from '../../../core/services/toast.service';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { LoadingSpinner } from '../../../shared/components/loading-spinner/loading-spinner';
import { ErrorMessage } from '../../../shared/components/error-message/error-message';

export interface MyService {
  id: number;
  title: string;
  category_id: number;
  price: number;
  city: string;
  status: string;
  rating?: number;
  review_count?: number;
}

@Component({
  selector: 'app-provider-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, PageHeader, LoadingSpinner, ErrorMessage],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class ProviderDashboard implements OnInit {
  private readonly authService = inject(AuthService);
  readonly bookingStore = inject(BookingStore);
  private readonly http = inject(HttpClient);
  private readonly toast = inject(ToastService);
  private readonly apiUrl = environment.apiUrl;

  user: User | null = this.authService.currentUser();
  providerProfile: ProviderProfile | null = null;
  services: MyService[] = [];
  
  loading = false;
  errorMessage = '';

  ngOnInit(): void {
    this.user = this.authService.currentUser();
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    // If we have no cached user, show initial loading indicator brief
    if (!this.user) {
      this.loading = true;
    }
    this.errorMessage = '';

    // Load current user details
    this.authService.loadCurrentUser().pipe(
      take(1),
      catchError(() => of(this.user))
    ).subscribe((user) => {
      if (user) this.user = user;
      this.loading = false;
    });

    // Load provider profile details
    this.authService.loadProviderProfile().pipe(
      take(1),
      catchError(() => of(null))
    ).subscribe((profile) => {
      this.providerProfile = profile;
    });

    // Load provider active services
    this.http.get<MyService[]>(`${this.apiUrl}${API_ENDPOINTS.services.mine}`).pipe(
      take(1),
      catchError(() => of([]))
    ).subscribe((services) => {
      this.services = services || [];
    });

    // Load provider incoming booking requests into store
    try {
      this.bookingStore.loadProviderBookings();
    } catch {
      // Ignore booking store fetch error fallback
    }
  }

  get pendingRequestsCount(): number {
    return this.bookingStore.bookings().filter(b => b.status === 'pending').length;
  }

  get completedJobsCount(): number {
    return this.bookingStore.bookings().filter(b => b.status === 'completed').length;
  }

  get totalRevenue(): number {
    const completed = this.bookingStore.bookings().filter(b => b.status === 'completed');
    if (completed.length > 0) {
      return completed.length * 120.00;
    }
    return 0.00;
  }

  get pendingBookings(): Booking[] {
    return this.bookingStore.bookings().filter(b => b.status === 'pending');
  }

  get recentBookings(): Booking[] {
    return this.bookingStore.bookings().slice(0, 5);
  }

  acceptRequest(id: number): void {
    this.bookingStore.acceptBooking(id);
    this.toast.show('Booking request accepted successfully!', 'success');
  }

  rejectRequest(id: number): void {
    this.bookingStore.rejectBooking(id);
    this.toast.show('Booking request rejected.', 'info');
  }

  completeBooking(id: number): void {
    this.bookingStore.completeBooking(id);
    this.toast.show('Booking marked as completed!', 'success');
  }

  getStatusBadgeClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'pending': return 'badge-pending';
      case 'accepted': return 'badge-accepted';
      case 'in_progress': return 'badge-in-progress';
      case 'completed': return 'badge-completed';
      case 'rejected': case 'cancelled': return 'badge-rejected';
      default: return 'badge-neutral';
    }
  }

  getVerificationBadgeClass(status?: string): string {
    switch (status?.toLowerCase()) {
      case 'verified': return 'status-verified';
      case 'pending': return 'status-pending';
      default: return 'status-unverified';
    }
  }
}
