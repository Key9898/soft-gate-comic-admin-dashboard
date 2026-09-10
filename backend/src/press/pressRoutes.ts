import type { Express, NextFunction, Response } from 'express';
import { Router } from 'express';
import { canWriteSettings } from '../auth/rbac.js';
import { createRequireStaff, type AuthedRequest } from '../auth/requireStaff.js';
import type { StaffStore } from '../auth/staffStore.js';
import { hasOwn, readBilingual } from '../catalog/parse.js';
import { isMissingTableError } from '../prismaMissingTable.js';
import {
  DEFAULT_PRESS_META,
  PRESS_COPY_KEYS,
  PRESS_FACT_KEYS,
  persistedMeta,
  persistedNews,
  persistedStill,
  type BilingualText,
  type PressAsset,
  type PressCopy,
  type PressFact,
  type PressFactKey,
  type PressMetaRecord,
  type PressNewsPatch,
  type PressNewsWrite,
  type PressPaletteSwatch,
  type PressStillPatch,
  type PressStillWrite,
  type PressStore,
} from './pressStore.js';

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

function readSortOrder(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 0) return null;
  return value;
}

function readPublished(value: unknown): boolean | null {
  if (typeof value !== 'boolean') return null;
  return value;
}

function readDurableUrl(
  value: unknown,
  label: string,
): { ok: true; value?: string } | { ok: false; error: string } {
  if (value === undefined || value === null || value === '') return { ok: true };
  if (typeof value !== 'string') return { ok: false, error: `${label} must be a string` };
  const next = value.trim();
  if (!next) return { ok: true };
  if (next.startsWith('blob:')) return { ok: false, error: `${label} cannot be a blob URL` };
  return { ok: true, value: next };
}

function readRequiredUrl(
  value: unknown,
  label: string,
): { ok: true; value: string } | { ok: false; error: string } {
  const parsed = readDurableUrl(value, label);
  if (!parsed.ok) return parsed;
  if (!parsed.value) return { ok: false, error: `${label} is required` };
  return { ok: true, value: parsed.value };
}

function readCopy(value: unknown): { ok: true; value: PressCopy } | { ok: false; error: string } {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return { ok: false, error: 'copy must be an object' };
  }
  const row = value as Record<string, unknown>;
  const next = {} as PressCopy;
  for (const key of PRESS_COPY_KEYS) {
    const parsed = readRequiredBilingual(row[key], `copy.${key}`);
    if (!parsed.ok) return parsed;
    next[key] = parsed.value;
  }
  return { ok: true, value: next };
}

function readFacts(
  value: unknown,
): { ok: true; value: Record<PressFactKey, PressFact> } | { ok: false; error: string } {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return { ok: false, error: 'facts must be an object' };
  }
  const row = value as Record<string, unknown>;
  const next = {} as Record<PressFactKey, PressFact>;
  for (const key of PRESS_FACT_KEYS) {
    const raw = row[key];
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
      return { ok: false, error: `facts.${key} must include label and value` };
    }
    const item = raw as { label?: unknown; value?: unknown; href?: unknown };
    const label = readRequiredBilingual(item.label, `facts.${key}.label`);
    if (!label.ok) return label;
    const factValue = readRequiredBilingual(item.value, `facts.${key}.value`);
    if (!factValue.ok) return factValue;
    const fact: PressFact = { label: label.value, value: factValue.value };
    if (item.href !== undefined && item.href !== null && item.href !== '') {
      const href = readRequiredUrl(item.href, `facts.${key}.href`);
      if (!href.ok) return href;
      fact.href = href.value;
    }
    next[key] = fact;
  }
  return { ok: true, value: next };
}

const HEX = /^#[0-9a-fA-F]{6}$/;

function readPalette(
  value: unknown,
): { ok: true; value: PressPaletteSwatch[] } | { ok: false; error: string } {
  if (!Array.isArray(value) || value.length === 0) {
    return { ok: false, error: 'palette must be a non-empty array' };
  }
  const next: PressPaletteSwatch[] = [];
  for (const [index, item] of value.entries()) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      return { ok: false, error: `palette[${index}] must be an object` };
    }
    const row = item as { hex?: unknown; label?: unknown };
    if (typeof row.hex !== 'string' || !HEX.test(row.hex.trim())) {
      return { ok: false, error: `palette[${index}].hex must be a #RRGGBB color` };
    }
    const label = readRequiredBilingual(row.label, `palette[${index}].label`);
    if (!label.ok) return label;
    next.push({ hex: row.hex.trim().toLowerCase(), label: label.value });
  }
  return { ok: true, value: next };
}

