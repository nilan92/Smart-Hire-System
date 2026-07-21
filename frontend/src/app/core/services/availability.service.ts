import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';

import { environment } from '../../../environments/environment';
import { ApiError } from '../models/api.models';
import { AvailabilitySlot, AvailabilitySlotCreateRequest } from '../models/booking.models';
import { API_ENDPOINTS } from '../utils/api-endpoints';
import { ToastService } from './toast.service';

@Injectable({ providedIn: 'root' })
export class AvailabilityStore {
  private readonly http = inject(HttpClient);
  private readonly toast = inject(ToastService);
  private readonly apiUrl = environment.apiUrl;

  readonly slots = signal<AvailabilitySlot[]>([]);
  readonly loading = signal(false);
  readonly error = signal('');

  loadMine(): void {
    this.loading.set(true);
    this.error.set('');
    this.http.get<AvailabilitySlot[]>(`${this.apiUrl}${API_ENDPOINTS.availability.mine}`).subscribe({
      next: (items) => {
        this.slots.set(this.sortSlots(items));
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Could not load your availability.');
        this.loading.set(false);
      },
    });
  }

  addSlot(payload: AvailabilitySlotCreateRequest): void {
    this.http.post<AvailabilitySlot>(`${this.apiUrl}${API_ENDPOINTS.availability.add}`, payload).subscribe({
      next: (slot) => {
        this.slots.update((items) => this.sortSlots([...items, slot]));
        this.toast.show('Availability slot added.', 'success');
      },
      error: (err) => this.toast.show(this.extractError(err), 'error'),
    });
  }

  removeSlot(id: number): void {
    const previous = this.slots();
    this.slots.set(previous.filter((slot) => slot.id !== id));
    this.http.delete(`${this.apiUrl}${API_ENDPOINTS.availability.remove(id)}`).subscribe({
      next: () => this.toast.show('Availability slot removed.', 'success'),
      error: () => {
        this.slots.set(previous);
        this.toast.show('Could not remove that slot.', 'error');
      },
    });
  }

  private sortSlots(items: AvailabilitySlot[]): AvailabilitySlot[] {
    return [...items].sort(
      (a, b) => a.day_of_week - b.day_of_week || a.start_time.localeCompare(b.start_time),
    );
  }

  private extractError(err: { error?: ApiError }): string {
    const detail = err?.error?.detail;
    if (typeof detail === 'string') {
      return detail;
    }
    return 'Something went wrong. Please try again.';
  }
}
