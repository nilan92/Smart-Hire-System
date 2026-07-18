import { CurrencyPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MarketplaceServiceStore } from '../../../core/services/marketplace.service';

@Component({
  selector: 'app-customer-favourites',
  imports: [CurrencyPipe, RouterLink],
  templateUrl: './favourites.html',
  styleUrl: './favourites.scss',
})
export class CustomerFavourites {
  readonly store = inject(MarketplaceServiceStore);
}
