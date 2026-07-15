import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

interface Service {
  id: number;
  title: string;
  provider: string;
  category: string;
  location: string;
  description: string;
  price: number;
  rating: number;
  reviewCount: number;
  icon: string;
  verified: boolean;
}

@Component({
  selector: 'app-service-search',
  imports: [RouterLink],
  templateUrl: './service-search.html',
  styleUrl: './service-search.scss',
})
export class ServiceSearch implements OnInit {
  keyword = '';
  selectedCategory = '';
  selectedLocation = '';
  selectedPrice = '';
  sortBy = 'recommended';

  readonly categories = [
    'Plumbing',
    'Electrical',
    'Cleaning',
    'Tutoring',
    'Home Repairs',
    'Tech Support',
    'Gardening',
    'Beauty & Wellness',
    'Vehicle Services',
  ];

  readonly locations = [
    'Colombo',
    'Gampaha',
    'Kandy',
    'Galle',
    'Kurunegala',
    'Negombo',
  ];

  readonly services: Service[] = [
    {
      id: 1,
      title: 'Professional Plumbing Service',
      provider: 'Kasun Perera',
      category: 'Plumbing',
      location: 'Colombo',
      description:
        'Plumbing repairs, installations and emergency services for homes and offices.',
      price: 2500,
      rating: 4.9,
      reviewCount: 86,
      icon: '🔧',
      verified: true,
    },
    {
      id: 2,
      title: 'Home Electrical Repairs',
      provider: 'Nimal Electricals',
      category: 'Electrical',
      location: 'Gampaha',
      description:
        'Safe and reliable electrical repairs, wiring and installation services.',
      price: 3000,
      rating: 4.8,
      reviewCount: 64,
      icon: '⚡',
      verified: true,
    },
    {
      id: 3,
      title: 'Complete Home Cleaning',
      provider: 'CleanPro Lanka',
      category: 'Cleaning',
      location: 'Kandy',
      description:
        'Deep cleaning and regular maintenance packages for your complete home.',
      price: 4500,
      rating: 4.7,
      reviewCount: 52,
      icon: '🧹',
      verified: true,
    },
    {
      id: 4,
      title: 'Mathematics and Science Tutoring',
      provider: 'Tharushi Education',
      category: 'Tutoring',
      location: 'Colombo',
      description:
        'Individual and group classes for mathematics and science students.',
      price: 2000,
      rating: 4.9,
      reviewCount: 41,
      icon: '📚',
      verified: true,
    },
    {
      id: 5,
      title: 'Home Painting and Repairs',
      provider: 'Ruwan Home Care',
      category: 'Home Repairs',
      location: 'Galle',
      description:
        'Interior painting, wall repairs and general property maintenance.',
      price: 6500,
      rating: 4.6,
      reviewCount: 35,
      icon: '🏠',
      verified: false,
    },
    {
      id: 6,
      title: 'Computer and Laptop Support',
      provider: 'TechFix Solutions',
      category: 'Tech Support',
      location: 'Negombo',
      description:
        'Laptop repairs, software installation, networking and technical support.',
      price: 3500,
      rating: 4.8,
      reviewCount: 73,
      icon: '💻',
      verified: true,
    },
    {
      id: 7,
      title: 'Garden Maintenance Service',
      provider: 'Green Garden Care',
      category: 'Gardening',
      location: 'Kurunegala',
      description:
        'Garden cleaning, lawn care, pruning and landscaping solutions.',
      price: 5000,
      rating: 4.5,
      reviewCount: 28,
      icon: '🌿',
      verified: true,
    },
    {
      id: 8,
      title: 'Mobile Beauty and Wellness',
      provider: 'Glow Studio',
      category: 'Beauty & Wellness',
      location: 'Colombo',
      description:
        'Professional beauty and wellness treatments delivered to your home.',
      price: 4000,
      rating: 4.7,
      reviewCount: 46,
      icon: '✂️',
      verified: true,
    },
    {
      id: 9,
      title: 'Vehicle Repair and Service',
      provider: 'AutoCare Lanka',
      category: 'Vehicle Services',
      location: 'Gampaha',
      description:
        'Vehicle inspections, repairs, regular servicing and roadside assistance.',
      price: 7500,
      rating: 4.6,
      reviewCount: 59,
      icon: '🚗',
      verified: true,
    },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      this.keyword = params.get('keyword') ?? '';
      this.selectedCategory = params.get('category') ?? '';
      this.selectedLocation = params.get('location') ?? '';
    });
  }

  get filteredServices(): Service[] {
    const keyword = this.keyword.trim().toLowerCase();

    let results = this.services.filter((service) => {
      const matchesKeyword =
        !keyword ||
        service.title.toLowerCase().includes(keyword) ||
        service.provider.toLowerCase().includes(keyword) ||
        service.description.toLowerCase().includes(keyword);

      const matchesCategory =
        !this.selectedCategory ||
        service.category === this.selectedCategory;

      const matchesLocation =
        !this.selectedLocation ||
        service.location === this.selectedLocation;

      const matchesPrice = this.matchesPrice(service.price);

      return (
        matchesKeyword &&
        matchesCategory &&
        matchesLocation &&
        matchesPrice
      );
    });

    results = [...results];

    switch (this.sortBy) {
      case 'price-low':
        results.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        results.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        results.sort((a, b) => b.rating - a.rating);
        break;
      default:
        results.sort(
          (a, b) =>
            b.rating * b.reviewCount - a.rating * a.reviewCount,
        );
    }

    return results;
  }

  private matchesPrice(price: number): boolean {
    switch (this.selectedPrice) {
      case 'under-3000':
        return price < 3000;
      case '3000-5000':
        return price >= 3000 && price <= 5000;
      case 'over-5000':
        return price > 5000;
      default:
        return true;
    }
  }

  updateKeyword(value: string): void {
    this.keyword = value;
  }

  updateCategory(value: string): void {
    this.selectedCategory = value;
  }

  updateLocation(value: string): void {
    this.selectedLocation = value;
  }

  updatePrice(value: string): void {
    this.selectedPrice = value;
  }

  updateSort(value: string): void {
    this.sortBy = value;
  }

  search(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        keyword: this.keyword.trim() || null,
        category: this.selectedCategory || null,
        location: this.selectedLocation || null,
      },
      queryParamsHandling: 'merge',
    });
  }

  clearFilters(): void {
    this.keyword = '';
    this.selectedCategory = '';
    this.selectedLocation = '';
    this.selectedPrice = '';
    this.sortBy = 'recommended';

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {},
    });
  }
}