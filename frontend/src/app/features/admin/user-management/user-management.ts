import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface User {
  id: number;
  full_name: string;
  email: string;
  role: 'admin' | 'provider' | 'customer';
  status: 'active' | 'pending' | 'suspended' | 'deactivated';
  email_verified: boolean;
  created_at: string;
  updatingStatus?: boolean;
}

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-management.html',
  styleUrls: ['./user-management.scss']
})
export class UserManagementComponent implements OnInit {
  users: User[] = [];
  loading = true;
  error = '';
  searchQuery = '';
  selectedRole = 'all';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.fetchUsers();
  }

  fetchUsers(): void {
    this.loading = true;
    this.error = '';
    this.http.get<User[]>(`${environment.apiUrl}/admin/users`).subscribe({
      next: (data) => {
        this.users = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load users:', err);
        this.error = 'Failed to load users. Please try again.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  get filteredUsers(): User[] {
    let result = this.users;
    if (this.selectedRole !== 'all') {
      result = result.filter(u => u.role === this.selectedRole);
    }
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(
        u => u.full_name?.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
      );
    }
    return result;
  }

  get totalCount(): number { return this.users.length; }

  setRoleFilter(role: string): void {
    this.selectedRole = role;
  }

  clearSearch(): void {
    this.searchQuery = '';
  }

  onStatusChange(user: User, newStatus: string): void {
    user.updatingStatus = true;
    this.http
      .put(`${environment.apiUrl}/admin/users/${user.id}/status`, { status: newStatus })
      .subscribe({
        next: () => {
          user.status = newStatus as User['status'];
          user.updatingStatus = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Failed to update user status:', err);
          user.updatingStatus = false;
          this.cdr.detectChanges();
        }
      });
  }

  getRoleBadgeClass(role: string): string {
    const map: Record<string, string> = {
      admin: 'badge-purple',
      provider: 'badge-blue',
      customer: 'badge-green'
    };
    return map[role] ?? 'badge-grey';
  }

  getStatusBadgeClass(status: string): string {
    const map: Record<string, string> = {
      active: 'badge-success',
      pending: 'badge-warning',
      suspended: 'badge-danger',
      deactivated: 'badge-grey'
    };
    return map[status] ?? 'badge-grey';
  }

  getInitial(user: User): string {
    return (user.full_name || user.email || 'U')[0].toUpperCase();
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  }
}
