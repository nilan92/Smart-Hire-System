import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

import { APP_ROUTES } from '../../../core/utils/app-routes';
import { AuthService } from '../../../core/services/auth.service';
import { Navbar } from '../../components/navbar/navbar';
import { Sidebar, SidebarLink } from '../../components/sidebar/sidebar';

@Component({
  selector: 'app-customer-layout',
  imports: [Navbar, RouterOutlet, Sidebar],
  templateUrl: './customer-layout.html',
  styleUrl: './customer-layout.scss',
})
export class CustomerLayout {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly user = this.authService.currentUser;
  readonly menuOpen = signal(false);
  readonly links: SidebarLink[] = [
    { label: 'Dashboard', route: APP_ROUTES.customer.dashboard },
    { label: 'Browse Services', route: APP_ROUTES.customer.browseServices },
    { label: 'Favourites', route: APP_ROUTES.customer.favourites },
    { label: 'My Bookings', route: APP_ROUTES.customer.bookings },
    { label: 'Reviews', route: APP_ROUTES.customer.reviews },
    { label: 'AI Assistant', route: APP_ROUTES.customer.aiAssistant },
  ];
  readonly subtitle = computed(() => this.user()?.full_name || this.user()?.email || 'Customer');

  toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigateByUrl(APP_ROUTES.login, { replaceUrl: true });
  }
}
