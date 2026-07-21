import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';

import { AuthService } from '../../../core/services/auth.service';
import { RatingDisplayComponent } from '../../reviews/rating-display/rating-display';
import { ProviderReviewListComponent } from '../../reviews/provider-review-list/provider-review-list';

@Component({
  selector: 'app-provider-reviews',
  imports: [CommonModule, RatingDisplayComponent, ProviderReviewListComponent],
  templateUrl: './reviews.html',
  styleUrl: './reviews.scss',
})
export class ProviderReviews implements OnInit {
  private readonly auth = inject(AuthService);

  readonly providerId = signal<number | null>(null);
  readonly avgRating = signal(0);
  readonly totalReviews = signal(0);

  ngOnInit(): void {
    const user = this.auth.currentUser();
    if (user) {
      this.providerId.set(user.id);
    }
    this.auth.loadProviderProfile().subscribe({
      next: (profile) => {
        this.avgRating.set(Number(profile.avg_rating) || 0);
        this.totalReviews.set(profile.total_reviews);
      },
      error: () => {},
    });
  }
}
