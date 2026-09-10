import { describe, expect, it, beforeEach } from 'vitest';
import { DEFAULT_FAQ_ITEMS, FAQ_STORAGE_KEY, loadFaq, saveFaq } from './faq';

describe('faq mock store', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('seeds q1–q20 when the key is missing', () => {
    const snapshot = loadFaq();
    expect(snapshot.items).toHaveLength(20);
    expect(snapshot.items[0]?.id).toBe(DEFAULT_FAQ_ITEMS[0]?.id);
    expect(snapshot.meta.nextItemNumber).toBe(21);
  });

  it('honors a saved empty list', () => {
    saveFaq({ meta: { nextItemNumber: 21 }, items: [] });
    expect(localStorage.getItem(FAQ_STORAGE_KEY)).toContain('nextItemNumber');
    const loaded = loadFaq();
    expect(loaded.items).toEqual([]);
  });
});
