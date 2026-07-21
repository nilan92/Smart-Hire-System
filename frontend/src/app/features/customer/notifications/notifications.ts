import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';

import { NotificationStore } from '../../../core/services/notification.service';
import { Notification } from '../../../core/models/booking.models';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';
import { ErrorMessage } from '../../../shared/components/error-message/error-message';
import { LoadingSpinner } from '../../../shared/components/loading-spinner/loading-spinner';

@Component({
  selector: 'app-customer-notifications',
  imports: [CommonModule, LoadingSpinner, ErrorMessage, EmptyState],
  templateUrl: './notifications.html',
  styleUrl: './notifications.scss',
})
export class CustomerNotifications implements OnInit {
  readonly store = inject(NotificationStore);
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.store.load();
  }

  open(item: Notification): void {
    this.store.markRead(item.id);
    const path = item.title === 'Booking completed' ? '/customer/reviews' : '/customer/bookings';
    this.router.navigateByUrl(path);
  }

  markAllRead(): void {
    this.store.markAllRead();
  }
}
