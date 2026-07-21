import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { take, catchError, of } from 'rxjs';

import { User } from '../../../core/models/auth.models';
import { Booking } from '../../../core/models/booking.models';
import { MarketplaceService, ServiceCategory } from '../../../core/models/service.models';
import { AuthService } from '../../../core/services/auth.service';
import { BookingStore } from '../../../core/services/booking.service';
import { MarketplaceServiceStore } from '../../../core/services/marketplace.service';
import { ToastService } from '../../../core/services/toast.service';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { LoadingSpinner } from '../../../shared/components/loading-spinner/loading-spinner';
import { ErrorMessage } from '../../../shared/components/error-message/error-message';

@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, PageHeader, LoadingSpinner, ErrorMessage],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class CustomerDashboard implements OnInit {
  private readonly authService = inject(AuthService);
  readonly bookingStore = inject(BookingStore);
  readonly marketplaceStore = inject(MarketplaceServiceStore);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  user: User | null = this.authService.currentUser();
  searchQuery = '';
  loading = false;
  errorMessage = '';

  ngOnInit(): void {
    this.user = this.authService.currentUser();
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    if (!this.user) {
      this.loading = true;
    }
    this.errorMessage = '';

    // Load current user
    this.authService.loadCurrentUser().pipe(
      take(1),
      catchError(() => of(this.user))
    ).subscribe((user) => {
      if (user) this.user = user;
      this.loading = false;
      this.cdr.detectChanges();
    });

    // Load customer data in store
    try {
      this.bookingStore.loadCustomerBookings();
      this.marketplaceStore.loadCustomerData();
    } catch {
      // Ignore fallback errors
    }
  }

  get activeBookingsCount(): number {
    return this.bookingStore.bookings().filter(
      b => b.status === 'pending' || b.status === 'accepted' || b.status === 'in_progress'
    ).length;
  }

  get completedBookingsCount(): number {
    return this.bookingStore.bookings().filter(b => b.status === 'completed').length;
  }

  get savedFavouritesCount(): number {
    return this.marketplaceStore.favourites().length;
  }

  get activeBookingsList(): Booking[] {
    return this.bookingStore.bookings().filter(
      b => b.status === 'pending' || b.status === 'accepted' || b.status === 'in_progress'
    );
  }

  get recentBookingsList(): Booking[] {
    return this.bookingStore.bookings().slice(0, 5);
  }

  get categories(): ServiceCategory[] {
    return this.marketplaceStore.categories();
  }

  get featuredServices(): MarketplaceService[] {
    return this.marketplaceStore.services().slice(0, 4);
  }

  cancelBooking(id: number): void {
    this.bookingStore.cancelBooking(id);
    this.toast.show('Booking request cancelled.', 'info');
  }

  onSearch(): void {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/customer/services'], { queryParams: { q: this.searchQuery.trim() } });
    } else {
      this.router.navigate(['/customer/services']);
    }
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
}
