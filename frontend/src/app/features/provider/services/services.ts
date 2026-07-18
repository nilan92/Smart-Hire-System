import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MarketplaceService, ServiceStatus } from '../../../core/models/service.models';
import { MarketplaceServiceStore } from '../../../core/services/marketplace.service';

@Component({
  selector: 'app-provider-services',
  imports: [CurrencyPipe, ReactiveFormsModule],
  templateUrl: './services.html',
  styleUrl: './services.scss',
})
export class ProviderServices {
  private readonly fb = inject(FormBuilder);
  readonly store = inject(MarketplaceServiceStore);
  readonly showForm = signal(false);
  readonly editingId = signal<number | null>(null);
  readonly providerServices = computed(() => this.store.services().filter((service) => service.providerId === 1));
  readonly activeCount = computed(() => this.providerServices().filter((service) => service.status === 'active').length);
  readonly form = this.fb.nonNullable.group({ title: ['', [Validators.required, Validators.minLength(4)]], categoryId: [1, Validators.required], description: ['', [Validators.required, Validators.minLength(10)]], price: [2500, [Validators.required, Validators.min(0)]], city: ['Colombo', Validators.required], duration: ['1–2 hours', Validators.required], status: ['active' as ServiceStatus, Validators.required] });

  openForm(service?: MarketplaceService): void { this.editingId.set(service?.id ?? null); service ? this.form.patchValue(service) : this.form.reset({ title:'', categoryId:1, description:'', price:2500, city:'Colombo', duration:'1–2 hours', status:'active' }); this.showForm.set(true); }
  closeForm(): void { this.showForm.set(false); this.editingId.set(null); }
  save(): void { if (this.form.invalid) { this.form.markAllAsTouched(); return; } this.store.saveService(this.form.getRawValue(), this.editingId() ?? undefined); this.closeForm(); }
  toggleStatus(s: MarketplaceService): void { this.store.saveService({ title:s.title, categoryId:s.categoryId, description:s.description, price:s.price, city:s.city, duration:s.duration, status:s.status === 'active' ? 'paused' : 'active', featured:s.featured }, s.id); }
  remove(s: MarketplaceService): void { if (confirm(`Delete “${s.title}”?`)) this.store.removeService(s.id); }
}