function readAssets(
  value: unknown,
): { ok: true; value: PressAsset[] } | { ok: false; error: string } {
  if (!Array.isArray(value) || value.length === 0) {
    return { ok: false, error: 'assets must be a non-empty array' };
  }
  const next: PressAsset[] = [];
  for (const [index, item] of value.entries()) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      return { ok: false, error: `assets[${index}] must be an object` };
    }
    const row = item as { name?: unknown; url?: unknown; format?: unknown };
    const name = readRequiredBilingual(row.name, `assets[${index}].name`);
    if (!name.ok) return name;
    const url = readRequiredUrl(row.url, `assets[${index}].url`);
    if (!url.ok) return url;
    if (typeof row.format !== 'string' || !row.format.trim()) {
      return { ok: false, error: `assets[${index}].format is required` };
    }
    next.push({ name: name.value, url: url.value, format: row.format.trim() });
  }
  return { ok: true, value: next };
}

function readEmail(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const email = value.trim();
  if (!email || !email.includes('@')) return null;
  return email;
}

function readSpokesperson(
  value: unknown,
): { ok: true; value?: string } | { ok: false; error: string } {
  if (value === undefined || value === null || value === '') return { ok: true };
  if (typeof value !== 'string') {
    return { ok: false, error: 'spokespersonMemberId must be a string' };
  }
  const id = value.trim();
  if (!id) return { ok: true };
  return { ok: true, value: id };
}

function parseMetaWrite(
  body: unknown,
): { ok: true; meta: PressMetaRecord } | { ok: false; error: string } {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { ok: false, error: 'Invalid body' };
  }
  const row = body as Record<string, unknown>;
  const copy = readCopy(row.copy);
  if (!copy.ok) return copy;
  const zipUrl = readRequiredUrl(row.zipUrl, 'zipUrl');
  if (!zipUrl.ok) return zipUrl;
  const contactEmail = readEmail(row.contactEmail);
  if (!contactEmail) return { ok: false, error: 'contactEmail must be an email' };
  const facts = readFacts(row.facts);
  if (!facts.ok) return facts;
  const palette = readPalette(row.palette);
  if (!palette.ok) return palette;
  const assets = readAssets(row.assets);
  if (!assets.ok) return assets;
  const spokesperson = readSpokesperson(row.spokespersonMemberId);
  if (!spokesperson.ok) return spokesperson;
  return {
    ok: true,
    meta: persistedMeta({
      copy: copy.value,
      zipUrl: zipUrl.value,
      contactEmail,
      facts: facts.value,
      palette: palette.value,
      assets: assets.value,
      spokespersonMemberId: spokesperson.value,
    }),
  };
}

