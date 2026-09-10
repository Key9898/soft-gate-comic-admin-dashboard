import { apiRequest } from './http';
import type { FaqItem, FaqItemWrite } from '@/lib/faq';

export type FaqItemWriteBody = FaqItemWrite;

export function listFaqItems() {
  return apiRequest<{ items: FaqItem[] }>('/api/faq');
}

export function createFaqItem(body: FaqItemWriteBody) {
  return apiRequest<{ item: FaqItem }>('/api/faq', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function updateFaqItem(id: string, body: Partial<FaqItemWriteBody>) {
  return apiRequest<{ item: FaqItem }>(`/api/faq/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export function deleteFaqItem(id: string) {
  return apiRequest<{ ok: true }>(`/api/faq/${id}`, { method: 'DELETE' });
}
