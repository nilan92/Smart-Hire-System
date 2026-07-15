import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-rating-display',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rating-display.html',
  styleUrls: ['./rating-display.scss']
})
export class RatingDisplayComponent implements OnInit, OnChanges {
  @Input() rating: number = 0;
  @Input() reviewCount: number = 0;
  @Input() showCount: boolean = true;
  
  stars: boolean[] = [];

  ngOnInit(): void {
    this.updateStars();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['rating']) {
      this.updateStars();
    }
  }

  updateStars(): void {
    this.stars = Array(5).fill(false).map((_, i) => i < Math.round(this.rating));
  }
}
