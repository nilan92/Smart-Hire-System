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

const ICON_CHOICES = ['🛠️', '💧', '⚡', '✨', '📚', '💻', '🔧', '🎨', '🚗', '🌱', '📦', '🏠'];

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

  readonly iconChoices = ICON_CHOICES;
  showAddForm = false;
  adding = false;
  addError = '';
  newName = '';
  newDescription = '';
  newIcon = ICON_CHOICES[0];

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

  openAddForm(): void {
    this.newName = '';
    this.newDescription = '';
    this.newIcon = ICON_CHOICES[0];
    this.addError = '';
    this.showAddForm = true;
  }

  closeAddForm(): void {
    this.showAddForm = false;
  }

  submitAddForm(): void {
    const name = this.newName.trim();
    if (!name) {
      this.addError = 'Please enter a category name.';
      return;
    }

    this.adding = true;
    this.addError = '';
    this.http
      .post<Category>(`${environment.apiUrl}/admin/categories`, {
        name,
        description: this.newDescription.trim() || null,
        icon: this.newIcon,
      })
      .subscribe({
        next: (category) => {
          this.categories = [...this.categories, category];
          this.adding = false;
          this.showAddForm = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.adding = false;
          this.addError = err.error?.detail || 'Could not create this category.';
          this.cdr.detectChanges();
        }
      });
  }
}
