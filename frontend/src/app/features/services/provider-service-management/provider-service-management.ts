import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface ProviderService {
  id: number;
  title: string;
  category: string;
  location: string;
  price: number;
  status: 'active' | 'inactive';
  bookings: number;
  views: number;
  rating: number;
  icon: string;
  updatedAt: string;
}

@Component({
  selector: 'app-provider-service-management',
  imports: [RouterLink],
  templateUrl: './provider-service-management.html',
  styleUrl: './provider-service-management.scss',
})
export class ProviderServiceManagement {
  searchTerm = '';
  selectedStatus = 'all';
  serviceToDelete?: ProviderService;

  services: ProviderService[] = [
    {
      id: 1,
      title: 'Professional Plumbing Service',
      category: 'Plumbing',
      location: 'Colombo',
      price: 2500,
      status: 'active',
      bookings: 24,
      views: 186,
      rating: 4.9,
      icon: '🔧',
      updatedAt: '14 July 2026',
    },
    {
      id: 10,
      title: 'Emergency Pipe Repair',
      category: 'Plumbing',
      location: 'Colombo',
      price: 3500,
      status: 'active',
      bookings: 13,
      views: 94,
      rating: 4.8,
      icon: '🛠️',
      updatedAt: '11 July 2026',
    },
    {
      id: 11,
      title: 'Bathroom Fitting Installation',
      category: 'Home Repairs',
      location: 'Dehiwala',
      price: 5500,
      status: 'inactive',
      bookings: 8,
      views: 61,
      rating: 4.6,
      icon: '🚿',
      updatedAt: '8 July 2026',
    },
  ];

  get filteredServices(): ProviderService[] {
    const search = this.searchTerm.trim().toLowerCase();

    return this.services.filter((service) => {
      const matchesSearch =
        !search ||
        service.title.toLowerCase().includes(search) ||
        service.category.toLowerCase().includes(search) ||
        service.location.toLowerCase().includes(search);

      const matchesStatus =
        this.selectedStatus === 'all' ||
        service.status === this.selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }

  get activeServiceCount(): number {
    return this.services.filter(
      (service) => service.status === 'active',
    ).length;
  }

  get totalBookings(): number {
    return this.services.reduce(
      (total, service) => total + service.bookings,
      0,
    );
  }

  get totalViews(): number {
    return this.services.reduce(
      (total, service) => total + service.views,
      0,
    );
  }

  updateSearch(value: string): void {
    this.searchTerm = value;
  }

  updateStatus(value: string): void {
    this.selectedStatus = value;
  }

  toggleStatus(service: ProviderService): void {
    service.status =
      service.status === 'active' ? 'inactive' : 'active';
  }

  openDeleteDialog(service: ProviderService): void {
    this.serviceToDelete = service;
  }

  cancelDelete(): void {
    this.serviceToDelete = undefined;
  }

  confirmDelete(): void {
    if (!this.serviceToDelete) {
      return;
    }

    this.services = this.services.filter(
      (service) => service.id !== this.serviceToDelete?.id,
    );

    this.serviceToDelete = undefined;
  }
}