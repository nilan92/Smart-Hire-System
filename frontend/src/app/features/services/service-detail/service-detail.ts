import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

interface ServiceDetailModel {
  id: number;
  title: string;
  provider: string;
  category: string;
  location: string;
  description: string;
  price: number;
  rating: number;
  reviewCount: number;
  completedJobs: number;
  responseTime: string;
  icon: string;
  verified: boolean;
  availableAreas: string[];
  features: string[];
}

@Component({
  selector: 'app-service-detail',
  imports: [RouterLink],
  templateUrl: './service-detail.html',
  styleUrl: './service-detail.scss',
})
export class ServiceDetail implements OnInit {
  service?: ServiceDetailModel;
  isFavourite = false;

  private readonly services: ServiceDetailModel[] = [
    {
      id: 1,
      title: 'Professional Plumbing Service',
      provider: 'Kasun Perera',
      category: 'Plumbing',
      location: 'Colombo',
      description:
        'Reliable plumbing services for homes, offices and commercial properties. I provide leak repairs, pipe installations, bathroom fittings, drainage maintenance and emergency plumbing assistance.',
      price: 2500,
      rating: 4.9,
      reviewCount: 86,
      completedJobs: 214,
      responseTime: 'Usually within 1 hour',
      icon: '🔧',
      verified: true,
      availableAreas: [
        'Colombo 01–15',
        'Dehiwala',
        'Mount Lavinia',
        'Nugegoda',
        'Rajagiriya',
      ],
      features: [
        'Emergency plumbing repairs',
        'Pipe installation and replacement',
        'Bathroom and kitchen fittings',
        'Leak detection and repair',
        'Drain cleaning and maintenance',
        'Residential and commercial service',
      ],
    },
    {
      id: 2,
      title: 'Home Electrical Repairs',
      provider: 'Nimal Electricals',
      category: 'Electrical',
      location: 'Gampaha',
      description:
        'Safe and professional electrical installation and repair services for residential and commercial properties.',
      price: 3000,
      rating: 4.8,
      reviewCount: 64,
      completedJobs: 176,
      responseTime: 'Usually within 2 hours',
      icon: '⚡',
      verified: true,
      availableAreas: [
        'Gampaha',
        'Kiribathgoda',
        'Kadawatha',
        'Kelaniya',
        'Ja-Ela',
      ],
      features: [
        'Electrical fault diagnosis',
        'New wiring installations',
        'Light and fan installation',
        'Switch and socket repairs',
        'Safety inspections',
        'Emergency electrical repairs',
      ],
    },
    {
      id: 3,
      title: 'Complete Home Cleaning',
      provider: 'CleanPro Lanka',
      category: 'Cleaning',
      location: 'Kandy',
      description:
        'Detailed residential cleaning packages delivered by trained and reliable cleaning professionals.',
      price: 4500,
      rating: 4.7,
      reviewCount: 52,
      completedJobs: 143,
      responseTime: 'Usually within 3 hours',
      icon: '🧹',
      verified: true,
      availableAreas: [
        'Kandy',
        'Peradeniya',
        'Katugastota',
        'Kundasale',
      ],
      features: [
        'Complete home cleaning',
        'Kitchen and bathroom cleaning',
        'Floor and window cleaning',
        'Move-in and move-out cleaning',
        'Office cleaning',
        'Custom cleaning packages',
      ],
    },
  ];

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    const serviceId = Number(this.route.snapshot.paramMap.get('id'));

    this.service = this.services.find(
      (service) => service.id === serviceId,
    );
  }

  toggleFavourite(): void {
    this.isFavourite = !this.isFavourite;
  }
}