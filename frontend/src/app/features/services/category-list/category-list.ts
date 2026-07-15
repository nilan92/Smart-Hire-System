import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

interface ServiceCategory {
  id: number;
  name: string;
  icon: string;
  description: string;
  serviceCount: number;
  color: string;
}

@Component({
  selector: 'app-category-list',
  imports: [RouterLink],
  templateUrl: './category-list.html',
  styleUrl: './category-list.scss',
})
export class CategoryList {
  searchTerm = '';

  categories: ServiceCategory[] = [
    {
      id: 1,
      name: 'Plumbing',
      icon: '🔧',
      description:
        'Professional plumbing installations, maintenance and emergency repairs.',
      serviceCount: 42,
      color: 'blue',
    },
    {
      id: 2,
      name: 'Electrical',
      icon: '⚡',
      description:
        'Qualified electricians for wiring, installations and electrical repairs.',
      serviceCount: 35,
      color: 'yellow',
    },
    {
      id: 3,
      name: 'Cleaning',
      icon: '🧹',
      description:
        'Reliable residential, office and commercial cleaning professionals.',
      serviceCount: 58,
      color: 'green',
    },
    {
      id: 4,
      name: 'Tutoring',
      icon: '📚',
      description:
        'Experienced tutors for school subjects, languages and professional skills.',
      serviceCount: 31,
      color: 'purple',
    },
    {
      id: 5,
      name: 'Home Repairs',
      icon: '🏠',
      description:
        'Skilled professionals for maintenance, painting and general home repairs.',
      serviceCount: 47,
      color: 'orange',
    },
    {
      id: 6,
      name: 'Tech Support',
      icon: '💻',
      description:
        'Computer, mobile device, networking and software support services.',
      serviceCount: 29,
      color: 'cyan',
    },
    {
      id: 7,
      name: 'Gardening',
      icon: '🌿',
      description:
        'Garden maintenance, landscaping and outdoor improvement services.',
      serviceCount: 24,
      color: 'lime',
    },
    {
      id: 8,
      name: 'Beauty & Wellness',
      icon: '✂️',
      description:
        'Professional salon, grooming, wellness and personal-care services.',
      serviceCount: 38,
      color: 'pink',
    },
    {
      id: 9,
      name: 'Vehicle Services',
      icon: '🚗',
      description:
        'Vehicle repair, servicing, cleaning and roadside assistance.',
      serviceCount: 33,
      color: 'red',
    },
  ];

  constructor(private router: Router) {}

  get filteredCategories(): ServiceCategory[] {
    const search = this.searchTerm.trim().toLowerCase();

    if (!search) {
      return this.categories;
    }

    return this.categories.filter(
      (category) =>
        category.name.toLowerCase().includes(search) ||
        category.description.toLowerCase().includes(search),
    );
  }

  updateSearch(value: string): void {
    this.searchTerm = value;
  }

  browseCategory(category: ServiceCategory): void {
    this.router.navigate(['/services'], {
      queryParams: {
        category: category.name,
        categoryId: category.id,
      },
    });
  }
}
