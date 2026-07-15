import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';

import { AuthService } from './core/services/auth.service';
import { ToastComponent } from './shared/components/toast/toast.component';

@Component({
  selector: 'app-root',
  imports: [RouterLink, RouterOutlet, ToastComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly title = signal('smart-hire-frontend');
  protected readonly currentUser = this.authService.currentUser;
  protected readonly currentUrl = signal(this.router.url);

  protected readonly showNavbar = computed(() => {
    const path = this.currentUrl().split('?')[0].split('#')[0];
    return this.authService.isAuthenticated() && !['/login', '/register'].includes(path);
  });

  protected readonly displayName = computed(() => {
    const user = this.currentUser();
    return user?.full_name || user?.email || 'Signed in user';
  });

  protected readonly roleLabel = computed(() => {
    const role = this.currentUser()?.role;
    return role ? role.charAt(0).toUpperCase() + role.slice(1) : 'Account';
  });

  protected readonly homeLink = computed(() => {
    const role = this.currentUser()?.role;
    if (role === 'admin') {
      return '/admin/dashboard';
    }
    if (role === 'provider') {
      return '/provider/profile';
    }
    return '/customer/profile';
  });

  ngOnInit(): void {
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => this.currentUrl.set(event.urlAfterRedirects));

    if (this.authService.getToken() && !this.currentUser()) {
      this.authService.loadCurrentUser().subscribe({
        error: () => {
          // Keep the saved session usable if the API is temporarily unavailable.
        },
      });
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }
}
