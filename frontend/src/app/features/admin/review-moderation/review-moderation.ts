import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface Review {
  id: number;
  booking_id: number;
  customer_id: number;
  provider_id: number;
  rating: number;
  comment: string;
  created_at: string;
  deleting?: boolean;
}

@Component({
  selector: 'app-review-moderation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './review-moderation.html',
  styleUrls: ['./review-moderation.scss']
})
export class ReviewModerationComponent implements OnInit {
  reviews: Review[] = [];
  loading = true;
  error = '';
  selectedRating: number | null = null;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.fetchReviews();
  }

  fetchReviews(): void {
    this.loading = true;
    this.error = '';
    this.http.get<Review[]>(`${environment.apiUrl}/reviews/`).subscribe({
      next: (data) => {
        this.reviews = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load reviews:', err);
        this.error = 'Failed to load reviews. Please try again.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  get filteredReviews(): Review[] {
    if (this.selectedRating === null) return this.reviews;
    return this.reviews.filter(r => r.rating === this.selectedRating);
  }

  get totalCount(): number { return this.reviews.length; }

  get averageRating(): string {
    if (!this.reviews.length) return '0.0';
    const sum = this.reviews.reduce((acc, r) => acc + r.rating, 0);
    return (sum / this.reviews.length).toFixed(1);
  }

  setRatingFilter(rating: number | null): void {
    this.selectedRating = rating;
  }

  getStarArray(rating: number): boolean[] {
    return Array.from({ length: 5 }, (_, i) => i < rating);
  }

  truncateComment(comment: string, maxLen = 80): string {
    if (!comment) return '—';
    return comment.length > maxLen ? comment.slice(0, maxLen) + '…' : comment;
  }

  deleteReview(review: Review): void {
    if (!window.confirm(`Delete review #${review.id}? This cannot be undone.`)) return;
    review.deleting = true;
    this.http.delete(`${environment.apiUrl}/admin/reviews/${review.id}`).subscribe({
      next: () => {
        this.reviews = this.reviews.filter(r => r.id !== review.id);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to delete review:', err);
        review.deleting = false;
        this.cdr.detectChanges();
      }
    });
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  }
}
