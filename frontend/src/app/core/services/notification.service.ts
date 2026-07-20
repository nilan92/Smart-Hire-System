import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';

import { environment } from '../../../environments/environment';
import { Notification } from '../models/booking.models';
import { API_ENDPOINTS } from '../utils/api-endpoints';

@Injectable({ providedIn: 'root' })
export class NotificationStore {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  readonly notifications = signal<Notification[]>([]);
  readonly loading = signal(false);
  readonly error = signal('');
  readonly unreadCount = computed(() => this.notifications().filter((item) => !item.is_read).length);

  load(): void {
    this.loading.set(true);
    this.error.set('');
    this.http.get<Notification[]>(`${this.apiUrl}${API_ENDPOINTS.notifications.list}`).subscribe({
      next: (items) => {
        this.notifications.set(this.sortByNewest(items));
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Could not load notifications.');
        this.loading.set(false);
      },
    });
  }

  markRead(id: number): void {
    const notification = this.notifications().find((item) => item.id === id);
    if (!notification || notification.is_read) {
      return;
    }
    const previous = this.notifications();
    this.notifications.set(previous.map((item) => (item.id === id ? { ...item, is_read: true } : item)));

    this.http.put<Notification>(`${this.apiUrl}${API_ENDPOINTS.notifications.markRead(id)}`, {}).subscribe({
      error: () => this.notifications.set(previous),
    });
  }

  markAllRead(): void {
    this.notifications()
      .filter((item) => !item.is_read)
      .forEach((item) => this.markRead(item.id));
  }

  private sortByNewest(items: Notification[]): Notification[] {
    return [...items].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }
}
