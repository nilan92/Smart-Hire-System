import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RatingDisplayComponent } from '../rating-display/rating-display';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-provider-review-list',
  standalone: true,
  imports: [CommonModule, RatingDisplayComponent],
  templateUrl: './provider-review-list.html',
  styleUrls: ['./provider-review-list.scss']
})
export class ProviderReviewListComponent implements OnInit {
  @Input() providerId: number = 2; // Default for demo
  reviews: any[] = [];
  loading = true;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchReviews();
  }

  fetchReviews(): void {
    this.http.get<any[]>(`${environment.apiUrl}/reviews/provider/${this.providerId}`).subscribe({
      next: (data) => {
        this.reviews = data;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }
}
