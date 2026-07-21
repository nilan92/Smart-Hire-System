import { CurrencyPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AiConversation, AiMessage, AiService, Recommendation } from '../../../core/services/ai.service';
import { BookingStore } from '../../../core/services/booking.service';

@Component({ selector: 'app-customer-ai-assistant', imports: [CurrencyPipe, FormsModule], templateUrl: './ai-assistant.html', styleUrl: './ai-assistant.scss' })
export class CustomerAiAssistant implements OnInit {
  private readonly ai = inject(AiService);
  private readonly bookings = inject(BookingStore);
  readonly messages = signal<AiMessage[]>([{ role: 'assistant', message: 'Hi! Describe what you need help with and I will recommend a service category.' }]);
  readonly history = signal<AiConversation[]>([]); readonly recommendation = signal<Recommendation | null>(null);
  readonly draft = signal(''); readonly loading = signal(false); readonly activeConversationId = signal<number | undefined>(undefined);
  readonly analytics = signal({ conversation_count: 0, message_count: 0 });
  readonly bookingService = signal<Recommendation['services'][number] | null>(null); readonly bookingDate = signal(''); readonly bookingTime = signal('');
  readonly bookingError = signal(''); readonly bookingConfirmation = signal(''); readonly bookingSubmitting = signal(false);
  ngOnInit(): void { this.loadHistory(); }
  send(): void { const text = this.draft().trim(); if (!text || this.loading()) return; this.messages.update(x => [...x, { role: 'user', message: text }]); this.draft.set(''); this.loading.set(true);
    this.ai.chat(text, this.activeConversationId(), true).subscribe({ next: x => { this.activeConversationId.set(x.conversation_id); this.messages.update(m => [...m, { role: 'assistant', message: x.reply }]); this.loading.set(false); this.loadHistory(); }, error: () => { this.messages.update(m => [...m, { role: 'assistant', message: 'Sorry, I could not send that message. Please try again.' }]); this.loading.set(false); } }); }
  findRecommendation(): void { const text = this.draft().trim(); if (!text || this.loading()) return; this.send(); this.ai.recommend(text).subscribe({ next: x => this.recommendation.set(x) }); }
  openConversation(id: number): void { this.ai.conversation(id).subscribe({ next: x => { this.activeConversationId.set(x.id); this.messages.set(x.messages); this.recommendation.set(null); } }); }
  newConversation(): void { this.activeConversationId.set(undefined); this.messages.set([{ role: 'assistant', message: 'What service can I help you find today?' }]); this.recommendation.set(null); }
  startBooking(service: Recommendation['services'][number]): void { this.bookingService.set(service); this.bookingError.set(''); this.bookingConfirmation.set(''); this.bookingDate.set(new Date(Date.now() + 86400000).toISOString().slice(0, 10)); this.bookingTime.set('09:00'); }
  cancelBooking(): void { this.bookingService.set(null); }
  submitBooking(): void { const service = this.bookingService(); if (!service || !this.bookingDate() || !this.bookingTime()) { this.bookingError.set('Choose a future date and time.'); return; } this.bookingSubmitting.set(true); this.bookingError.set(''); this.bookings.createBooking({ service_id: service.id, booking_date: new Date(`${this.bookingDate()}T${this.bookingTime()}`).toISOString(), notes: `Requested through Smart Hire AI for ${service.title}.` }).subscribe({ next: () => { this.bookingConfirmation.set(`Booking request for ${service.title} sent to ${service.provider_name}.`); this.bookingService.set(null); this.bookingSubmitting.set(false); }, error: err => { this.bookingError.set(err?.error?.detail ?? 'Could not create the booking request.'); this.bookingSubmitting.set(false); } }); }
  private loadHistory(): void { this.ai.conversations().subscribe({ next: x => this.history.set(x) }); this.ai.analysis().subscribe({ next: x => this.analytics.set(x) }); }
}
