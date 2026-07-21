import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';
import { APP_ROUTES } from '../../../core/utils/app-routes';
import { Navbar } from '../../../shared/components/navbar/navbar';
import { Sidebar, SidebarLink } from '../../../shared/components/sidebar/sidebar';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [Navbar, RouterOutlet, Sidebar],
  templateUrl: './admin-layout.html',
  styleUrls: ['./admin-layout.scss'],
})
export class AdminLayoutComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly user = this.authService.currentUser;
  readonly menuOpen = signal(false);
  readonly links: SidebarLink[] = [
    { label: 'Dashboard', route: APP_ROUTES.admin.dashboard },
    { label: 'Users', route: APP_ROUTES.admin.users },
    { label: 'Categories', route: APP_ROUTES.admin.categories },
    { label: 'Services', route: APP_ROUTES.admin.services },
    { label: 'Bookings', route: APP_ROUTES.admin.bookings },
    { label: 'Reviews', route: APP_ROUTES.admin.reviews },
    { label: 'Payments', route: APP_ROUTES.admin.payments },
  ];
  readonly subtitle = computed(() => this.user()?.full_name || this.user()?.email || 'Admin');

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
