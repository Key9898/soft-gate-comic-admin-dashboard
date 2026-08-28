import { describe, expect, it, vi } from 'vitest';
import { isValidImageSizes, measureImageSize, toImageSizes } from './episodeImages';

describe('toImageSizes', () => {
  it('omits the field when every slot is unmeasured', () => {
    expect(toImageSizes([null, {}, { width: 0, height: 10 }])).toBeUndefined();
  });

  it('keeps nulls beside measured slots and matches length', () => {
    expect(toImageSizes([{ width: 800, height: 1200 }, null, { width: 400, height: 600 }])).toEqual(
      [{ width: 800, height: 1200 }, null, { width: 400, height: 600 }],
    );
  });
});

describe('isValidImageSizes', () => {
  it('requires matching length and positive integer pairs or null', () => {
    expect(isValidImageSizes(['a', 'b'], [{ width: 1, height: 1 }, null])).toBe(true);
    expect(isValidImageSizes(['a'], [{ width: 1, height: 1 }, null])).toBe(false);
    expect(isValidImageSizes(['a'], [{ width: 1.5, height: 1 }])).toBe(false);
  });
});

describe('measureImageSize', () => {
  it('returns natural size when the image loads with positive integers', async () => {
    class FakeImage {
      naturalWidth = 320;
      naturalHeight = 480;
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      decode = () => Promise.resolve();
      set src(_value: string) {
        queueMicrotask(() => this.onload?.());
      }
    }
    vi.stubGlobal('Image', FakeImage);
    await expect(measureImageSize('blob:test')).resolves.toEqual({ width: 320, height: 480 });
    vi.unstubAllGlobals();
  });

  it('returns null when natural size is not a positive integer', async () => {
    class FakeImage {
      naturalWidth = 0;
      naturalHeight = 480;
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      decode = () => Promise.resolve();
      set src(_value: string) {
        queueMicrotask(() => this.onload?.());
      }
    }
    vi.stubGlobal('Image', FakeImage);
    await expect(measureImageSize('blob:zero')).resolves.toBeNull();
    vi.unstubAllGlobals();
  });

  it('returns null when load fails', async () => {
    class FakeImage {
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      decode = () => Promise.resolve();
      set src(_value: string) {
        queueMicrotask(() => this.onerror?.());
      }
    }
    vi.stubGlobal('Image', FakeImage);
    await expect(measureImageSize('blob:bad')).resolves.toBeNull();
    vi.unstubAllGlobals();
  });
});
