import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AvailabilitySlot, DAY_NAMES } from '../../../core/models/booking.models';
import { AvailabilityStore } from '../../../core/services/availability.service';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';
import { ErrorMessage } from '../../../shared/components/error-message/error-message';
import { LoadingSpinner } from '../../../shared/components/loading-spinner/loading-spinner';

@Component({
  selector: 'app-provider-availability',
  imports: [CommonModule, FormsModule, LoadingSpinner, ErrorMessage, EmptyState],
  templateUrl: './availability.html',
  styleUrl: './availability.scss',
})
export class ProviderAvailability implements OnInit {
  readonly store = inject(AvailabilityStore);
  readonly days = DAY_NAMES;

  readonly dayOfWeek = signal(1);
  readonly startTime = signal('09:00');
  readonly endTime = signal('17:00');
  readonly formError = signal('');

  readonly slotsByDay = computed(() => {
    const grouped = new Map<number, AvailabilitySlot[]>();
    for (let day = 0; day < 7; day++) {
      grouped.set(day, this.store.slots().filter((slot) => slot.day_of_week === day));
    }
    return grouped;
  });

  ngOnInit(): void {
    this.store.loadMine();
  }

  addSlot(): void {
    if (!this.startTime() || !this.endTime()) {
      this.formError.set('Please choose a start and end time.');
      return;
    }
    if (this.endTime() <= this.startTime()) {
      this.formError.set('End time must be after the start time.');
      return;
    }
    this.formError.set('');
    this.store.addSlot({
      day_of_week: this.dayOfWeek(),
      start_time: `${this.startTime()}:00`,
      end_time: `${this.endTime()}:00`,
    });
    this.startTime.set('09:00');
    this.endTime.set('17:00');
  }

  removeSlot(id: number): void {
    this.store.removeSlot(id);
  }

  formatTime(value: string): string {
    const [hours, minutes] = value.split(':');
    const hour = Number(hours);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    return `${displayHour}:${minutes} ${period}`;
  }
}
