import { describe, expect, it, beforeEach } from 'vitest';
import {
  DEFAULT_PRESS_META,
  PRESS_STORAGE_KEY,
  loadPress,
  savePress,
  nextPressNewsId,
} from './press';

describe('press mock store', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('seeds today’s kit copy with an empty news table', () => {
    const snapshot = loadPress();
    expect(snapshot.meta.copy.boilerplateTitle.en).toBe(
      DEFAULT_PRESS_META.copy.boilerplateTitle.en,
    );
    expect(snapshot.meta.zipUrl).toBe('/press-kit/softgate-comic-press-kit.zip');
    expect(snapshot.news).toEqual([]);
    expect(snapshot.stills).toEqual([]);
  });

  it('round-trips through softgate_admin_press_v1', () => {
    savePress({
      meta: { ...DEFAULT_PRESS_META, contactEmail: 'desk@softgatecomic.com' },
      news: [
        {
          id: nextPressNewsId([]),
          title: { en: 'Note', mm: 'မှတ်ချက်' },
          body: { en: 'Body', mm: 'စာသား' },
          sortOrder: 0,
          published: true,
          demoBadge: false,
        },
      ],
      stills: [],
    });
    expect(localStorage.getItem(PRESS_STORAGE_KEY)).toContain('softgatecomic.com');
    const loaded = loadPress();
    expect(loaded.meta.contactEmail).toBe('desk@softgatecomic.com');
    expect(loaded.news).toHaveLength(1);
    expect(loaded.news[0]?.id).toBe('n1');
  });
});
