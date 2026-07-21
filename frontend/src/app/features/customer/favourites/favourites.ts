import { CurrencyPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MarketplaceServiceStore } from '../../../core/services/marketplace.service';
import { MarketplaceService } from '../../../core/models/service.models';

@Component({
  selector: 'app-customer-favourites',
  imports: [CurrencyPipe, RouterLink],
  templateUrl: './favourites.html',
  styleUrl: './favourites.scss',
})
export class CustomerFavourites implements OnInit {
  readonly store = inject(MarketplaceServiceStore);
  readonly viewingService = signal<MarketplaceService | null>(null);

  ngOnInit(): void { this.store.loadCustomerData(); }

  view(service: MarketplaceService): void {
    this.viewingService.set(service);
  }

  closeView(): void {
    this.viewingService.set(null);
  }
}
