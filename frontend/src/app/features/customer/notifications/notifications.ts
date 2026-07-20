import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';

import { NotificationStore } from '../../../core/services/notification.service';
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

  ngOnInit(): void {
    this.store.load();
  }

  markRead(id: number): void {
    this.store.markRead(id);
  }

  markAllRead(): void {
    this.store.markAllRead();
  }
}
