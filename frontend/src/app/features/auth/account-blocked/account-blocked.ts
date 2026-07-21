import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-account-blocked',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './account-blocked.html',
  styleUrl: './account-blocked.scss',
})
export class AccountBlocked implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  reason: 'suspended' | 'deactivated' = 'suspended';

  ngOnInit(): void {
    // If user is somehow logged in, log them out
    this.authService.logout();

    const r = this.route.snapshot.queryParamMap.get('reason');
    if (r === 'deactivated') {
      this.reason = 'deactivated';
    }
  }

  get isSuspended(): boolean {
    return this.reason === 'suspended';
  }

  backToLogin(): void {
    this.router.navigateByUrl('/login');
  }
}
