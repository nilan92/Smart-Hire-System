import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

import { APP_ROUTES } from '../../../core/utils/app-routes';
import { AuthService } from '../../../core/services/auth.service';
import { Navbar } from '../../components/navbar/navbar';
import { Sidebar, SidebarLink } from '../../components/sidebar/sidebar';

@Component({
  selector: 'app-provider-layout',
  imports: [Navbar, RouterOutlet, Sidebar],
  templateUrl: './provider-layout.html',
  styleUrl: './provider-layout.scss',
})
export class ProviderLayout {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly user = this.authService.currentUser;
  readonly menuOpen = signal(false);
  readonly links: SidebarLink[] = [
    { label: 'Dashboard', route: APP_ROUTES.provider.dashboard },
    { label: 'Profile', route: APP_ROUTES.provider.profile },
    { label: 'My Services', route: APP_ROUTES.provider.services },
    { label: 'Service Areas', route: APP_ROUTES.provider.serviceAreas },
    { label: 'Booking Requests', route: APP_ROUTES.provider.bookingRequests },
    { label: 'Availability', route: APP_ROUTES.provider.availability },
    { label: 'Notifications', route: APP_ROUTES.provider.notifications },
    { label: 'Reviews', route: APP_ROUTES.provider.reviews },
    { label: 'Payments', route: APP_ROUTES.provider.payments },
    { label: 'AI Insights', route: APP_ROUTES.provider.aiInsights },
  ];
  readonly subtitle = computed(() => this.user()?.full_name || this.user()?.email || 'Provider');

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
