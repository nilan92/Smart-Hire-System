import { Component, EventEmitter, Input, OnInit, Output, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ToastService } from '../../../core/services/toast.service';
import confetti from 'canvas-confetti';
import { environment } from '../../../../environments/environment';
import { API_ENDPOINTS } from '../../../core/utils/api-endpoints';
import { Payment } from '../../../core/models/booking.models';

@Component({
  selector: 'app-payment-status',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './payment-status.html',
  styleUrls: ['./payment-status.scss']
})
export class PaymentStatusComponent implements OnInit {
  // Demo defaults so the standalone /payments/status route still works on its own.
  @Input() bookingId: number = 301;
  @Input() customerId: number = 101;
  @Input() amount: number = 150.00;
  @Input() serviceName: string | null = null;
  @Input() embedded = false;

  @Output() paid = new EventEmitter<Payment>();
  @Output() closed = new EventEmitter<void>();

  selectedMethod: string = 'card';
  paymentStatus: 'pending' | 'processing' | 'completed' | 'failed' = 'pending';
  transactionId: string = '';
  errorMessage: string = '';

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private toast: ToastService
  ) {}

  ngOnInit(): void {}

  processPayment(): void {
    if (this.paymentStatus === 'completed') return;

    this.paymentStatus = 'processing';

    // Simulate network delay for academic demo
    setTimeout(() => {
      const payload = {
        booking_id: this.bookingId,
        customer_id: this.customerId,
        amount: this.amount,
        payment_method: this.selectedMethod
      };

      this.http.post<Payment>(`${environment.apiUrl}${API_ENDPOINTS.payments.create}`, payload).subscribe({
        next: (payment) => {
          this.transactionId = payment.transaction_id ?? `PMT-${payment.id}`;
          this.paymentStatus = 'completed';
          this.cdr.detectChanges();

          this.toast.show('Payment Processed Successfully!', 'success');

          // Fire Confetti!
          confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#16a34a', '#dcfce7', '#60a5fa', '#3b82f6']
          });

          this.paid.emit(payment);
        },
        error: (err) => {
          console.error(err);
          this.paymentStatus = 'failed';
          this.errorMessage = err.error?.detail || 'Payment failed. Please try again.';
          this.cdr.detectChanges();
        }
      });
    }, 1500);
  }
}
