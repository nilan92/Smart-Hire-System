import { CurrencyPipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MarketplaceServiceStore } from '../../../core/services/marketplace.service';

@Component({
  selector: 'app-customer-favourites',
  imports: [CurrencyPipe, RouterLink],
  templateUrl: './favourites.html',
  styleUrl: './favourites.scss',
})
export class CustomerFavourites implements OnInit {
  readonly store = inject(MarketplaceServiceStore);
  ngOnInit(): void { this.store.loadCustomerData(); }
}
