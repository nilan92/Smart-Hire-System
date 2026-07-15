import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../../core/services/toast.service';
import confetti from 'canvas-confetti';

@Component({
  selector: 'app-payment-status',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payment-status.html',
  styleUrls: ['./payment-status.scss']
})
export class PaymentStatusComponent implements OnInit {
  // Hardcoded for demo, normally pulled from route params
  bookingId: number = 301; // Matches seeded Test Data
  customerId: number = 101; // Matches seeded Test Data
  amount: number = 150.00; 
  
  selectedMethod: string = 'card';
  paymentStatus: 'pending' | 'processing' | 'completed' | 'failed' = 'pending';
  transactionId: string = '';

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
      this.transactionId = 'TXN-' + Math.random().toString(36).substr(2, 9).toUpperCase();
      
      const payload = {
        booking_id: this.bookingId,
        customer_id: this.customerId,
        amount: this.amount,
        payment_method: this.selectedMethod
      };

      this.http.post('http://localhost:8000/api/payments/', payload).subscribe({
        next: (res: any) => {
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
        },
        error: (err) => {
          console.error(err);
          this.paymentStatus = 'failed';
          this.cdr.detectChanges();
        }
      });
    }, 1500);
  }
}
