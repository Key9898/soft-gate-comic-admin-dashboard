import type { Express, NextFunction, Response } from 'express';
import { Router } from 'express';
import { canWriteSettings } from '../auth/rbac.js';
import { createRequireStaff, type AuthedRequest } from '../auth/requireStaff.js';
import type { StaffStore } from '../auth/staffStore.js';
import { hasOwn, readBilingual } from '../catalog/parse.js';
import { isMissingTableError } from '../prismaMissingTable.js';
import {
  COOKIE_COPY_KEYS,
  COOKIE_STORAGE_KEYS,
  DEFAULT_COOKIE_META,
  DEFAULT_COOKIE_ROWS,
  isCookieStorageKey,
  persistedCookieMeta,
  persistedCookieRow,
  type BilingualText,
  type CookieCopy,
  type CookieMetaRecord,
  type CookieRowPatch,
  type CookieRowWrite,
  type CookieStore,
} from './cookieStore.js';

function requireSettingsWrite(req: AuthedRequest, res: Response, next: NextFunction) {
  if (!canWriteSettings(req.staff?.role)) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }
  next();
}

function readRequiredBilingual(
  value: unknown,
  label: string,
): { ok: true; value: BilingualText } | { ok: false; error: string } {
  const text = readBilingual(value, true);
  if (!text) return { ok: false, error: `${label} must include en and mm` };
  const en = text.en.trim();
  const mm = text.mm.trim();
  if (!en || !mm) return { ok: false, error: `${label} must include en and mm` };
  return { ok: true, value: { en, mm } };
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function parseMetaWrite(
  body: unknown,
): { ok: true; meta: CookieMetaRecord } | { ok: false; error: string } {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { ok: false, error: 'Invalid body' };
  }
  const input = body as Record<string, unknown>;
  if (typeof input.effectiveDate !== 'string' || !DATE_RE.test(input.effectiveDate)) {
    return { ok: false, error: 'effectiveDate must be YYYY-MM-DD' };
  }
  if (!input.copy || typeof input.copy !== 'object' || Array.isArray(input.copy)) {
    return { ok: false, error: 'copy is required' };
  }
  const copySource = input.copy as Record<string, unknown>;
  const copy = {} as CookieCopy;
  for (const key of COOKIE_COPY_KEYS) {
    const parsed = readRequiredBilingual(copySource[key], key);
    if (!parsed.ok) return parsed;
    copy[key] = parsed.value;
  }
  if (!Array.isArray(input.glance) || input.glance.length !== 5) {
    return { ok: false, error: 'glance must include exactly 5 bilingual strings' };
  }
  const glance: BilingualText[] = [];
  for (let i = 0; i < 5; i += 1) {
    const parsed = readRequiredBilingual(input.glance[i], `glance[${i}]`);
    if (!parsed.ok) return parsed;
    glance.push(parsed.value);
  }
  return {
    ok: true,
    meta: { effectiveDate: input.effectiveDate, copy, glance },
  };
}

function parseRowWrite(
  body: unknown,
  partial: boolean,
): { ok: true; patch: CookieRowPatch & { storageKey?: string } } | { ok: false; error: string } {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { ok: false, error: 'Invalid body' };
  }
  const input = body as Record<string, unknown>;
  const patch: CookieRowPatch & { storageKey?: string } = {};

  if (!partial || hasOwn(input, 'storageKey')) {
    if (typeof input.storageKey !== 'string' || !isCookieStorageKey(input.storageKey)) {
      return {
        ok: false,
        error: `storageKey must be one of ${COOKIE_STORAGE_KEYS.join(', ')}`,
      };
    }
    patch.storageKey = input.storageKey;
  }

  if (!partial || hasOwn(input, 'label')) {
    const label = readRequiredBilingual(input.label, 'label');
    if (!label.ok) return label;
    patch.label = label.value;
  }

  if (!partial || hasOwn(input, 'description')) {
    const description = readRequiredBilingual(input.description, 'description');
    if (!description.ok) return description;
    patch.description = description.value;
  }

  if (!partial || hasOwn(input, 'sortOrder')) {
    if (
      typeof input.sortOrder !== 'number' ||
      !Number.isInteger(input.sortOrder) ||
      input.sortOrder < 0
    ) {
      return { ok: false, error: 'sortOrder must be a non-negative integer' };
    }
    patch.sortOrder = input.sortOrder;
  }

  return { ok: true, patch };
}

function asRowWrite(patch: CookieRowPatch & { storageKey?: string }): CookieRowWrite | null {
  if (
    !patch.storageKey ||
    !isCookieStorageKey(patch.storageKey) ||
    !patch.label ||
    !patch.description ||
    patch.sortOrder == null
  ) {
    return null;
  }
  return {
    storageKey: patch.storageKey,
    label: patch.label,
    description: patch.description,
    sortOrder: patch.sortOrder,
  };
}

export function mountCookieRoutes(app: Express, staff: StaffStore, cookies: CookieStore) {
  const requireStaff = createRequireStaff(staff);
  const router = Router();
  router.use(requireStaff);

  router.get('/', async (_req, res) => {
    try {
      const [meta, rows] = await Promise.all([cookies.getMeta(), cookies.listRows()]);
      res.json({ meta: persistedCookieMeta(meta), rows: rows.map(persistedCookieRow) });
    } catch (err) {
      if (isMissingTableError(err)) {
        res.json({
          meta: persistedCookieMeta(DEFAULT_COOKIE_META),
          rows: DEFAULT_COOKIE_ROWS.map(persistedCookieRow),
        });
        return;
      }
      throw err;
    }
  });

  router.patch('/', requireSettingsWrite, async (req: AuthedRequest, res) => {
    const parsed = parseMetaWrite(req.body);
    if (!parsed.ok) {
      res.status(400).json({ error: parsed.error });
      return;
    }
    const meta = await cookies.upsertMeta(parsed.meta);
    res.json({ meta: persistedCookieMeta(meta) });
  });

  router.post('/rows', requireSettingsWrite, async (req: AuthedRequest, res) => {
    const parsed = parseRowWrite(req.body, false);
    if (!parsed.ok) {
      res.status(400).json({ error: parsed.error });
      return;
    }
    const body = asRowWrite(parsed.patch);
    if (!body) {
      res.status(400).json({ error: 'Invalid body' });
      return;
    }
    const existing = await cookies.findRowByStorageKey(body.storageKey);
    if (existing) {
      res.status(400).json({ error: 'storageKey already in use' });
      return;
    }
    const created = await cookies.createRow(body);
    res.status(201).json({ item: persistedCookieRow(created) });
  });

  router.patch('/rows/:id', requireSettingsWrite, async (req: AuthedRequest, res) => {
    if (hasOwn((req.body as object) ?? {}, 'storageKey')) {
      res.status(400).json({ error: 'storageKey cannot be changed' });
      return;
    }
    const parsed = parseRowWrite(req.body, true);
    if (!parsed.ok) {
      res.status(400).json({ error: parsed.error });
      return;
    }
    const updated = await cookies.updateRow(String(req.params.id), parsed.patch);
    if (!updated) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    res.json({ item: persistedCookieRow(updated) });
  });

  router.delete('/rows/:id', requireSettingsWrite, async (req: AuthedRequest, res) => {
    const ok = await cookies.deleteRow(String(req.params.id));
    if (!ok) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    res.json({ ok: true });
  });

  app.use('/api/cookies', router);
}
