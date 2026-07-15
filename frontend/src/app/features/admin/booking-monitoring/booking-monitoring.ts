import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-booking-monitoring',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './booking-monitoring.html',
  styleUrls: ['./booking-monitoring.scss']
})
export class BookingMonitoringComponent implements OnInit {
  bookings = [
    { id: 1001, customer: 'Alice Smith', provider: 'Bob Jones', date: '2026-07-20T10:00:00Z', status: 'pending' },
    { id: 1002, customer: 'David Lee', provider: 'Alice Smith', date: '2026-07-18T14:30:00Z', status: 'accepted' },
    { id: 1003, customer: 'Jane Doe', provider: 'Charlie Brown', date: '2026-07-15T09:00:00Z', status: 'completed' },
    { id: 1004, customer: 'John Smith', provider: 'Bob Jones', date: '2026-07-10T11:00:00Z', status: 'cancelled' }
  ];

  ngOnInit(): void {}

  viewDetails(booking: any): void {
    alert(`Viewing detailed breakdown for Booking #${booking.id} (Customer: ${booking.customer}, Provider: ${booking.provider}). Detailed view coming in next sprint!`);
  }
}
