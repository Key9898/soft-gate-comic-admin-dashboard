import { describe, it, expect } from 'vitest';
import { safeReturnTo } from './safeReturnTo';

describe('safeReturnTo', () => {
  it('returns / for missing or unsafe paths', () => {
    expect(safeReturnTo()).toBe('/');
    expect(safeReturnTo({ pathname: '//evil.com' })).toBe('/');
    expect(safeReturnTo({ pathname: '/x\\y' })).toBe('/');
    expect(safeReturnTo({ pathname: '/http:foo' })).toBe('/');
  });

  it('keeps same-origin relative paths and search', () => {
    expect(safeReturnTo({ pathname: '/webtoons', search: '?q=1' })).toBe('/webtoons?q=1');
  });
});
