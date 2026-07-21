import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { environment } from '../../../../environments/environment';
import { API_ENDPOINTS } from '../../../core/utils/api-endpoints';
import { BookingStore } from '../../../core/services/booking.service';
import { MarketplaceServiceStore } from '../../../core/services/marketplace.service';
import { Booking, BookingStatus, Payment } from '../../../core/models/booking.models';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';
import { ErrorMessage } from '../../../shared/components/error-message/error-message';
import { LoadingSpinner } from '../../../shared/components/loading-spinner/loading-spinner';
import { PaymentStatusComponent } from '../../payments/payment-status/payment-status';

type FilterTab = 'all' | 'upcoming' | 'completed' | 'cancelled';

@Component({
  selector: 'app-customer-bookings',
  imports: [CommonModule, FormsModule, LoadingSpinner, ErrorMessage, EmptyState, PaymentStatusComponent],
  templateUrl: './bookings.html',
  styleUrl: './bookings.scss',
})
export class CustomerBookings implements OnInit {
  private readonly http = inject(HttpClient);
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

  readonly payments = signal<Payment[]>([]);
  readonly payingBookingId = signal<number | null>(null);

  readonly paidBookingIds = computed(() => new Set(this.payments().map((p) => p.booking_id)));

  readonly payingBooking = computed<Booking | undefined>(() =>
    this.store.bookings().find((b) => b.id === this.payingBookingId()),
  );

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
    this.fetchPayments();
  }

  fetchPayments(): void {
    this.http.get<Payment[]>(`${environment.apiUrl}${API_ENDPOINTS.payments.myCustomerPayments}`).subscribe({
      next: (payments) => this.payments.set(payments),
      error: () => {},
    });
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

  canPay(booking: Booking): boolean {
    return booking.status === 'completed' && !this.paidBookingIds().has(booking.id);
  }

  isPaid(bookingId: number): boolean {
    return this.paidBookingIds().has(bookingId);
  }

  statusLabel(status: BookingStatus): string {
    return status.replace('_', ' ');
  }

  minDate(): string {
    return new Date().toISOString().slice(0, 10);
  }

  amountFor(booking: Booking): number {
    return this.marketplace.services().find((s) => s.id === booking.service_id)?.price ?? 0;
  }

  openPayment(bookingId: number): void {
    this.payingBookingId.set(bookingId);
  }

  closePayment(): void {
    this.payingBookingId.set(null);
  }

  onPaid(payment: Payment): void {
    this.payments.update((items) => [payment, ...items]);
  }
}
