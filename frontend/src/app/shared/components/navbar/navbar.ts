import { Component, EventEmitter, HostListener, Input, OnInit, Output, ElementRef, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';

import { User } from '../../../core/models/auth.models';
import { NotificationStore } from '../../../core/services/notification.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar implements OnInit {
  private readonly elementRef = inject(ElementRef);
  private readonly router = inject(Router);
  readonly store = inject(NotificationStore);

  @Input() user: User | null = null;
  @Output() menuToggle = new EventEmitter<void>();
  @Output() logout = new EventEmitter<void>();

  readonly notificationsOpen = signal(false);
  readonly profileOpen = signal(false);

  readonly notifications = this.store.notifications;
  readonly unreadCount = this.store.unreadCount;

  ngOnInit(): void {
    this.store.load();
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
    this.store.markRead(id);
  }

  markAllRead(event?: Event): void {
    if (event) event.stopPropagation();
    this.store.markAllRead();
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
