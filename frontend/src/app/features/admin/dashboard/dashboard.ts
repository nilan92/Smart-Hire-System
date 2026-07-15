import { Component, OnInit, inject } from '@angular/core';

import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/auth.models';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class AdminDashboard implements OnInit {
  private readonly authService = inject(AuthService);

  user: User | null = null;
  loading = true;
  message = '';

  ngOnInit(): void {
    this.authService.loadCurrentUser().subscribe({
      next: (user) => {
        this.user = user;
        this.loading = false;
      },
      error: () => {
        this.message = 'Unable to load admin dashboard.';
        this.loading = false;
      },
    });
  }

  logout(): void {
    this.authService.logout();
    location.assign('/login');
  }
}
