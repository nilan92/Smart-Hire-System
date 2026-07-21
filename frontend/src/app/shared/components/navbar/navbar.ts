import { Component, EventEmitter, HostListener, Input, OnInit, Output, ElementRef, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { catchError, of, take } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { API_ENDPOINTS } from '../../../core/utils/api-endpoints';
import { User } from '../../../core/models/auth.models';
import { Notification } from '../../../core/models/booking.models';

const INITIAL_NOTIFICATIONS: Notification[] = [
  { id: 1, user_id: 1, title: 'Booking Request Confirmed', message: 'Your plumbing service booking with Nimal Perera has been confirmed.', is_read: false, booking_id: 101, created_at: '10 mins ago' },
  { id: 2, user_id: 1, title: 'Service Completed', message: 'Bright Spark Solutions marked your electrical inspection as completed.', is_read: false, booking_id: 102, created_at: '2 hours ago' },
  { id: 3, user_id: 1, title: 'Welcome to Smart Hire', message: 'Explore local verified service providers and get instant quotes.', is_read: true, booking_id: null, created_at: '1 day ago' },
];

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly elementRef = inject(ElementRef);
  private readonly router = inject(Router);
  private readonly apiUrl = environment.apiUrl;

  @Input() user: User | null = null;
  @Output() menuToggle = new EventEmitter<void>();
  @Output() logout = new EventEmitter<void>();

  readonly notificationsOpen = signal(false);
  readonly profileOpen = signal(false);
  readonly notifications = signal<Notification[]>(INITIAL_NOTIFICATIONS);

  readonly unreadCount = computed(() => this.notifications().filter(n => !n.is_read).length);

  ngOnInit(): void {
    this.fetchNotifications();
  }

  fetchNotifications(): void {
    this.http.get<Notification[]>(`${this.apiUrl}${API_ENDPOINTS.notifications.list}`).pipe(
      take(1),
      catchError(() => of(INITIAL_NOTIFICATIONS))
    ).subscribe((items) => {
      if (items && items.length > 0) {
        this.notifications.set(items);
      }
    });
  }

  toggleNotifications(event?: Event): void {
    if (event) event.stopPropagation();
    this.profileOpen.set(false);
    this.notificationsOpen.update(v => !v);
  }

  toggleProfile(event?: Event): void {
    if (event) event.stopPropagation();
    this.notificationsOpen.set(false);
    this.profileOpen.update(v => !v);
  }

  closeDropdowns(): void {
    this.notificationsOpen.set(false);
    this.profileOpen.set(false);
  }

  markAsRead(id: number, event?: Event): void {
    if (event) event.stopPropagation();
    this.notifications.update(items =>
      items.map(n => (n.id === id ? { ...n, is_read: true } : n))
    );
    this.http.put(`${this.apiUrl}${API_ENDPOINTS.notifications.markRead(id)}`, {}).pipe(
      take(1),
      catchError(() => of(null))
    ).subscribe();
  }

  markAllRead(event?: Event): void {
    if (event) event.stopPropagation();
    this.notifications.update(items => items.map(n => ({ ...n, is_read: true })));
  }

  getInitials(name?: string | null): string {
    if (!name) return 'SH';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }

  getNotificationsLink(): string {
    if (this.user?.role === 'provider') return '/provider/notifications';
    return '/customer/notifications';
  }

  getProfileLink(): string {
    if (this.user?.role === 'provider') return '/provider/profile';
    if (this.user?.role === 'admin') return '/admin/user-management';
    return '/customer/profile';
  }

  getWorkspaceLink(): string {
    if (this.user?.role === 'provider') return '/provider/dashboard';
    if (this.user?.role === 'admin') return '/admin/dashboard';
    return '/customer/dashboard';
  }

  onLogout(): void {
    this.closeDropdowns();
    this.logout.emit();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.closeDropdowns();
    }
  }
}
