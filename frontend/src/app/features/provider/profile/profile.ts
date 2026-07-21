import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError, of, take } from 'rxjs';

import { ProviderProfile as ProviderProfileModel, User } from '../../../core/models/auth.models';
import { AuthService } from '../../../core/services/auth.service';
import { APP_ROUTES } from '../../../core/utils/app-routes';
import { ErrorMessage } from '../../../shared/components/error-message/error-message';
import { LoadingSpinner } from '../../../shared/components/loading-spinner/loading-spinner';
import { PageHeader } from '../../../shared/components/page-header/page-header';

@Component({
  selector: 'app-provider-profile',
  standalone: true,
  imports: [CommonModule, ErrorMessage, LoadingSpinner, PageHeader, ReactiveFormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class ProviderProfile implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  user: User | null = this.authService.currentUser();
  providerProfile: ProviderProfileModel | null = null;
  loading = true;
  saving = false;
  message = '';

  passwordSaving = false;
  passwordMessage = '';
  showPassword = false;

  readonly form = this.fb.nonNullable.group({
    full_name: ['', [Validators.required, Validators.minLength(2)]],
    phone: [''],
    bio: [''],
    years_experience: [0, [Validators.min(0)]],
  });

  readonly passwordForm = this.fb.nonNullable.group({
    new_password: ['', [Validators.required, Validators.minLength(8)]],
    confirm_password: ['', [Validators.required, Validators.minLength(8)]],
  });

  ngOnInit(): void {
    if (!this.authService.getToken()) {
      this.router.navigateByUrl(APP_ROUTES.login, { replaceUrl: true });
      return;
    }

    if (this.user) {
      this.patchUserForm(this.user);
    }

    this.loadData();
  }

  loadData(): void {
    this.loading = true;

    this.authService.loadCurrentUser().pipe(take(1), catchError(() => of(null))).subscribe({
      next: (user) => {
        if (user) {
          this.user = user;
          this.patchUserForm(user);
        }
        this.cdr.detectChanges();
      }
    });

    this.authService.loadProviderProfile().pipe(take(1), catchError(() => of(null))).subscribe({
      next: (profile) => {
        if (profile) {
          this.providerProfile = profile;
          this.patchProviderForm(profile);
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    this.saving = true;
    this.message = '';

    this.authService.updateUserProfile({
      full_name: raw.full_name,
      phone: raw.phone,
    }).pipe(take(1), catchError(() => of(null))).subscribe({
      next: (user) => {
        if (user) {
          this.user = user;
        }
        this.cdr.detectChanges();
      }
    });

    this.authService.updateProviderProfile({
      bio: raw.bio,
      years_experience: raw.years_experience,
    }).pipe(take(1), catchError(() => of(null))).subscribe({
      next: (profile) => {
        if (profile) {
          this.providerProfile = profile;
          this.patchProviderForm(profile);
          this.message = 'Provider profile updated successfully.';
        } else {
          this.message = 'Unable to update profile. Please try again.';
        }
        this.saving = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.message = 'Unable to update profile. Please try again.';
        this.saving = false;
        this.cdr.detectChanges();
      }
    });
  }

  changePassword(): void {
    this.passwordMessage = '';

    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      this.passwordMessage = 'Password must be at least 8 characters long.';
      return;
    }

    const { new_password, confirm_password } = this.passwordForm.getRawValue();

    if (new_password !== confirm_password) {
      this.passwordMessage = 'Passwords do not match.';
      return;
    }

    this.passwordSaving = true;
    this.authService.updateUserProfile({ password: new_password }).pipe(take(1)).subscribe({
      next: () => {
        this.passwordMessage = 'Password updated successfully!';
        this.passwordSaving = false;
        this.passwordForm.reset();
        this.cdr.detectChanges();
      },
      error: () => {
        this.passwordMessage = 'Unable to update password. Please try again.';
        this.passwordSaving = false;
        this.cdr.detectChanges();
      },
    });
  }

  toggleShowPassword(): void {
    this.showPassword = !this.showPassword;
  }

  getVerificationClass(status?: string): string {
    const s = (status || 'unverified').toLowerCase();
    const map: Record<string, string> = {
      verified: 'badge-verified',
      pending: 'badge-pending',
      unverified: 'badge-unverified',
      rejected: 'badge-rejected',
    };
    return map[s] ?? 'badge-unverified';
  }

  getStatusClass(status?: string): string {
    const s = (status || 'active').toLowerCase();
    const map: Record<string, string> = {
      active: 'badge-active',
      pending: 'badge-pending',
      suspended: 'badge-rejected',
      deactivated: 'badge-unverified',
    };
    return map[s] ?? 'badge-active';
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
