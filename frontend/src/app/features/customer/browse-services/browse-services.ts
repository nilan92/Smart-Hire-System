import { CurrencyPipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MarketplaceServiceStore } from '../../../core/services/marketplace.service';

@Component({
  selector: 'app-customer-browse-services',
  imports: [CurrencyPipe, FormsModule],
  templateUrl: './browse-services.html',
  styleUrl: './browse-services.scss',
})
export class CustomerBrowseServices implements OnInit {
  readonly store = inject(MarketplaceServiceStore);
  readonly search = signal('');
  readonly categoryId = signal(0);
  readonly city = signal('');
  readonly sort = signal('recommended');

  readonly cities = computed(() => [...new Set(this.store.services().filter((s) => s.status === 'active').map((s) => s.city))].sort());
  readonly filteredServices = computed(() => {
    const term = this.search().trim().toLowerCase();
    const result = this.store.services().filter((service) =>
      service.status === 'active' &&
      (!term || `${service.title} ${service.description} ${service.providerName}`.toLowerCase().includes(term)) &&
      (!this.categoryId() || service.categoryId === this.categoryId()) &&
      (!this.city() || service.city === this.city())
    );
    return [...result].sort((a, b) => this.sort() === 'price-low' ? a.price - b.price : this.sort() === 'rating' ? b.rating - a.rating : Number(b.featured) - Number(a.featured) || b.rating - a.rating);
  });

  ngOnInit(): void { this.store.loadCustomerData(); }

  clearFilters(): void {
    this.search.set(''); this.categoryId.set(0); this.city.set(''); this.sort.set('recommended');
  }
}
