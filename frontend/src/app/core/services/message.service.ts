import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';

import { environment } from '../../../environments/environment';
import { API_ENDPOINTS } from '../utils/api-endpoints';

export interface MessageThread {
  booking_id: number;
  service_name: string;
  other_party_id: number;
  other_party_name: string;
  booking_status: string;
  last_message: string | null;
  last_message_at: string | null;
  unread_count: number;
}

export interface ChatMessage {
  id: number;
  booking_id: number;
  sender_id: number;
  sender_name: string;
  body: string;
  is_read: boolean;
  created_at: string;
}

@Injectable({ providedIn: 'root' })
export class MessageStore {
  private readonly http = inject(HttpClient);
  private readonly api = environment.apiUrl;

  readonly threads = signal<MessageThread[]>([]);
  readonly loadingThreads = signal(false);
  readonly threadsError = signal('');

  readonly activeBookingId = signal<number | null>(null);
  readonly activeMessages = signal<ChatMessage[]>([]);
  readonly loadingMessages = signal(false);
  readonly sending = signal(false);

  loadThreads(): void {
    this.loadingThreads.set(true);
    this.threadsError.set('');
    this.http.get<MessageThread[]>(`${this.api}${API_ENDPOINTS.messages.threads}`).subscribe({
      next: (items) => {
        this.threads.set(items);
        this.loadingThreads.set(false);
      },
      error: () => {
        this.threadsError.set('Could not load your conversations.');
        this.loadingThreads.set(false);
      },
    });
  }

  // Used for background polling — refreshes silently, no spinner flicker.
  refreshThreadsSilently(): void {
    this.http.get<MessageThread[]>(`${this.api}${API_ENDPOINTS.messages.threads}`).subscribe({
      next: (items) => this.threads.set(items),
      error: () => {},
    });
  }

  openThread(bookingId: number): void {
    this.activeBookingId.set(bookingId);
    this.loadingMessages.set(true);
    this.http.get<ChatMessage[]>(`${this.api}${API_ENDPOINTS.messages.byBooking(bookingId)}`).subscribe({
      next: (items) => {
        this.activeMessages.set(items);
        this.loadingMessages.set(false);
        this.markThreadRead(bookingId);
      },
      error: () => this.loadingMessages.set(false),
    });
  }

  refreshActiveMessages(): void {
    const bookingId = this.activeBookingId();
    if (!bookingId) return;
    this.http.get<ChatMessage[]>(`${this.api}${API_ENDPOINTS.messages.byBooking(bookingId)}`).subscribe({
      next: (items) => this.activeMessages.set(items),
      error: () => {},
    });
  }

  send(body: string): void {
    const bookingId = this.activeBookingId();
    if (!bookingId || !body.trim() || this.sending()) return;
    this.sending.set(true);
    this.http.post<ChatMessage>(`${this.api}${API_ENDPOINTS.messages.byBooking(bookingId)}`, { body }).subscribe({
      next: (message) => {
        this.activeMessages.update((items) => [...items, message]);
        this.sending.set(false);
        this.refreshThreadsSilently();
      },
      error: () => this.sending.set(false),
    });
  }

  closeThread(): void {
    this.activeBookingId.set(null);
    this.activeMessages.set([]);
  }

  private markThreadRead(bookingId: number): void {
    this.threads.update((items) =>
      items.map((thread) => (thread.booking_id === bookingId ? { ...thread, unread_count: 0 } : thread)),
    );
  }
}
