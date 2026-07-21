import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../../../environments/environment';
import { API_ENDPOINTS } from '../../../core/utils/api-endpoints';
import { BookingStore } from '../../../core/services/booking.service';
import { Payment } from '../../../core/models/booking.models';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';
import { LoadingSpinner } from '../../../shared/components/loading-spinner/loading-spinner';

@Component({
  selector: 'app-provider-payments',
  imports: [CommonModule, LoadingSpinner, EmptyState],
  templateUrl: './payments.html',
  styleUrl: './payments.scss',
})
export class ProviderPayments implements OnInit {
  private readonly http = inject(HttpClient);
  readonly store = inject(BookingStore);

  readonly payments = signal<Payment[]>([]);
  readonly loading = signal(true);

  readonly totalEarned = computed(() =>
    this.payments()
      .filter((p) => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0),
  );

  readonly pendingCount = computed(() => this.payments().filter((p) => p.status === 'pending').length);

  ngOnInit(): void {
    this.store.loadProviderBookings();
    this.http.get<Payment[]>(`${environment.apiUrl}${API_ENDPOINTS.payments.myProviderPayments}`).subscribe({
      next: (payments) => {
        this.payments.set(payments);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  serviceNameFor(payment: Payment): string {
    return this.store.bookings().find((b) => b.id === payment.booking_id)?.service_name ?? `Booking #${payment.booking_id}`;
  }
}
