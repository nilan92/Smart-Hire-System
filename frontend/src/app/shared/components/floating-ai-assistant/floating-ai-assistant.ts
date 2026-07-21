import { CommonModule } from '@angular/common';
import { AfterViewChecked, Component, ElementRef, ViewChild, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AiService } from '../../../core/services/ai.service';
import { AuthService } from '../../../core/services/auth.service';

interface ChatBubble {
  role: 'user' | 'assistant';
  message: string;
}

const GREETINGS: Record<string, string> = {
  provider: "Hey! 👋 I can help with your bookings, availability, or how things work here. What's up?",
  customer: "Hey! 👋 Looking for a service? Just tell me what you need.",
};

@Component({
  selector: 'app-floating-ai-assistant',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './floating-ai-assistant.html',
  styleUrl: './floating-ai-assistant.scss',
})
export class FloatingAiAssistant implements AfterViewChecked {
  private readonly ai = inject(AiService);
  private readonly auth = inject(AuthService);
  @ViewChild('scrollAnchor') private scrollAnchor?: ElementRef<HTMLDivElement>;

  readonly open = signal(false);
  readonly draft = signal('');
  readonly loading = signal(false);
  readonly messages = signal<ChatBubble[]>([
    { role: 'assistant', message: GREETINGS[this.auth.currentUser()?.role ?? 'customer'] ?? GREETINGS['customer'] },
  ]);

  private conversationId?: number;
  private shouldScroll = false;

  ngAfterViewChecked(): void {
    if (this.shouldScroll && this.scrollAnchor) {
      this.scrollAnchor.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
      this.shouldScroll = false;
    }
  }

  toggle(): void {
    this.open.update((v) => !v);
    if (this.open()) {
      this.shouldScroll = true;
    }
  }

  send(): void {
    const text = this.draft().trim();
    if (!text || this.loading()) return;

    this.messages.update((m) => [...m, { role: 'user', message: text }]);
    this.draft.set('');
    this.loading.set(true);
    this.shouldScroll = true;

    this.ai.chat(text, this.conversationId).subscribe({
      next: (res) => {
        this.conversationId = res.conversation_id;
        this.messages.update((m) => [...m, { role: 'assistant', message: res.reply }]);
        this.loading.set(false);
        this.shouldScroll = true;
      },
      error: () => {
        this.messages.update((m) => [...m, { role: 'assistant', message: "Ugh, something glitched on my end — mind trying again?" }]);
        this.loading.set(false);
        this.shouldScroll = true;
      },
    });
  }
}
