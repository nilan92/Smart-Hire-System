import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface Payment {
  id: number;
  booking_id: number;
  customer_id: number;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_method: string;
  transaction_id: string;
  created_at: string;
  updatingStatus?: boolean;
}

@Component({
  selector: 'app-payment-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payment-management.html',
  styleUrls: ['./payment-management.scss']
})
export class PaymentManagementComponent implements OnInit {
  payments: Payment[] = [];
  loading = true;
  error = '';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.fetchPayments();
  }

  fetchPayments(): void {
    this.loading = true;
    this.error = '';
    this.http.get<Payment[]>(`${environment.apiUrl}/admin/payments`).subscribe({
      next: (data) => {
        this.payments = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load payments:', err);
        this.error = 'Failed to load payment data. Please try again.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  get totalCount(): number {
    return this.payments.length;
  }

  get totalRevenue(): number {
    return this.payments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0);
  }

  onStatusChange(payment: Payment, newStatus: string): void {
    payment.updatingStatus = true;
    this.http
      .put(`${environment.apiUrl}/admin/payments/${payment.id}/status`, { status: newStatus })
      .subscribe({
        next: () => {
          payment.status = newStatus as Payment['status'];
          payment.updatingStatus = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Failed to update payment status:', err);
          payment.updatingStatus = false;
          this.cdr.detectChanges();
        }
      });
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      completed: 'badge-success',
      pending: 'badge-warning',
      failed: 'badge-danger',
      refunded: 'badge-grey'
    };
    return map[status] ?? 'badge-grey';
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  }
}
