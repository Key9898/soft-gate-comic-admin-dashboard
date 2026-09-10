import type { Express, NextFunction, Response } from 'express';
import { Router } from 'express';
import { canWriteSettings } from '../auth/rbac.js';
import { createRequireStaff, type AuthedRequest } from '../auth/requireStaff.js';
import type { StaffStore } from '../auth/staffStore.js';
import { hasOwn, readBilingual } from '../catalog/parse.js';
import {
  PhotoNotFirstError,
  persistedHistory,
  type AboutHistoryPatch,
  type AboutHistoryStore,
  type AboutHistoryWrite,
  type BilingualText,
} from './aboutHistoryStore.js';
import { isMissingTableError } from '../prismaMissingTable.js';

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

function readYear(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 1000 || value > 9999) {
    return null;
  }
  return value;
}

function readMonth(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 1 || value > 12) {
    return null;
  }
  return value;
}

function readSortOrder(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 0) return null;
  return value;
}

function readPublished(value: unknown): boolean | null {
  if (typeof value !== 'boolean') return null;
  return value;
}

function readPhotoUrl(
  value: unknown,
): { ok: true; photoUrl?: string } | { ok: false; error: string } {
  if (value === undefined || value === null || value === '') return { ok: true };
  if (typeof value !== 'string') return { ok: false, error: 'photoUrl must be a string' };
  const photoUrl = value.trim();
  if (!photoUrl) return { ok: true };
  if (photoUrl.startsWith('blob:')) return { ok: false, error: 'photoUrl cannot be a blob URL' };
  return { ok: true, photoUrl };
}

function parseWrite(
  body: unknown,
  partial: boolean,
): { ok: true; patch: AboutHistoryPatch } | { ok: false; error: string } {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { ok: false, error: 'Invalid body' };
  }
  const row = body as Record<string, unknown>;
  const patch: AboutHistoryPatch = {};

  if (!partial || hasOwn(row, 'year')) {
    const year = readYear(row.year);
    if (year == null) return { ok: false, error: 'year must be an integer' };
    patch.year = year;
  }
  if (!partial || hasOwn(row, 'month')) {
    const month = readMonth(row.month);
    if (month == null) return { ok: false, error: 'month must be an integer from 1 to 12' };
    patch.month = month;
  }
  if (!partial || hasOwn(row, 'title')) {
    const title = readRequiredBilingual(row.title, 'title');
    if (!title.ok) return title;
    patch.title = title.value;
  }
  if (!partial || hasOwn(row, 'description')) {
    const description = readRequiredBilingual(row.description, 'description');
    if (!description.ok) return description;
    patch.description = description.value;
  }
  if (hasOwn(row, 'sortOrder') || !partial) {
    if (!hasOwn(row, 'sortOrder') && !partial) {
      patch.sortOrder = 0;
    } else {
      const sortOrder = readSortOrder(row.sortOrder);
      if (sortOrder == null) {
        return { ok: false, error: 'sortOrder must be an integer of 0 or more' };
      }
      patch.sortOrder = sortOrder;
    }
  }
  if (hasOwn(row, 'published') || !partial) {
    if (!hasOwn(row, 'published') && !partial) {
      patch.published = true;
    } else {
      const published = readPublished(row.published);
      if (published == null) return { ok: false, error: 'published must be a boolean' };
      patch.published = published;
    }
  }
  if (hasOwn(row, 'photoUrl') || !partial) {
    if (!hasOwn(row, 'photoUrl') && !partial) {
      patch.photoUrl = undefined;
    } else {
      const photo = readPhotoUrl(row.photoUrl);
      if (!photo.ok) return photo;
      patch.photoUrl = photo.photoUrl ?? '';
    }
  }

  return { ok: true, patch };
}

function asWrite(patch: AboutHistoryPatch): AboutHistoryWrite | null {
  if (
    patch.year == null ||
    patch.month == null ||
    !patch.title ||
    !patch.description ||
    patch.sortOrder == null ||
    patch.published == null
  ) {
    return null;
  }
  return {
    year: patch.year,
    month: patch.month,
    title: patch.title,
    description: patch.description,
    photoUrl: patch.photoUrl || undefined,
    sortOrder: patch.sortOrder,
    published: patch.published,
  };
}

export function mountAboutHistoryRoutes(
  app: Express,
  staff: StaffStore,
  histories: AboutHistoryStore,
) {
  const requireStaff = createRequireStaff(staff);
  const router = Router();
  router.use(requireStaff);

  router.get('/', async (_req, res) => {
    try {
      const list = await histories.list();
      res.json({ histories: list.map(persistedHistory) });
    } catch (err) {
      if (isMissingTableError(err)) {
        res.json({ histories: [] });
        return;
      }
      throw err;
    }
  });

  router.post('/', requireSettingsWrite, async (req: AuthedRequest, res) => {
    const parsed = parseWrite(req.body, false);
    if (!parsed.ok) {
      res.status(400).json({ error: parsed.error });
      return;
    }
    const body = asWrite(parsed.patch);
    if (!body) {
      res.status(400).json({ error: 'Invalid body' });
      return;
    }
    try {
      const created = await histories.create(body);
      res.status(201).json({ history: persistedHistory(created) });
    } catch (err) {
      if (err instanceof PhotoNotFirstError) {
        res.status(400).json({ error: err.message });
        return;
      }
      throw err;
    }
  });

  router.patch('/:id', requireSettingsWrite, async (req: AuthedRequest, res) => {
    const parsed = parseWrite(req.body, true);
    if (!parsed.ok) {
      res.status(400).json({ error: parsed.error });
      return;
    }
    const current = await histories.findById(String(req.params.id));
    if (!current) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    try {
      const updated = await histories.update(String(req.params.id), parsed.patch);
      if (!updated) {
        res.status(404).json({ error: 'Not found' });
        return;
      }
      res.json({ history: persistedHistory(updated) });
    } catch (err) {
      if (err instanceof PhotoNotFirstError) {
        res.status(400).json({ error: err.message });
        return;
      }
      throw err;
    }
  });

  router.delete('/:id', requireSettingsWrite, async (req: AuthedRequest, res) => {
    const ok = await histories.delete(String(req.params.id));
    if (!ok) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    res.json({ ok: true });
  });

  app.use('/api/about/history', router);
}
