import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-review-moderation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './review-moderation.html',
  styleUrls: ['./review-moderation.scss']
})
export class ReviewModerationComponent implements OnInit {
  reviews = [
    { id: 1, customer: 'Alice', rating: 5, comment: 'Exceptional work, highly recommended!', sentiment: 'Positive', date: '2026-07-15T09:30:00Z', bookingId: 301 },
    { id: 2, customer: 'Charlie', rating: 4, comment: 'Great service but arrived slightly late.', sentiment: 'Positive', date: '2026-07-14T14:15:00Z', bookingId: 302 },
    { id: 3, customer: 'David', rating: 2, comment: 'Very unprofessional, left a mess.', sentiment: 'Negative', date: '2026-07-12T11:00:00Z', bookingId: 304 },
    { id: 4, customer: 'Eve', rating: 3, comment: 'It was okay. Nothing special.', sentiment: 'Neutral', date: '2026-07-10T16:45:00Z', bookingId: null },
  ];

  searchTerm: string = '';

  get filteredReviews() {
    if (!this.searchTerm) return this.reviews;
    const lower = this.searchTerm.toLowerCase();
    return this.reviews.filter(r => 
      r.customer.toLowerCase().includes(lower) || 
      r.comment.toLowerCase().includes(lower) ||
      r.sentiment.toLowerCase().includes(lower) ||
      (r.bookingId && r.bookingId.toString().includes(lower))
    );
  }

  constructor() {}

  ngOnInit(): void {}
}
