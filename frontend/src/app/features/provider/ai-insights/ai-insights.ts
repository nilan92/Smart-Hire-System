import { Component, OnInit, inject, signal } from '@angular/core';
import { AiService } from '../../../core/services/ai.service';
import { MarketplaceServiceStore } from '../../../core/services/marketplace.service';
import { MarketplaceService } from '../../../core/models/service.models';

@Component({ selector: 'app-provider-ai-insights', templateUrl: './ai-insights.html', styleUrl: './ai-insights.scss' })
export class ProviderAiInsights implements OnInit {
  private readonly ai = inject(AiService); readonly store = inject(MarketplaceServiceStore);
  readonly selected = signal<MarketplaceService | null>(null); readonly summary = signal(''); readonly loading = signal(false); readonly error = signal('');
  ngOnInit(): void { this.store.loadProviderData(); }
  generate(service: MarketplaceService): void { this.selected.set(service); this.summary.set(''); this.error.set(''); this.loading.set(true); this.ai.summarizeReviews(service.id).subscribe({ next: x => { this.summary.set(x.summary); this.loading.set(false); }, error: () => { this.error.set('Unable to generate a summary right now.'); this.loading.set(false); } }); }
}
