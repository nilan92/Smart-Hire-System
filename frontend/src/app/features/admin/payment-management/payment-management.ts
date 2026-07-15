import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-payment-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payment-management.html',
  styleUrls: ['./payment-management.scss']
})
export class PaymentManagementComponent implements OnInit {
  payments = [
    { id: 'TXN-1001', bookingId: 301, customer: 'Alice', amount: 150.00, method: 'Credit Card', status: 'Completed', date: '2026-07-15T10:06:00Z' },
    { id: 'TXN-1002', bookingId: 302, customer: 'Alice', amount: 89.99, method: 'PayPal', status: 'Pending', date: '2026-07-15T10:10:00Z' },
    { id: 'TXN-1003', bookingId: 303, customer: 'Charlie', amount: 250.00, method: 'Stripe', status: 'Completed', date: '2026-07-15T09:45:00Z' },
    { id: 'TXN-1004', bookingId: 304, customer: 'Charlie', amount: 12.50, method: 'Credit Card', status: 'Failed', date: '2026-07-14T16:20:00Z' }
  ];

  searchTerm: string = '';

  get filteredPayments() {
    if (!this.searchTerm) return this.payments;
    const lower = this.searchTerm.toLowerCase();
    return this.payments.filter(p => 
      p.customer.toLowerCase().includes(lower) || 
      p.id.toLowerCase().includes(lower) ||
      p.status.toLowerCase().includes(lower) ||
      p.method.toLowerCase().includes(lower)
    );
  }

  constructor() {}

  ngOnInit(): void {}
}
