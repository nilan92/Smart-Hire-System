import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-unauthorized',
  imports: [RouterLink],
  templateUrl: './unauthorized.html',
  styleUrl: './unauthorized.scss',
})
export class Unauthorized {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  goBack(): void {
    const role = this.authService.currentUser()?.role;
    this.router.navigateByUrl(role === 'provider' ? '/provider/profile' : '/customer/profile');
  }
}
