const YANGON_OFFSET_MS = (6 * 60 + 30) * 60 * 1000;

const pad = (n: number) => String(n).padStart(2, '0');

const parseDateTimeLocal = (
  local: string,
): { y: number; m: number; d: number; hh: number; mm: number; ss: number } | null => {
  if (!local) return null;
  const normalized = local.length === 16 ? `${local}:00` : local;
  const [datePart, timePart] = normalized.split('T');
  if (!datePart || !timePart) return null;
  const [y, m, d] = datePart.split('-').map(Number);
  const [hh, mm, ss] = timePart.split(':').map(Number);
  if (![y, m, d, hh, mm].every((n) => Number.isFinite(n))) return null;
  return { y, m, d, hh, mm, ss: Number.isFinite(ss) ? ss : 0 };
};

/** Interpret a `datetime-local` value as Asia/Yangon and return UTC ISO. */
export const yangonDateTimeLocalToIso = (local: string): string => {
  const parts = parseDateTimeLocal(local);
  if (!parts) return '';
  const utcMs =
    Date.UTC(parts.y, parts.m - 1, parts.d, parts.hh, parts.mm, parts.ss) - YANGON_OFFSET_MS;
  return new Date(utcMs).toISOString();
};

/** Combine a Yangon calendar date (`YYYY-MM-DD`) and time (`HH:mm`) into UTC ISO. */
export const yangonDateAndTimeToIso = (date: string, time: string): string => {
  if (!date || !time) return '';
  return yangonDateTimeLocalToIso(`${date}T${time}`);
};

/** Convert a UTC ISO stamp to a Yangon `datetime-local` value (`YYYY-MM-DDTHH:mm`). */
export const isoToYangonDateTimeLocal = (iso: string): string => {
  const ms = Date.parse(iso);
  if (Number.isNaN(ms)) return '';
  const yangon = new Date(ms + YANGON_OFFSET_MS);
  return `${yangon.getUTCFullYear()}-${pad(yangon.getUTCMonth() + 1)}-${pad(yangon.getUTCDate())}T${pad(yangon.getUTCHours())}:${pad(yangon.getUTCMinutes())}`;
};

/** Yangon calendar day (`YYYY-MM-DD`) for a UTC ISO stamp. */
export const isoToYangonCalendarDay = (iso: string): string => {
  const local = isoToYangonDateTimeLocal(iso);
  return local ? local.slice(0, 10) : '';
};

export const isoToYangonTimeHm = (iso: string): string => {
  const local = isoToYangonDateTimeLocal(iso);
  return local ? local.slice(11, 16) : '';
};

export const nowIso = (): string => new Date().toISOString();

export const stampIso = (existing?: string): string =>
  existing && existing.trim() ? existing : nowIso();
