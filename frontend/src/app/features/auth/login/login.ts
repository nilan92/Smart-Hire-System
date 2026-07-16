import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  loading = false;
  errorMessage = '';
  showPassword = false;

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  fillAdmin(): void {
    this.form.patchValue({ email: 'admin@gmail.com', password: '123456789' });
  }

  fillProvider(): void {
    this.form.patchValue({ email: 'nilanpro@gmail.com', password: '12345678' });
  }

  fillCustomer(): void {
    this.form.patchValue({ email: 'nilan@gmail.com', password: '12345678' });
  }

  submit(): void {
    this.errorMessage = '';
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.authService.login(this.form.getRawValue()).subscribe({
      next: ({ user }) => {
        const target =
          user.role === 'admin'
            ? '/admin/dashboard'
            : user.role === 'provider'
              ? '/provider/profile'
              : '/customer/profile';
        this.router.navigateByUrl(target, { replaceUrl: true });
      },
      error: () => {
        this.errorMessage = 'Invalid email or password. Please try again.';
        this.loading = false;
      },
    });
  }
}
