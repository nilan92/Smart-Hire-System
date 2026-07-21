import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../../../environments/environment';
import { API_ENDPOINTS } from '../../../core/utils/api-endpoints';
import { BookingStore } from '../../../core/services/booking.service';
import { Booking, Review } from '../../../core/models/booking.models';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';
import { LoadingSpinner } from '../../../shared/components/loading-spinner/loading-spinner';
import { RatingDisplayComponent } from '../../reviews/rating-display/rating-display';
import { SubmitReviewFormComponent } from '../../reviews/submit-review-form/submit-review-form';

@Component({
  selector: 'app-customer-reviews',
  imports: [CommonModule, LoadingSpinner, EmptyState, RatingDisplayComponent, SubmitReviewFormComponent],
  templateUrl: './reviews.html',
  styleUrl: './reviews.scss',
})
export class CustomerReviews implements OnInit {
  private readonly http = inject(HttpClient);
  readonly store = inject(BookingStore);

  readonly myReviews = signal<Review[]>([]);
  readonly loadingReviews = signal(true);
  readonly activeBookingId = signal<number | null>(null);

  readonly reviewedBookingIds = computed(() => new Set(this.myReviews().map((r) => r.booking_id)));

  readonly pendingBookings = computed(() =>
    this.store
      .bookings()
      .filter((b) => b.status === 'completed' && !this.reviewedBookingIds().has(b.id)),
  );

  readonly activeBooking = computed<Booking | undefined>(() =>
    this.store.bookings().find((b) => b.id === this.activeBookingId()),
  );

  ngOnInit(): void {
    this.store.loadCustomerBookings();
    this.fetchMyReviews();
  }

  fetchMyReviews(): void {
    this.loadingReviews.set(true);
    this.http.get<Review[]>(`${environment.apiUrl}${API_ENDPOINTS.reviews.mine}`).subscribe({
      next: (reviews) => {
        this.myReviews.set(reviews);
        this.loadingReviews.set(false);
      },
      error: () => this.loadingReviews.set(false),
    });
  }

  bookingFor(review: Review): Booking | undefined {
    return this.store.bookings().find((b) => b.id === review.booking_id);
  }

  startReview(bookingId: number): void {
    this.activeBookingId.set(bookingId);
  }

  cancelReview(): void {
    this.activeBookingId.set(null);
  }

  onReviewSubmitted(): void {
    this.activeBookingId.set(null);
    this.fetchMyReviews();
  }
}
