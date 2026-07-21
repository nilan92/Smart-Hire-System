import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { environment } from '../../../environments/environment';

import { MarketplaceService, ServiceArea, ServiceCategory } from '../models/service.models';

const SERVICES_KEY = 'smart-hire-services';
const FAVOURITES_KEY = 'smart-hire-favourites';
const AREAS_KEY = 'smart-hire-service-areas';

const CATEGORIES: ServiceCategory[] = [
  { id: 1, name: 'Plumbing', icon: '💧' },
  { id: 2, name: 'Electrical', icon: '⚡' },
  { id: 3, name: 'Cleaning', icon: '✨' },
  { id: 4, name: 'Tutoring', icon: '📚' },
  { id: 5, name: 'Repairs', icon: '🛠️' },
  { id: 6, name: 'Tech Support', icon: '💻' },
];

const INITIAL_SERVICES: MarketplaceService[] = [
  { id: 101, providerId: 1, providerName: 'Nimal Perera', categoryId: 1, title: 'Emergency plumbing repair', description: 'Fast help for leaks, blocked drains and broken fittings.', city: 'Colombo', price: 3500, rating: 4.9, reviewCount: 48, duration: '1–2 hours', status: 'active', providerVerified: true, featured: true },
  { id: 102, providerId: 2, providerName: 'Bright Spark Solutions', categoryId: 2, title: 'Home electrical inspection', description: 'Complete safety checks, fault detection and practical advice.', city: 'Kandy', price: 4500, rating: 4.8, reviewCount: 31, duration: '2 hours', status: 'active', providerVerified: true },
  { id: 103, providerId: 3, providerName: 'Fresh Space Lanka', categoryId: 3, title: 'Deep home cleaning', description: 'A detailed top-to-bottom clean using safe supplies.', city: 'Gampaha', price: 7500, rating: 4.7, reviewCount: 64, duration: '4–5 hours', status: 'active', providerVerified: true, featured: true },
  { id: 104, providerId: 1, providerName: 'Nimal Perera', categoryId: 5, title: 'Furniture assembly & repair', description: 'Reliable assembly and minor repairs for your home or office.', city: 'Colombo', price: 2800, rating: 4.6, reviewCount: 22, duration: '1–3 hours', status: 'active', providerVerified: true },
  { id: 105, providerId: 4, providerName: 'LearnWell Academy', categoryId: 4, title: 'Mathematics tutoring', description: 'Patient, exam-focused lessons for O/L and A/L students.', city: 'Online', price: 2000, rating: 5, reviewCount: 19, duration: '1 hour', status: 'active', providerVerified: true },
  { id: 106, providerId: 5, providerName: 'FixIT Mobile', categoryId: 6, title: 'Laptop & Wi-Fi support', description: 'On-site troubleshooting for computers and home networks.', city: 'Colombo', price: 3000, rating: 4.8, reviewCount: 37, duration: '1–2 hours', status: 'active', providerVerified: true },
];

const INITIAL_AREAS: ServiceArea[] = [
  { id: 1, district: 'Colombo', city: 'Colombo 03', radiusKm: 10 },
  { id: 2, district: 'Colombo', city: 'Dehiwala', radiusKm: 8 },
];

@Injectable({ providedIn: 'root' })
export class MarketplaceServiceStore {
  private readonly http = inject(HttpClient);
  private readonly api = `${environment.apiUrl}/services`;
  readonly categories = signal(CATEGORIES);
  readonly services = signal(this.read<MarketplaceService[]>(SERVICES_KEY, INITIAL_SERVICES));
  readonly favouriteIds = signal(this.read<number[]>(FAVOURITES_KEY, [101, 105]));
  readonly areas = signal(this.read<ServiceArea[]>(AREAS_KEY, INITIAL_AREAS));
  readonly favourites = computed(() => this.services().filter((service) => this.favouriteIds().includes(service.id)));

  loadMarketplace(): void {
    this.http.get<ApiService[]>(this.api).subscribe({ next: (items) => { const mapped = items.map(this.mapService); this.services.set(mapped); this.write(SERVICES_KEY, mapped); } });
    this.http.get<ServiceCategory[]>(`${this.api}/categories`).subscribe({ next: (items) => this.categories.set(items) });
  }

  loadCustomerData(): void {
    this.loadMarketplace();
    this.http.get<ApiService[]>(`${this.api}/favourites/me`).subscribe({ next: (items) => { const ids = items.map((item) => item.id); this.favouriteIds.set(ids); this.write(FAVOURITES_KEY, ids); } });
  }

