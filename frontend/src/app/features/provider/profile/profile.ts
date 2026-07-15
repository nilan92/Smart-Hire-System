import { Component, OnInit, inject } from '@angular/core';
import { forkJoin } from 'rxjs';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { ProviderProfile as ProviderProfileModel, User } from '../../../core/models/auth.models';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-provider-profile',
  imports: [ReactiveFormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class ProviderProfile implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);

  user: User | null = null;
  providerProfile: ProviderProfileModel | null = null;
  loading = true;
  saving = false;
  message = '';

  readonly form = this.fb.nonNullable.group({
    full_name: ['', [Validators.required, Validators.minLength(2)]],
    phone: [''],
    bio: [''],
    years_experience: [0, [Validators.min(0)]],
  });

  ngOnInit(): void {
    forkJoin({
      user: this.authService.loadCurrentUser(),
      providerProfile: this.authService.loadProviderProfile(),
    }).subscribe({
      next: ({ user, providerProfile }) => {
        this.user = user;
        this.providerProfile = providerProfile;
        this.form.patchValue({
          full_name: user.full_name,
          phone: user.phone ?? '',
          bio: providerProfile.bio ?? '',
          years_experience: providerProfile.years_experience,
        });
        this.loading = false;
      },
      error: () => {
        this.message = 'Unable to load provider profile.';
        this.loading = false;
      },
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    this.saving = true;
    forkJoin({
      user: this.authService.updateUserProfile({
        full_name: raw.full_name,
        phone: raw.phone,
      }),
      providerProfile: this.authService.updateProviderProfile({
        bio: raw.bio,
        years_experience: raw.years_experience,
      }),
    }).subscribe({
      next: ({ user, providerProfile }) => {
        this.user = user;
        this.providerProfile = providerProfile;
        this.message = 'Provider profile updated.';
        this.saving = false;
      },
      error: () => {
        this.message = 'Unable to update provider profile.';
        this.saving = false;
      },
    });
  }

  logout(): void {
    this.authService.logout();
    location.assign('/login');
  }
}
