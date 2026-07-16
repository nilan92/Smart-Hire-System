import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';

import { ProviderProfile as ProviderProfileModel, User } from '../../../core/models/auth.models';
import { AuthService } from '../../../core/services/auth.service';
import { APP_ROUTES } from '../../../core/utils/app-routes';
import { ErrorMessage } from '../../../shared/components/error-message/error-message';
import { LoadingSpinner } from '../../../shared/components/loading-spinner/loading-spinner';
import { PageHeader } from '../../../shared/components/page-header/page-header';

@Component({
  selector: 'app-provider-profile',
  imports: [ErrorMessage, LoadingSpinner, PageHeader, ReactiveFormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class ProviderProfile implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  user: User | null = this.authService.currentUser();
  providerProfile: ProviderProfileModel | null = null;
  loading = !this.user;
  saving = false;
  message = '';

  readonly form = this.fb.nonNullable.group({
    full_name: ['', [Validators.required, Validators.minLength(2)]],
    phone: [''],
    bio: [''],
    years_experience: [0, [Validators.min(0)]],
  });

  ngOnInit(): void {
    if (!this.authService.getToken()) {
      this.router.navigateByUrl(APP_ROUTES.login, { replaceUrl: true });
      return;
    }

    if (this.user) {
      this.patchUserForm(this.user);
    }

    forkJoin({
      user: this.authService.loadCurrentUser(),
      providerProfile: this.authService.loadProviderProfile(),
    }).subscribe({
      next: ({ user, providerProfile }) => {
        this.user = user;
        this.providerProfile = providerProfile;
        this.patchUserForm(user);
        this.patchProviderForm(providerProfile);
        this.loading = false;
      },
      error: () => {
        this.message = this.user ? 'Showing your saved profile.' : 'Unable to load provider profile.';
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
        this.message = 'Provider profile updated successfully.';
        this.saving = false;
      },
      error: () => {
        this.message = 'Unable to update provider profile. Please try again.';
        this.saving = false;
      },
    });
  }

  private patchUserForm(user: User): void {
    this.form.patchValue({
      full_name: user.full_name,
      phone: user.phone ?? '',
    });
  }

  private patchProviderForm(providerProfile: ProviderProfileModel): void {
    this.form.patchValue({
      bio: providerProfile.bio ?? '',
      years_experience: providerProfile.years_experience,
    });
  }
}
