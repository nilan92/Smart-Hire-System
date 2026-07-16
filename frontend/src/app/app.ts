import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { AuthService } from './core/services/auth.service';
import { ToastComponent } from './shared/components/toast/toast.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  private readonly authService = inject(AuthService);

  protected readonly title = signal('smart-hire-frontend');

  ngOnInit(): void {
    if (this.authService.getToken() && !this.currentUser()) {
      this.authService.loadCurrentUser().subscribe({
        error: () => {
          // Keep the saved session usable if the API is temporarily unavailable.
        },
      });
    }
  }

  private currentUser() {
    return this.authService.currentUser();
  }
}