function parseNewsWrite(
  body: unknown,
  partial: boolean,
): { ok: true; patch: PressNewsPatch } | { ok: false; error: string } {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { ok: false, error: 'Invalid body' };
  }
  const row = body as Record<string, unknown>;
  const patch: PressNewsPatch = {};
  if (!partial || hasOwn(row, 'title')) {
    const title = readRequiredBilingual(row.title, 'title');
    if (!title.ok) return title;
    patch.title = title.value;
  }
  if (!partial || hasOwn(row, 'body')) {
    const newsBody = readRequiredBilingual(row.body, 'body');
    if (!newsBody.ok) return newsBody;
    patch.body = newsBody.value;
  }
  if (hasOwn(row, 'href') || !partial) {
    if (!hasOwn(row, 'href') && !partial) {
      patch.href = undefined;
    } else {
      const href = readDurableUrl(row.href, 'href');
      if (!href.ok) return href;
      patch.href = href.value ?? '';
    }
  }
  if (hasOwn(row, 'sortOrder') || !partial) {
    if (!hasOwn(row, 'sortOrder') && !partial) {
      patch.sortOrder = 0;
    } else {
      const sortOrder = readSortOrder(row.sortOrder);
      if (sortOrder == null)
        return { ok: false, error: 'sortOrder must be an integer of 0 or more' };
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
  if (hasOwn(row, 'demoBadge') || !partial) {
    if (!hasOwn(row, 'demoBadge') && !partial) {
      patch.demoBadge = false;
    } else {
      const demoBadge = readPublished(row.demoBadge);
      if (demoBadge == null) return { ok: false, error: 'demoBadge must be a boolean' };
      patch.demoBadge = demoBadge;
    }
  }
  return { ok: true, patch };
}

function asNewsWrite(patch: PressNewsPatch): PressNewsWrite | null {
  if (
    !patch.title ||
    !patch.body ||
    patch.sortOrder == null ||
    patch.published == null ||
    patch.demoBadge == null
  ) {
    return null;
  }
  return {
    title: patch.title,
    body: patch.body,
    href: patch.href || undefined,
    sortOrder: patch.sortOrder,
    published: patch.published,
    demoBadge: patch.demoBadge,
  };
}

function parseStillWrite(
  body: unknown,
  partial: boolean,
): { ok: true; patch: PressStillPatch } | { ok: false; error: string } {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { ok: false, error: 'Invalid body' };
  }
  const row = body as Record<string, unknown>;
  const patch: PressStillPatch = {};
  if (!partial || hasOwn(row, 'title')) {
    const title = readRequiredBilingual(row.title, 'title');
    if (!title.ok) return title;
    patch.title = title.value;
  }
  if (!partial || hasOwn(row, 'imageUrl')) {
    const imageUrl = readRequiredUrl(row.imageUrl, 'imageUrl');
    if (!imageUrl.ok) return imageUrl;
    patch.imageUrl = imageUrl.value;
  }
  if (hasOwn(row, 'sortOrder') || !partial) {
    if (!hasOwn(row, 'sortOrder') && !partial) {
      patch.sortOrder = 0;
    } else {
      const sortOrder = readSortOrder(row.sortOrder);
      if (sortOrder == null)
        return { ok: false, error: 'sortOrder must be an integer of 0 or more' };
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
  if (hasOwn(row, 'demoBadge') || !partial) {
    if (!hasOwn(row, 'demoBadge') && !partial) {
      patch.demoBadge = false;
    } else {
      const demoBadge = readPublished(row.demoBadge);
      if (demoBadge == null) return { ok: false, error: 'demoBadge must be a boolean' };
      patch.demoBadge = demoBadge;
    }
  }
  return { ok: true, patch };
}

function asStillWrite(patch: PressStillPatch): PressStillWrite | null {
  if (
    !patch.title ||
    !patch.imageUrl ||
    patch.sortOrder == null ||
    patch.published == null ||
    patch.demoBadge == null
  ) {
    return null;
  }
  return {
    title: patch.title,
    imageUrl: patch.imageUrl,
    sortOrder: patch.sortOrder,
    published: patch.published,
    demoBadge: patch.demoBadge,
  };
}

export function mountPressRoutes(app: Express, staff: StaffStore, press: PressStore) {
  const requireStaff = createRequireStaff(staff);
  const router = Router();
  router.use(requireStaff);

  router.get('/', async (_req, res) => {
    try {
      const meta = await press.getMeta();
      res.json({ meta: persistedMeta(meta) });
    } catch (err) {
      if (isMissingTableError(err)) {
        res.json({ meta: persistedMeta(DEFAULT_PRESS_META) });
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
    const meta = await press.upsertMeta(parsed.meta);
    res.json({ meta: persistedMeta(meta) });
  });

  router.get('/news', async (_req, res) => {
    try {
      const list = await press.listNews();
      res.json({ news: list.map(persistedNews) });
    } catch (err) {
      if (isMissingTableError(err)) {
        res.json({ news: [] });
        return;
      }
      throw err;
    }
  });

  router.post('/news', requireSettingsWrite, async (req: AuthedRequest, res) => {
    const parsed = parseNewsWrite(req.body, false);
    if (!parsed.ok) {
      res.status(400).json({ error: parsed.error });
      return;
    }
    const body = asNewsWrite(parsed.patch);
    if (!body) {
      res.status(400).json({ error: 'Invalid body' });
      return;
    }
    const created = await press.createNews(body);
    res.status(201).json({ item: persistedNews(created) });
  });

  router.patch('/news/:id', requireSettingsWrite, async (req: AuthedRequest, res) => {
    const parsed = parseNewsWrite(req.body, true);
    if (!parsed.ok) {
      res.status(400).json({ error: parsed.error });
      return;
    }
    const current = await press.findNewsById(String(req.params.id));
    if (!current) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    const updated = await press.updateNews(String(req.params.id), parsed.patch);
    if (!updated) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    res.json({ item: persistedNews(updated) });
  });

  router.delete('/news/:id', requireSettingsWrite, async (req: AuthedRequest, res) => {
    const ok = await press.deleteNews(String(req.params.id));
    if (!ok) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    res.json({ ok: true });
  });

  router.get('/stills', async (_req, res) => {
    try {
      const list = await press.listStills();
      res.json({ stills: list.map(persistedStill) });
    } catch (err) {
      if (isMissingTableError(err)) {
        res.json({ stills: [] });
        return;
      }
      throw err;
    }
  });

  router.post('/stills', requireSettingsWrite, async (req: AuthedRequest, res) => {
    const parsed = parseStillWrite(req.body, false);
    if (!parsed.ok) {
      res.status(400).json({ error: parsed.error });
      return;
    }
    const body = asStillWrite(parsed.patch);
    if (!body) {
      res.status(400).json({ error: 'Invalid body' });
      return;
    }
    const created = await press.createStill(body);
    res.status(201).json({ item: persistedStill(created) });
  });

  router.patch('/stills/:id', requireSettingsWrite, async (req: AuthedRequest, res) => {
    const parsed = parseStillWrite(req.body, true);
    if (!parsed.ok) {
      res.status(400).json({ error: parsed.error });
      return;
    }
    const current = await press.findStillById(String(req.params.id));
    if (!current) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    const updated = await press.updateStill(String(req.params.id), parsed.patch);
    if (!updated) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    res.json({ item: persistedStill(updated) });
  });

  router.delete('/stills/:id', requireSettingsWrite, async (req: AuthedRequest, res) => {
    const ok = await press.deleteStill(String(req.params.id));
    if (!ok) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    res.json({ ok: true });
  });

  app.use('/api/press', router);
}
