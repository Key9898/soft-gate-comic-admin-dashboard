import { describe, expect, it } from 'vitest';
import { applyLaneSettle, mapFulfilled, toLaneError } from './deskLoad';

describe('applyLaneSettle', () => {
  it('writes the fulfilled value and clears the lane error', () => {
    const result = applyLaneSettle({ status: 'fulfilled', value: ['kept'] }, ['old'], false, []);
    expect(result.value).toEqual(['kept']);
    expect(result.error).toBeNull();
    expect(result.hadSuccess).toBe(true);
  });

  it('uses empty plus an error when the lane never succeeded', () => {
    const result = applyLaneSettle(
      { status: 'rejected', reason: new Error('boom') },
      ['stale'],
      false,
      [],
    );
    expect(result.value).toEqual([]);
    expect(result.error).toEqual(new Error('boom'));
    expect(result.hadSuccess).toBe(false);
  });

  it('keeps previous data when a later request fails', () => {
    const result = applyLaneSettle({ status: 'rejected', reason: 'nope' }, ['saved'], true, []);
    expect(result.value).toEqual(['saved']);
    expect(result.error).toEqual(toLaneError('nope'));
    expect(result.hadSuccess).toBe(true);
  });
});

describe('mapFulfilled', () => {
  it('maps a fulfilled payload and leaves rejects untouched', () => {
    expect(
      mapFulfilled({ status: 'fulfilled', value: { comments: [1] } }, (row) => row.comments),
    ).toEqual({ status: 'fulfilled', value: [1] });
    const rejected = { status: 'rejected' as const, reason: new Error('x') };
    expect(mapFulfilled(rejected, () => [])).toBe(rejected);
  });
});
