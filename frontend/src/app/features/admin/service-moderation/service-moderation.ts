import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface AdminService {
  id: number;
  provider_id: number;
  provider_name: string;
  category_id: number;
  title: string;
  description: string;
  price: number;
  city: string;
  duration: string;
  status: 'active' | 'paused' | 'draft';
  created_at: string;
  updatingStatus?: boolean;
}

interface Category {
  id: number;
  name: string;
}

@Component({
  selector: 'app-service-moderation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './service-moderation.html',
  styleUrls: ['./service-moderation.scss']
})
export class ServiceModerationComponent implements OnInit {
  services: AdminService[] = [];
  categories: Category[] = [];
  loading = true;
  error = '';
  viewing: AdminService | null = null;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.fetchServices();
    this.http.get<Category[]>(`${environment.apiUrl}/admin/categories`).subscribe({
      next: (data) => {
        this.categories = data;
        this.cdr.detectChanges();
      },
      error: () => {},
    });
  }

  fetchServices(): void {
    this.loading = true;
    this.error = '';
    this.http.get<AdminService[]>(`${environment.apiUrl}/admin/services`).subscribe({
      next: (data) => {
        this.services = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load services:', err);
        this.error = 'Failed to load services. Please try again.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  updateStatus(service: AdminService, newStatus: AdminService['status']): void {
    service.updatingStatus = true;
    this.http
      .put<AdminService>(`${environment.apiUrl}/admin/services/${service.id}/status`, { status: newStatus })
      .subscribe({
        next: () => {
          service.status = newStatus;
          service.updatingStatus = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Failed to update service status:', err);
          service.updatingStatus = false;
          this.cdr.detectChanges();
        }
      });
  }

  categoryName(categoryId: number): string {
    return this.categories.find(c => c.id === categoryId)?.name ?? `Category #${categoryId}`;
  }

  view(service: AdminService): void {
    this.viewing = service;
  }

  closeView(): void {
    this.viewing = null;
  }
}
