import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/auth.models';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class AdminDashboard implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  user: User | null = this.authService.currentUser();
  loading = !this.user;
  message = '';

  ngOnInit(): void {
    if (!this.authService.getToken()) {
      this.router.navigateByUrl('/login', { replaceUrl: true });
      return;
    }

    this.authService.loadCurrentUser().subscribe({
      next: (user) => {
        this.user = user;
        this.loading = false;
      },
      error: () => {
        this.message = this.user ? 'Showing your saved session.' : 'Unable to load admin dashboard.';
        this.loading = false;
      },
    });
  }

  logout(): void {
    this.authService.logout();
    location.replace('/login');
  }
}
