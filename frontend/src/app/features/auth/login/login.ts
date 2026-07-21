import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login implements OnInit {
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

  ngOnInit(): void {
    // If user is already authenticated with a valid session/token, redirect to their role's main page
    if (this.authService.getToken()) {
      const user = this.authService.currentUser();
      if (user) {
        this.router.navigateByUrl(this.authService.getRoleRedirect(user), { replaceUrl: true });
      } else {
        this.authService.loadCurrentUser().subscribe({
          next: (loadedUser) => {
            this.router.navigateByUrl(this.authService.getRoleRedirect(loadedUser), { replaceUrl: true });
          },
          error: () => {
            // Token might be expired or invalid, clear token
            this.authService.logout();
          }
        });
      }
    }
  }

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
        this.router.navigateByUrl(this.authService.getRoleRedirect(user), { replaceUrl: true });
      },
      error: () => {
        this.errorMessage = 'Invalid email or password. Please try again.';
        this.loading = false;
      },
    });
  }
}
