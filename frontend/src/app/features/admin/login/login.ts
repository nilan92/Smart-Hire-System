import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent {
  pin = '';
  error = false;

  constructor(private authService: AuthService, private router: Router) {}

  addNumber(num: number) {
    if (this.pin.length < 4) {
      this.pin += num.toString();
      this.error = false;
      if (this.pin.length === 4) {
        setTimeout(() => this.validatePin(), 100);
      }
    }
  }

  deleteNumber() {
    if (this.pin.length > 0) {
      this.pin = this.pin.slice(0, -1);
      this.error = false;
    }
  }

  validatePin() {
    if (this.authService.login(this.pin)) {
      this.error = false;
      this.router.navigate(['/admin']);
    } else {
      this.error = true;
      setTimeout(() => this.pin = '', 500);
    }
  }
}
