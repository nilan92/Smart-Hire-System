import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { startWith } from 'rxjs';

import { AuthService } from '../../../core/services/auth.service';
import { RegisterRequest } from '../../../core/models/auth.models';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  loading = false;
  errorMessage = '';

  readonly form = this.fb.nonNullable.group({
    full_name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.maxLength(20)]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirm_password: ['', [Validators.required, Validators.minLength(8)]],
    role: this.fb.nonNullable.control<'customer' | 'provider'>('customer', Validators.required),
    provider_profile: this.fb.nonNullable.group({
      bio: ['', [Validators.maxLength(2000)]],
      years_experience: [0, [Validators.min(0)]],
    }),
  });

  readonly selectedRole = toSignal(this.form.controls.role.valueChanges.pipe(startWith(this.form.controls.role.value)), {
    initialValue: this.form.controls.role.value,
  });
  readonly isProvider = computed(() => this.selectedRole() === 'provider');

  submit(): void {
    this.errorMessage = '';
    if (this.form.invalid || this.form.controls.password.value !== this.form.controls.confirm_password.value) {
      this.form.markAllAsTouched();
      if (this.form.controls.password.value !== this.form.controls.confirm_password.value) {
        this.errorMessage = 'Passwords must match.';
      } else {
        this.errorMessage = 'Please complete the required fields.';
      }
      return;
    }

    const raw = this.form.getRawValue();
    const payload: RegisterRequest = {
      email: raw.email.trim().toLowerCase(),
      password: raw.password,
      confirm_password: raw.confirm_password,
      full_name: raw.full_name.trim(),
      phone: raw.phone.trim() || null,
      role: raw.role,
      provider_profile:
        raw.role === 'provider'
          ? {
              bio: raw.provider_profile.bio.trim() || null,
              years_experience: Number(raw.provider_profile.years_experience) || 0,
            }
          : null,
    };

    this.loading = true;
    this.authService.register(payload).subscribe({
      next: () => this.router.navigateByUrl('/login'),
      error: (error: HttpErrorResponse) => {
        this.errorMessage = this.getRegistrationError(error);
        this.loading = false;
      },
    });
  }

  private getRegistrationError(error: HttpErrorResponse): string {
    const detail = error.error?.detail;

    if (typeof detail === 'string') {
      return detail;
    }

    if (Array.isArray(detail) && detail.length > 0) {
      return detail
        .map((item) => item?.msg)
        .filter(Boolean)
        .join(' ');
    }

    if (error.status === 0) {
      return 'Could not reach the API. Make sure the backend server is running.';
    }

    return 'Registration failed. Check your details and try again.';
  }
}
