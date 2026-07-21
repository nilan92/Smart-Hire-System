import { CommonModule } from '@angular/common';
import { AfterViewChecked, Component, DestroyRef, ElementRef, OnInit, ViewChild, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AuthService } from '../../../core/services/auth.service';
import { MessageStore } from '../../../core/services/message.service';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';
import { ErrorMessage } from '../../../shared/components/error-message/error-message';
import { LoadingSpinner } from '../../../shared/components/loading-spinner/loading-spinner';

@Component({
  selector: 'app-provider-messages',
  imports: [CommonModule, FormsModule, LoadingSpinner, ErrorMessage, EmptyState],
  templateUrl: './messages.html',
  styleUrl: './messages.scss',
})
export class ProviderMessages implements OnInit, AfterViewChecked {
  private readonly auth = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);
  readonly store = inject(MessageStore);

  @ViewChild('scrollAnchor') private scrollAnchor?: ElementRef<HTMLDivElement>;
  readonly draft = signal('');
  private shouldScroll = false;

  readonly myId = computed(() => this.auth.currentUser()?.id);
  readonly activeThread = computed(() =>
    this.store.threads().find((t) => t.booking_id === this.store.activeBookingId()),
  );

  ngOnInit(): void {
    this.store.loadThreads();
    const interval = setInterval(() => {
      this.store.refreshThreadsSilently();
      this.store.refreshActiveMessages();
    }, 5000);
    this.destroyRef.onDestroy(() => {
      clearInterval(interval);
      this.store.closeThread();
    });
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll && this.scrollAnchor) {
      this.scrollAnchor.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
      this.shouldScroll = false;
    }
  }

  open(bookingId: number): void {
    this.store.openThread(bookingId);
    this.shouldScroll = true;
  }

  send(): void {
    const text = this.draft().trim();
    if (!text) return;
    this.store.send(text);
    this.draft.set('');
    this.shouldScroll = true;
  }
}
