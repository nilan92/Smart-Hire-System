import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

interface Category {
  name: string;
  icon: string;
  description: string;
}

interface FeaturedService {
  id: number;
  title: string;
  provider: string;
  location: string;
  price: number;
  rating: number;
  icon: string;
}

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  categories: Category[] = [
    {
      name: 'Plumbing',
      icon: '🔧',
      description: 'Leaks, installations and repairs',
    },
    {
      name: 'Electrical',
      icon: '⚡',
      description: 'Electrical installation and maintenance',
    },
    {
      name: 'Cleaning',
      icon: '🧹',
      description: 'Home and office cleaning services',
    },
    {
      name: 'Tutoring',
      icon: '📚',
      description: 'Qualified tutors for every subject',
    },
    {
      name: 'Home Repairs',
      icon: '🏠',
      description: 'Professional home maintenance',
    },
    {
      name: 'Tech Support',
      icon: '💻',
      description: 'Computer and device assistance',
    },
  ];

  featuredServices: FeaturedService[] = [
    {
      id: 1,
      title: 'Professional Plumbing Service',
      provider: 'Kasun Perera',
      location: 'Colombo',
      price: 2500,
      rating: 4.9,
      icon: '🔧',
    },
    {
      id: 2,
      title: 'Home Electrical Repairs',
      provider: 'Nimal Electricals',
      location: 'Gampaha',
      price: 3000,
      rating: 4.8,
      icon: '⚡',
    },
    {
      id: 3,
      title: 'Complete Home Cleaning',
      provider: 'CleanPro Lanka',
      location: 'Kandy',
      price: 4500,
      rating: 4.7,
      icon: '🧹',
    },
  ];

  constructor(private router: Router) {}

  searchServices(keyword: string, location: string): void {
    this.router.navigate(['/services'], {
      queryParams: {
        keyword: keyword.trim() || null,
        location: location.trim() || null,
      },
    });
  }

  browseCategory(category: string): void {
    this.router.navigate(['/services'], {
      queryParams: { category },
    });
  }

  trackByCategoryName(_index: number, category: Category): string {
    return category.name;
  }

  trackByServiceId(_index: number, service: FeaturedService): number {
    return service.id;
  }
}