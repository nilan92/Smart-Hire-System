import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, BaseChartDirective],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.scss']
})
export class AdminDashboardComponent implements OnInit {
  stats: any = {
    total_payments: 0,
    total_reviews: 0,
    total_users: 0,
    total_bookings: 0,
    total_services: 0
  };

  loading = true;
  isLoading = true;
  
  // Chart Data Setup
  public lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [
      {
        data: [1200, 1900, 3000, 5000, 4200, 6800, 8500],
        label: 'Platform Revenue ($)',
        fill: true,
        tension: 0.4,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.2)'
      },
      {
        data: [45, 60, 110, 150, 130, 210, 280],
        label: 'Total Bookings',
        fill: false,
        tension: 0.4,
        borderColor: '#10b981',
      }
    ]
  };

  public lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'top' }
    }
  };

  error = '';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {
    console.log('AdminDashboard initialized');
  }

  ngOnInit(): void {
    console.log('ngOnInit fired, fetching stats');
    this.fetchStats();
  }

  fetchStats(): void {
    this.http.get(`${environment.apiUrl}/admin/dashboard-stats`).subscribe({
      next: (data) => {
        console.log('Stats received:', data);
        this.stats = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Stats fetch error:', err);
        this.error = 'Failed to load dashboard statistics.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }
}
