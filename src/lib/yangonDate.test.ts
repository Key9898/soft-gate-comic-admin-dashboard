import { describe, expect, it } from 'vitest';
import {
  isoToYangonCalendarDay,
  isoToYangonDateTimeLocal,
  isoToYangonTimeHm,
  stampIso,
  yangonDateAndTimeToIso,
  yangonDateTimeLocalToIso,
} from './yangonDate';

describe('yangonDate', () => {
  it('converts Yangon datetime-local to UTC ISO', () => {
    expect(yangonDateTimeLocalToIso('2026-08-22T10:00')).toBe('2026-08-22T03:30:00.000Z');
  });

  it('converts Yangon date + time to UTC ISO', () => {
    expect(yangonDateAndTimeToIso('2026-08-24', '10:00')).toBe('2026-08-24T03:30:00.000Z');
  });

  it('round-trips ISO through Yangon datetime-local', () => {
    const iso = '2026-08-24T03:30:00.000Z';
    expect(isoToYangonDateTimeLocal(iso)).toBe('2026-08-24T10:00');
    expect(yangonDateTimeLocalToIso(isoToYangonDateTimeLocal(iso))).toBe(iso);
  });

  it('returns Yangon calendar day and clock', () => {
    expect(isoToYangonCalendarDay('2026-08-24T03:30:00.000Z')).toBe('2026-08-24');
    expect(isoToYangonTimeHm('2026-08-24T03:30:00.000Z')).toBe('10:00');
  });

  it('returns empty string for invalid input', () => {
    expect(yangonDateTimeLocalToIso('')).toBe('');
    expect(isoToYangonDateTimeLocal('not-a-date')).toBe('');
    expect(yangonDateAndTimeToIso('2026-08-24', '')).toBe('');
  });

  it('stamps a new ISO when the existing value is blank', () => {
    expect(stampIso('')).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(stampIso('2026-08-01T00:00:00.000Z')).toBe('2026-08-01T00:00:00.000Z');
  });
});
