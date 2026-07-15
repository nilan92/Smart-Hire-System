import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-category-management',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './category-management.html',
  styleUrls: ['./category-management.scss']
})
export class CategoryManagementComponent implements OnInit {
  categories = [
    { id: 1, name: 'Plumbing', servicesCount: 15 },
    { id: 2, name: 'Electrician', servicesCount: 8 },
    { id: 3, name: 'Cleaning', servicesCount: 22 }
  ];

  ngOnInit(): void {}

  deleteCategory(id: number): void {
    if (confirm('Are you sure you want to delete this category?')) {
      this.categories = this.categories.filter(c => c.id !== id);
    }
  }

  addCategory(): void {
    const name = prompt('Enter the name of the new category:');
    if (name) {
      this.categories.push({
        id: Math.floor(Math.random() * 1000) + 10,
        name: name,
        servicesCount: 0
      });
    }
  }
}
