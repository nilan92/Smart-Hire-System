import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { API_ENDPOINTS } from '../utils/api-endpoints';

export interface AiMessage { id?: number; role: 'user' | 'assistant'; message: string; created_at?: string; }
export interface AiConversation { id: number; title: string; updated_at: string; }
export interface Recommendation { category_id: number; category_name: string; reason: string; services: { id: number; title: string; provider_name: string; city: string; price: number; rating: number; }[]; }

@Injectable({ providedIn: 'root' })
export class AiService {
  private readonly http = inject(HttpClient);
  private readonly api = environment.apiUrl;
  chat(message: string, conversation_id?: number, use_mcp?: boolean) { return this.http.post<{ conversation_id: number; reply: string; recommended_services?: Recommendation['services'] }>(`${this.api}${API_ENDPOINTS.ai.chat}`, { message, conversation_id, use_mcp }); }
  recommend(description: string) { return this.http.post<Recommendation>(`${this.api}${API_ENDPOINTS.ai.recommend}`, { description }); }
  conversations() { return this.http.get<AiConversation[]>(`${this.api}${API_ENDPOINTS.ai.conversations}`); }
  analysis() { return this.http.get<{ conversation_count: number; message_count: number; latest_conversation_at: string | null }>(`${this.api}${API_ENDPOINTS.ai.conversations}/analysis`); }
  conversation(id: number) { return this.http.get<{ id: number; title: string; messages: AiMessage[] }>(`${this.api}${API_ENDPOINTS.ai.conversation(id)}`); }
  summarizeReviews(service_id: number) { return this.http.post<{ service_id: number; summary: string }>(`${this.api}${API_ENDPOINTS.ai.summarizeReviews}`, { service_id }); }
}
