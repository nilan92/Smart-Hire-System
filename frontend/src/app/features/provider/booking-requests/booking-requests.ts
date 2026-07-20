import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';

import { BookingStatus } from '../../../core/models/booking.models';
import { BookingStore } from '../../../core/services/booking.service';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';
import { ErrorMessage } from '../../../shared/components/error-message/error-message';
import { LoadingSpinner } from '../../../shared/components/loading-spinner/loading-spinner';

type FilterTab = 'all' | 'pending' | 'accepted' | 'completed' | 'cancelled';

@Component({
  selector: 'app-provider-booking-requests',
  imports: [CommonModule, LoadingSpinner, ErrorMessage, EmptyState],
  templateUrl: './booking-requests.html',
  styleUrl: './booking-requests.scss',
})
export class ProviderBookingRequests implements OnInit {
  readonly store = inject(BookingStore);
  readonly tab = signal<FilterTab>('pending');

  readonly pendingCount = computed(() => this.store.bookings().filter((b) => b.status === 'pending').length);

  readonly filteredBookings = computed(() => {
    const items = [...this.store.bookings()].sort(
      (a, b) => new Date(b.booking_date).getTime() - new Date(a.booking_date).getTime(),
    );
    const tab = this.tab();
    if (tab === 'all') return items;
    if (tab === 'pending') return items.filter((b) => b.status === 'pending');
    if (tab === 'accepted') return items.filter((b) => b.status === 'accepted' || b.status === 'in_progress');
    if (tab === 'completed') return items.filter((b) => b.status === 'completed');
    return items.filter((b) => b.status === 'rejected' || b.status === 'cancelled');
  });

  ngOnInit(): void {
    this.store.loadProviderBookings();
  }

  setTab(tab: FilterTab): void {
    this.tab.set(tab);
  }

  accept(id: number): void {
    this.store.acceptBooking(id);
  }

  reject(id: number): void {
    if (confirm('Reject this booking request?')) {
      this.store.rejectBooking(id);
    }
  }

  complete(id: number): void {
    this.store.completeBooking(id);
  }

  statusLabel(status: BookingStatus): string {
    return status.replace('_', ' ');
  }
}
