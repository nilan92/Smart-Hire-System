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

  // Chart Data — populated from GET /admin/revenue-timeseries once it loads.
  public lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Platform Revenue (LKR)',
        fill: true,
        tension: 0.4,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.2)'
      },
      {
        data: [],
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
    this.fetchStats();
    this.fetchRevenueTimeseries();
  }

  fetchStats(): void {
    this.http.get(`${environment.apiUrl}/admin/dashboard-stats`).subscribe({
      next: (data) => {
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

  fetchRevenueTimeseries(): void {
    this.http
      .get<{ month: string; revenue: number; bookings: number }[]>(`${environment.apiUrl}/admin/revenue-timeseries`)
      .subscribe({
        next: (points) => {
          this.lineChartData = {
            labels: points.map((p) => p.month),
            datasets: [
              { ...this.lineChartData.datasets[0], data: points.map((p) => p.revenue) },
              { ...this.lineChartData.datasets[1], data: points.map((p) => p.bookings) },
            ],
          };
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Revenue timeseries fetch error:', err),
      });
  }
}