  loadProviderData(): void {
    this.http.get<ServiceCategory[]>(`${this.api}/categories`).subscribe({ next: (items) => this.categories.set(items) });
    this.http.get<ApiService[]>(`${this.api}/mine`).subscribe({ next: (items) => { const mine = items.map(this.mapService); this.services.set(mine); this.write(SERVICES_KEY, mine); } });
    this.http.get<ApiArea[]>(`${this.api}/areas/mine`).subscribe({ next: (items) => { const areas = items.map((item) => ({ id:item.id, district:item.district, city:item.city, radiusKm:item.radius_km })); this.areas.set(areas); this.write(AREAS_KEY, areas); } });
  }

  toggleFavourite(serviceId: number): boolean {
    const ids = this.favouriteIds();
    const next = ids.includes(serviceId) ? ids.filter((id) => id !== serviceId) : [...ids, serviceId];
    this.favouriteIds.set(next);
    this.write(FAVOURITES_KEY, next);
    const request = next.includes(serviceId) ? this.http.post(`${this.api}/${serviceId}/favourite`, {}) : this.http.delete(`${this.api}/${serviceId}/favourite`);
    request.subscribe({ error: () => { this.favouriteIds.set(ids); this.write(FAVOURITES_KEY, ids); } });
    return next.includes(serviceId);
  }

  isFavourite(serviceId: number): boolean {
    return this.favouriteIds().includes(serviceId);
  }

  saveService(service: Omit<MarketplaceService, 'id' | 'providerId' | 'providerName' | 'rating' | 'reviewCount' | 'providerVerified'>, id?: number): void {
    const current = this.services();
    const next = id
      ? current.map((item) => item.id === id ? { ...item, ...service } : item)
      : [{ ...service, id: Date.now(), providerId: 1, providerName: 'My business', rating: 0, reviewCount: 0, providerVerified: false }, ...current];
    this.services.set(next);
    this.write(SERVICES_KEY, next);
    const payload = { category_id:service.categoryId, title:service.title, description:service.description, price:service.price, city:service.city, duration:service.duration, status:service.status };
    const request = id ? this.http.put<ApiService>(`${this.api}/${id}`, payload) : this.http.post<ApiService>(this.api, payload);
    request.subscribe({ next: (saved) => { const mapped = this.mapService(saved); this.services.update((items) => id ? items.map((item) => item.id === id ? mapped : item) : [mapped, ...items.filter((item) => item.id < 1000000000000)]); this.write(SERVICES_KEY, this.services()); } });
  }

  removeService(id: number): void {
    const next = this.services().filter((service) => service.id !== id);
    this.services.set(next);
    this.write(SERVICES_KEY, next);
    this.favouriteIds.set(this.favouriteIds().filter((serviceId) => serviceId !== id));
    this.write(FAVOURITES_KEY, this.favouriteIds());
    this.http.delete(`${this.api}/${id}`).subscribe({ error: () => this.loadProviderData() });
  }

  saveArea(area: Omit<ServiceArea, 'id'>): void {
    const next = [...this.areas(), { ...area, id: Date.now() }];
    this.areas.set(next);
    this.write(AREAS_KEY, next);
    const optimisticId = next[next.length - 1].id;
    this.http.post<ApiArea>(`${this.api}/areas`, { district:area.district, city:area.city, radius_km:area.radiusKm }).subscribe({ next: (saved) => { this.areas.update((items) => [...items.filter((item) => item.id !== optimisticId), { id:saved.id, district:saved.district, city:saved.city, radiusKm:saved.radius_km }]); this.write(AREAS_KEY, this.areas()); } });
  }

  removeArea(id: number): void {
    const next = this.areas().filter((area) => area.id !== id);
    this.areas.set(next);
    this.write(AREAS_KEY, next);
    this.http.delete(`${this.api}/areas/${id}`).subscribe({ error: () => this.loadProviderData() });
  }

  categoryName(id: number): string {
    return this.categories().find((category) => category.id === id)?.name ?? 'Other';
  }

  categoryIcon(id: number): string {
    return this.categories().find((category) => category.id === id)?.icon ?? 'SH';
  }

  private read<T>(key: string, fallback: T): T {
    if (typeof localStorage === 'undefined') return fallback;
    try { return JSON.parse(localStorage.getItem(key) ?? '') as T; } catch { return fallback; }
  }

  private write(key: string, value: unknown): void {
    if (typeof localStorage !== 'undefined') localStorage.setItem(key, JSON.stringify(value));
  }

  private readonly mapService = (item: ApiService): MarketplaceService => ({ id:item.id, providerId:item.provider_id, providerName:item.provider_name, categoryId:item.category_id, title:item.title, description:item.description, city:item.city, price:Number(item.price), rating:item.rating, reviewCount:item.review_count, duration:item.duration, status:item.status, providerVerified:item.provider_verified });
}

interface ApiService { id:number; provider_id:number; provider_name:string; category_id:number; title:string; description:string; city:string; price:number|string; rating:number; review_count:number; duration:string; status:'active'|'paused'|'draft'; provider_verified:boolean; }
interface ApiArea { id:number; provider_id:number; district:string; city:string; radius_km:number; service_id?:number; }
