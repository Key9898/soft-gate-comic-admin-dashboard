import type { BilingualText, ImageSize } from './catalogStore.js';

export function readString(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

export function readBilingual(value: unknown, requiredEn: boolean): BilingualText | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const row = value as { en?: unknown; mm?: unknown };
  const en = typeof row.en === 'string' ? row.en.trim() : '';
  const mm = typeof row.mm === 'string' ? row.mm : '';
  if (requiredEn && !en) return null;
  return { en, mm };
}

export function readOptionalBilingual(value: unknown): BilingualText | undefined | null {
  if (value === undefined) return undefined;
  if (value === null) return undefined;
  return readBilingual(value, false);
}

export function readStringArray(value: unknown): string[] | null {
  if (value === undefined) return [];
  if (!Array.isArray(value)) return null;
  const next: string[] = [];
  for (const item of value) {
    if (typeof item !== 'string') return null;
    const trimmed = item.trim();
    if (trimmed) next.push(trimmed);
  }
  return next;
}

export function readIsoDate(value: unknown): { ok: true; date?: Date } | { ok: false } {
  if (value === undefined || value === null || value === '') return { ok: true, date: undefined };
  if (typeof value !== 'string') return { ok: false };
  const ms = Date.parse(value);
  if (Number.isNaN(ms)) return { ok: false };
  return { ok: true, date: new Date(ms) };
}

export function readNonNegInt(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 0) return null;
  return value;
}

export function readImageSizes(value: unknown, imageCount: number): ImageSize[] | undefined | null {
  if (value === undefined || value === null) return undefined;
  if (!Array.isArray(value) || value.length !== imageCount) return null;
  const next: ImageSize[] = [];
  let measured = false;
  for (const item of value) {
    if (item === null) {
      next.push(null);
      continue;
    }
    if (!item || typeof item !== 'object' || Array.isArray(item)) return null;
    const row = item as { width?: unknown; height?: unknown };
    if (typeof row.width !== 'number' || typeof row.height !== 'number') return null;
    if (
      !Number.isFinite(row.width) ||
      !Number.isFinite(row.height) ||
      row.width <= 0 ||
      row.height <= 0
    ) {
      next.push(null);
      continue;
    }
    next.push({ width: row.width, height: row.height });
    measured = true;
  }
  return measured ? next : undefined;
}

export function hasOwn(body: object, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(body, key);
}
