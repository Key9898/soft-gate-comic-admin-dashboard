import { describe, expect, it, beforeEach } from 'vitest';
import {
  DEFAULT_PRIVACY_META,
  LEGAL_SLUG_RE,
  LEGAL_STORAGE_KEY,
  PRIVACY_META_ID,
  RESERVED_LEGAL_SLUGS,
  TERMS_META_ID,
  loadLegal,
  saveLegal,
  nextLegalSectionId,
} from './legal';

describe('legal mock store', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('seeds today’s privacy and terms copy', () => {
    const snapshot = loadLegal();
    expect(snapshot.privacy.meta.seoDesc.en).toBe(DEFAULT_PRIVACY_META.seoDesc.en);
    expect(snapshot.privacy.meta.glance[0]?.en).toMatch(/does not send your data to any server/);
    expect(snapshot.privacy.sections.map((row) => row.slug)).toContain('rights');
    expect(snapshot.terms.sections.map((row) => row.slug)).toContain('coins');
    expect(snapshot.privacy.meta.effectiveDate).toBe('2026-09-10');
    expect(LEGAL_SLUG_RE.test('collect')).toBe(true);
    expect(RESERVED_LEGAL_SLUGS).toEqual(['glance', 'contact']);
    expect(PRIVACY_META_ID).toBe('privacy');
    expect(TERMS_META_ID).toBe('terms');
  });

  it('round-trips through softgate_admin_legal_v1', () => {
    const snapshot = loadLegal();
    snapshot.privacy.meta.seoDesc.en = 'Updated privacy SEO';
    snapshot.privacy.sections.push({
      id: nextLegalSectionId('privacy', snapshot.privacy.sections),
      slug: 'extra',
      kind: 'body',
      headingLevel: 'h2',
      title: { en: 'Extra', mm: 'အပို' },
      body: { en: 'Body', mm: 'စာသား' },
      bullets: [],
      sortOrder: 20,
      published: true,
    });
    saveLegal(snapshot);
    expect(localStorage.getItem(LEGAL_STORAGE_KEY)).toContain('Updated privacy SEO');
    const loaded = loadLegal();
    expect(loaded.privacy.meta.seoDesc.en).toBe('Updated privacy SEO');
    expect(loaded.privacy.sections.some((row) => row.slug === 'extra')).toBe(true);
  });
});
