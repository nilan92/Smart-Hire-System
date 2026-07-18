import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MarketplaceServiceStore } from '../../../core/services/marketplace.service';

@Component({
  selector: 'app-provider-service-areas',
  imports: [ReactiveFormsModule],
  templateUrl: './service-areas.html',
  styleUrl: './service-areas.scss',
})
export class ProviderServiceAreas {
  private readonly fb = inject(FormBuilder);
  readonly store = inject(MarketplaceServiceStore);
  readonly districts = ['Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Galle', 'Kurunegala'];
  readonly form = this.fb.nonNullable.group({ district: ['Colombo', Validators.required], city: ['', [Validators.required, Validators.minLength(2)]], radiusKm: [10, [Validators.required, Validators.min(1), Validators.max(50)]] });
  addArea(): void { if (this.form.invalid) { this.form.markAllAsTouched(); return; } this.store.saveArea(this.form.getRawValue()); this.form.patchValue({ city: '', radiusKm: 10 }); }
}
