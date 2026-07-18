export type ServiceStatus = 'active' | 'paused' | 'draft';

export interface ServiceCategory {
  id: number;
  name: string;
  icon: string;
}

export interface MarketplaceService {
  id: number;
  providerId: number;
  providerName: string;
  categoryId: number;
  title: string;
  description: string;
  city: string;
  price: number;
  rating: number;
  reviewCount: number;
  duration: string;
  status: ServiceStatus;
  featured?: boolean;
}

export interface ServiceArea {
  id: number;
  district: string;
  city: string;
  radiusKm: number;
}
