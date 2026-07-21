import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { AuthService } from './core/services/auth.service';
import { ToastComponent } from './shared/components/toast/toast.component';
import { FloatingAiAssistant } from './shared/components/floating-ai-assistant/floating-ai-assistant';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastComponent, FloatingAiAssistant],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  private readonly authService = inject(AuthService);

  protected readonly title = signal('smart-hire-frontend');
  protected readonly showAssistant = computed(() => {
    const role = this.authService.currentUser()?.role;
    return role === 'customer' || role === 'provider';
  });

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
