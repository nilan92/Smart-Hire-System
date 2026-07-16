import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { User } from '../../../core/models/auth.models';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {
  @Input() user: User | null = null;
  @Output() menuToggle = new EventEmitter<void>();
  @Output() logout = new EventEmitter<void>();
}
