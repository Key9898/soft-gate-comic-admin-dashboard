import { apiRequest } from './http';
import type { LegalDoc, LegalMetaRecord, LegalSectionRecord, LegalSectionWrite } from '@/lib/legal';

export function getLegalMeta(doc: LegalDoc) {
  return apiRequest<{ meta: LegalMetaRecord }>(`/api/legal/${doc}`);
}

export function updateLegalMeta(doc: LegalDoc, body: LegalMetaRecord) {
  return apiRequest<{ meta: LegalMetaRecord }>(`/api/legal/${doc}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export function listLegalSections(doc: LegalDoc) {
  return apiRequest<{ sections: LegalSectionRecord[] }>(`/api/legal/${doc}/sections`);
}

export function createLegalSection(doc: LegalDoc, body: LegalSectionWrite) {
  return apiRequest<{ item: LegalSectionRecord }>(`/api/legal/${doc}/sections`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function updateLegalSection(doc: LegalDoc, id: string, body: Partial<LegalSectionWrite>) {
  return apiRequest<{ item: LegalSectionRecord }>(`/api/legal/${doc}/sections/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export function deleteLegalSection(doc: LegalDoc, id: string) {
  return apiRequest<{ ok: true }>(`/api/legal/${doc}/sections/${id}`, { method: 'DELETE' });
}
