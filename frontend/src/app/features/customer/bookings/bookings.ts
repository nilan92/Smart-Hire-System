import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { BookingStore } from '../../../core/services/booking.service';
import { MarketplaceServiceStore } from '../../../core/services/marketplace.service';
import { BookingStatus } from '../../../core/models/booking.models';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';
import { ErrorMessage } from '../../../shared/components/error-message/error-message';
import { LoadingSpinner } from '../../../shared/components/loading-spinner/loading-spinner';

type FilterTab = 'all' | 'upcoming' | 'completed' | 'cancelled';

@Component({
  selector: 'app-customer-bookings',
  imports: [CommonModule, FormsModule, LoadingSpinner, ErrorMessage, EmptyState],
  templateUrl: './bookings.html',
  styleUrl: './bookings.scss',
})
export class CustomerBookings implements OnInit {
  readonly store = inject(BookingStore);
  readonly marketplace = inject(MarketplaceServiceStore);

  readonly tab = signal<FilterTab>('all');
  readonly showForm = signal(false);
  readonly submitting = signal(false);
  readonly formError = signal('');

  readonly serviceId = signal(0);
  readonly bookingDate = signal('');
  readonly bookingTime = signal('');
  readonly notes = signal('');

  readonly activeServices = computed(() =>
    this.marketplace.services().filter((service) => service.status === 'active'),
  );

  readonly filteredBookings = computed(() => {
    const items = [...this.store.bookings()].sort(
      (a, b) => new Date(b.booking_date).getTime() - new Date(a.booking_date).getTime(),
    );
    const tab = this.tab();
    if (tab === 'all') return items;
    if (tab === 'upcoming') return items.filter((b) => ['pending', 'accepted', 'in_progress'].includes(b.status));
    if (tab === 'completed') return items.filter((b) => b.status === 'completed');
    return items.filter((b) => b.status === 'cancelled' || b.status === 'rejected');
  });

  ngOnInit(): void {
    this.store.loadCustomerBookings();
    this.marketplace.loadMarketplace();
  }

  setTab(tab: FilterTab): void {
    this.tab.set(tab);
  }

  openForm(): void {
    this.formError.set('');
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.serviceId.set(0);
    this.bookingDate.set('');
    this.bookingTime.set('');
    this.notes.set('');
    this.formError.set('');
  }

  submitBooking(): void {
    if (!this.serviceId() || !this.bookingDate() || !this.bookingTime()) {
      this.formError.set('Please choose a service, date and time.');
      return;
    }
    const isoDate = new Date(`${this.bookingDate()}T${this.bookingTime()}`).toISOString();

    this.submitting.set(true);
    this.formError.set('');
    this.store
      .createBooking({
        service_id: this.serviceId(),
        booking_date: isoDate,
        notes: this.notes().trim() || null,
      })
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.closeForm();
        },
        error: (err) => {
          this.submitting.set(false);
          this.formError.set(err?.error?.detail ?? 'Could not create the booking. Please try again.');
        },
      });
  }

  cancelBooking(id: number): void {
    if (confirm('Cancel this booking?')) {
      this.store.cancelBooking(id);
    }
  }

  canCancel(status: BookingStatus): boolean {
    return status === 'pending' || status === 'accepted';
  }

  statusLabel(status: BookingStatus): string {
    return status.replace('_', ' ');
  }

  minDate(): string {
    return new Date().toISOString().slice(0, 10);
  }
}
