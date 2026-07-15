import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-management.html',
  styleUrls: ['./user-management.scss']
})
export class UserManagementComponent implements OnInit {
  users = [
    { id: 1, name: 'Alice Smith', email: 'alice@example.com', role: 'customer', status: 'active' },
    { id: 2, name: 'Bob Jones', email: 'bob@example.com', role: 'provider', status: 'active' },
    { id: 3, name: 'Charlie Brown', email: 'charlie@example.com', role: 'provider', status: 'suspended' },
    { id: 4, name: 'David Lee', email: 'david@example.com', role: 'customer', status: 'active' }
  ];

  ngOnInit(): void {}

  toggleStatus(user: any): void {
    user.status = user.status === 'active' ? 'suspended' : 'active';
  }
}
