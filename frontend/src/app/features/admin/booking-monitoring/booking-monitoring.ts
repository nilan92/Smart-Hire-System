import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface AdminBooking {
  id: number;
  customer_id: number;
  customer_name: string;
  provider_id: number;
  provider_name: string;
  service_id: number;
  service_name: string;
  booking_date: string;
  status: 'pending' | 'accepted' | 'rejected' | 'in_progress' | 'completed' | 'cancelled';
  notes: string | null;
  created_at: string;
  updated_at: string;
}

@Component({
  selector: 'app-booking-monitoring',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './booking-monitoring.html',
  styleUrls: ['./booking-monitoring.scss']
})
export class BookingMonitoringComponent implements OnInit {
  bookings: AdminBooking[] = [];
  loading = true;
  error = '';
  viewing: AdminBooking | null = null;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.fetchBookings();
  }

  fetchBookings(): void {
    this.loading = true;
    this.error = '';
    this.http.get<AdminBooking[]>(`${environment.apiUrl}/admin/bookings`).subscribe({
      next: (data) => {
        this.bookings = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load bookings:', err);
        this.error = 'Failed to load bookings. Please try again.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  viewDetails(booking: AdminBooking): void {
    this.viewing = booking;
  }

  closeView(): void {
    this.viewing = null;
  }
}
