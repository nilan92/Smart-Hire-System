import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface Category {
  id: number;
  name: string;
  description: string | null;
  icon: string;
  service_count: number;
}

@Component({
  selector: 'app-category-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './category-management.html',
  styleUrls: ['./category-management.scss']
})
export class CategoryManagementComponent implements OnInit {
  categories: Category[] = [];
  loading = true;
  error = '';
  deletingId: number | null = null;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.fetchCategories();
  }

  fetchCategories(): void {
    this.loading = true;
    this.error = '';
    this.http.get<Category[]>(`${environment.apiUrl}/admin/categories`).subscribe({
      next: (data) => {
        this.categories = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load categories:', err);
        this.error = 'Failed to load categories. Please try again.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  deleteCategory(category: Category): void {
    if (!confirm(`Delete "${category.name}"? This cannot be undone.`)) return;

    this.deletingId = category.id;
    this.http.delete(`${environment.apiUrl}/admin/categories/${category.id}`).subscribe({
      next: () => {
        this.categories = this.categories.filter(c => c.id !== category.id);
        this.deletingId = null;
        this.cdr.detectChanges();
      },
      error: (err) => {
        alert(err.error?.detail || 'Could not delete this category.');
        this.deletingId = null;
        this.cdr.detectChanges();
      }
    });
  }

  addCategory(): void {
    const name = prompt('Enter the name of the new category:');
    if (!name?.trim()) return;

    this.http.post<Category>(`${environment.apiUrl}/admin/categories`, { name: name.trim() }).subscribe({
      next: (category) => {
        this.categories = [...this.categories, category];
        this.cdr.detectChanges();
      },
      error: (err) => {
        alert(err.error?.detail || 'Could not create this category.');
      }
    });
  }
}
