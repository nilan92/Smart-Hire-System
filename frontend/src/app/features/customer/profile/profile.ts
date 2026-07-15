import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/auth.models';

@Component({
  selector: 'app-customer-profile',
  imports: [ReactiveFormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class CustomerProfile implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  user: User | null = this.authService.currentUser();
  loading = !this.user;
  saving = false;
  message = '';

  readonly form = this.fb.nonNullable.group({
    full_name: ['', [Validators.required, Validators.minLength(2)]],
    phone: [''],
  });

  ngOnInit(): void {
    if (!this.authService.getToken()) {
      this.router.navigateByUrl('/login', { replaceUrl: true });
      return;
    }

    if (this.user) {
      this.patchForm(this.user);
    }

    this.authService.loadCurrentUser().subscribe({
      next: (user) => {
        this.user = user;
        this.patchForm(user);
        this.loading = false;
      },
      error: () => {
        this.message = this.user ? 'Showing your saved profile.' : 'Unable to load profile.';
        this.loading = false;
      },
    });
  }

  private patchForm(user: User): void {
    this.form.patchValue({
      full_name: user.full_name,
      phone: user.phone ?? '',
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving = true;
    this.authService.updateUserProfile(this.form.getRawValue()).subscribe({
      next: (user) => {
        this.user = user;
        this.message = 'Profile updated.';
        this.saving = false;
      },
      error: () => {
        this.message = 'Unable to update profile.';
        this.saving = false;
      },
    });
  }

  logout(): void {
    this.authService.logout();
    location.replace('/login');
  }
}
