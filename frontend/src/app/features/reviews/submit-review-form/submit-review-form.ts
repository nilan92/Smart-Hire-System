import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-submit-review-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './submit-review-form.html',
  styleUrls: ['./submit-review-form.scss']
})
export class SubmitReviewFormComponent implements OnInit {
  // Hardcoded for demo, normally from route params or auth context
  bookingId: number = 1;
  customerId: number = 1;
  providerId: number = 2;
  serviceId: number = 1;

  rating: number = 0;
  hoverRating: number = 0;
  comment: string = '';
  
  status: 'idle' | 'submitting' | 'success' | 'error' = 'idle';
  errorMessage: string = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {}

  setRating(val: number): void {
    if (this.status === 'idle' || this.status === 'error') {
      this.rating = val;
    }
  }

  setHover(val: number): void {
    if (this.status === 'idle' || this.status === 'error') {
      this.hoverRating = val;
    }
  }

  submitReview(): void {
    if (this.rating === 0) {
      this.errorMessage = 'Please provide a rating out of 5.';
      this.status = 'error';
      return;
    }

    this.status = 'submitting';
    this.errorMessage = '';

    const payload = {
      booking_id: this.bookingId,
      customer_id: this.customerId,
      provider_id: this.providerId,
      service_id: this.serviceId,
      rating: this.rating,
      comment: this.comment
    };

    this.http.post(`${environment.apiUrl}/reviews/`, payload).subscribe({
      next: () => {
        this.status = 'success';
      },
      error: (err) => {
        console.error(err);
        this.status = 'error';
        this.errorMessage = err.error?.detail || 'Failed to submit review. Please try again.';
      }
    });
  }
}
