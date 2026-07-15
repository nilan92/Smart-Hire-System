import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ToastService } from '../../../core/services/toast.service';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-test-system',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './test-system.html',
  styleUrls: ['./test-system.scss']
})
export class TestSystemComponent {
  statusMessage = '';
  isProcessing = false;
  isPopulated = false;

  constructor(private http: HttpClient, private router: Router, private toast: ToastService) {}

  seedDatabase(): void {
    this.isProcessing = true;
    this.statusMessage = 'Seeding database with presentation data...';
    this.toast.show('Seeding database...', 'info');
    
    this.http.post('http://localhost:8000/api/admin/seed-test-data', {}).subscribe({
      next: () => {
        this.statusMessage = '✅ Success! DB populated with Users, Services, Bookings, Payments, and Reviews.';
        this.isProcessing = false;
        this.isPopulated = true;
        this.toast.show('Test data loaded successfully', 'success');
        
        // Redirect to dashboard after 2 seconds
        setTimeout(() => this.router.navigate(['/admin']), 2500);
      },
      error: (err) => {
        console.error(err);
        this.statusMessage = '❌ Failed to seed database. Check console.';
        this.isProcessing = false;
        this.toast.show('Failed to load test data', 'error');
      }
    });
  }
}
