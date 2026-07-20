import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiError } from '../models/api.models';
import { Booking, BookingCreateRequest } from '../models/booking.models';
import { API_ENDPOINTS } from '../utils/api-endpoints';
import { ToastService } from './toast.service';

@Injectable({ providedIn: 'root' })
export class BookingStore {
  private readonly http = inject(HttpClient);
  private readonly toast = inject(ToastService);
  private readonly apiUrl = environment.apiUrl;

  readonly bookings = signal<Booking[]>([]);
  readonly loading = signal(false);
  readonly error = signal('');

  loadCustomerBookings(): void {
    this.fetch(`${this.apiUrl}${API_ENDPOINTS.bookings.customer}`, 'Could not load your bookings.');
  }

  loadProviderBookings(): void {
    this.fetch(`${this.apiUrl}${API_ENDPOINTS.bookings.provider}`, 'Could not load booking requests.');
  }

  createBooking(payload: BookingCreateRequest): Observable<Booking> {
    return this.http.post<Booking>(`${this.apiUrl}${API_ENDPOINTS.bookings.create}`, payload).pipe(
      tap((booking) => {
        this.bookings.update((items) => [booking, ...items]);
        this.toast.show('Booking request sent.', 'success');
      }),
    );
  }

  acceptBooking(id: number): void {
    this.updateStatus(id, API_ENDPOINTS.bookings.accept(id), 'Booking accepted.');
  }

  rejectBooking(id: number): void {
    this.updateStatus(id, API_ENDPOINTS.bookings.reject(id), 'Booking rejected.');
  }

  cancelBooking(id: number): void {
    this.updateStatus(id, API_ENDPOINTS.bookings.cancel(id), 'Booking cancelled.');
  }

  completeBooking(id: number): void {
    this.updateStatus(id, API_ENDPOINTS.bookings.complete(id), 'Booking marked as completed.');
  }

  private fetch(url: string, errorMessage: string): void {
    this.loading.set(true);
    this.error.set('');
    this.http.get<Booking[]>(url).subscribe({
      next: (items) => {
        this.bookings.set(items);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(errorMessage);
        this.loading.set(false);
      },
    });
  }

  private updateStatus(id: number, path: string, successMessage: string): void {
    this.http.put<Booking>(`${this.apiUrl}${path}`, {}).subscribe({
      next: (updated) => {
        this.bookings.update((items) => items.map((item) => (item.id === id ? updated : item)));
        this.toast.show(successMessage, 'success');
      },
      error: (err) => this.toast.show(this.extractError(err), 'error'),
    });
  }

  private extractError(err: { error?: ApiError }): string {
    const detail = err?.error?.detail;
    if (typeof detail === 'string') {
      return detail;
    }
    return 'Something went wrong. Please try again.';
  }
}
