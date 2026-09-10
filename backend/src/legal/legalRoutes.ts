import type { Express, NextFunction, Response } from 'express';
import { Router } from 'express';
import { canWriteSettings } from '../auth/rbac.js';
import { createRequireStaff, type AuthedRequest } from '../auth/requireStaff.js';
import type { StaffStore } from '../auth/staffStore.js';
import { hasOwn, readBilingual } from '../catalog/parse.js';
import { isMissingTableError } from '../prismaMissingTable.js';
import {
  LEGAL_HEADING_LEVELS,
  LEGAL_SLUG_RE,
  RESERVED_LEGAL_SLUGS,
  allowedKindsFor,
  defaultMetaFor,
  persistedMeta,
  persistedSection,
  seedSectionsFor,
  type BilingualText,
  type LegalDoc,
  type LegalHeadingLevel,
  type LegalMetaRecord,
  type LegalSectionKind,
  type LegalSectionPatch,
  type LegalSectionWrite,
  type LegalStore,
} from './legalStore.js';

function requireSettingsWrite(req: AuthedRequest, res: Response, next: NextFunction) {
  if (!canWriteSettings(req.staff?.role)) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }
  next();
}

const UNSAFE = /<[a-zA-Z/!?]|blob:/i;

function rejectUnsafe(text: string, label: string): string | null {
  if (UNSAFE.test(text)) return `${label} cannot include HTML or blob URLs`;
  return null;
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
  const unsafeEn = rejectUnsafe(en, `${label}.en`);
  if (unsafeEn) return { ok: false, error: unsafeEn };
  const unsafeMm = rejectUnsafe(mm, `${label}.mm`);
  if (unsafeMm) return { ok: false, error: unsafeMm };
  return { ok: true, value: { en, mm } };
}

function readOptionalBilingual(
  value: unknown,
  label: string,
): { ok: true; value: BilingualText } | { ok: false; error: string } {
  if (value === undefined || value === null) return { ok: true, value: { en: '', mm: '' } };
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return { ok: false, error: `${label} must include en and mm` };
  }
  const row = value as { en?: unknown; mm?: unknown };
  const en = typeof row.en === 'string' ? row.en.trim() : '';
  const mm = typeof row.mm === 'string' ? row.mm.trim() : '';
  if ((en && !mm) || (!en && mm)) return { ok: false, error: `${label} must include en and mm` };
  const unsafeEn = rejectUnsafe(en, `${label}.en`);
  if (unsafeEn) return { ok: false, error: unsafeEn };
  const unsafeMm = rejectUnsafe(mm, `${label}.mm`);
  if (unsafeMm) return { ok: false, error: unsafeMm };
  return { ok: true, value: { en, mm } };
}

function readGlance(
  value: unknown,
): { ok: true; value: BilingualText[] } | { ok: false; error: string } {
  if (!Array.isArray(value) || value.length === 0) {
    return { ok: false, error: 'glance must be a non-empty array' };
  }
  const next: BilingualText[] = [];
  for (const [index, item] of value.entries()) {
    const parsed = readRequiredBilingual(item, `glance[${index}]`);
    if (!parsed.ok) return parsed;
    next.push(parsed.value);
  }
  return { ok: true, value: next };
}

function readEffectiveDate(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const next = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(next)) return null;
  const ms = Date.parse(`${next}T12:00:00.000Z`);
  if (Number.isNaN(ms)) return null;
  return next;
}

function parseMetaWrite(
  body: unknown,
): { ok: true; meta: LegalMetaRecord } | { ok: false; error: string } {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { ok: false, error: 'Invalid body' };
  }
  const row = body as Record<string, unknown>;
  const seoDesc = readRequiredBilingual(row.seoDesc, 'seoDesc');
  if (!seoDesc.ok) return seoDesc;
  const glance = readGlance(row.glance);
  if (!glance.ok) return glance;
  const effectiveDate = readEffectiveDate(row.effectiveDate);
  if (!effectiveDate) return { ok: false, error: 'effectiveDate must be YYYY-MM-DD' };
  return {
    ok: true,
    meta: persistedMeta({
      seoDesc: seoDesc.value,
      glance: glance.value,
      effectiveDate,
    }),
  };
}

function readSlug(value: unknown): { ok: true; value: string } | { ok: false; error: string } {
  if (typeof value !== 'string') return { ok: false, error: 'slug is required' };
  const slug = value.trim();
  if (!LEGAL_SLUG_RE.test(slug)) {
    return { ok: false, error: 'slug must be lowercase letters, numbers, and hyphens' };
  }
  if ((RESERVED_LEGAL_SLUGS as readonly string[]).includes(slug)) {
    return { ok: false, error: 'slug is reserved' };
  }
  return { ok: true, value: slug };
}

function readKind(
  value: unknown,
  allowed: readonly LegalSectionKind[],
): { ok: true; value: LegalSectionKind } | { ok: false; error: string } {
  if (typeof value !== 'string' || !allowed.includes(value as LegalSectionKind)) {
    return { ok: false, error: `kind must be ${allowed.join(', ')}` };
  }
  return { ok: true, value: value as LegalSectionKind };
}

function readHeading(
  value: unknown,
): { ok: true; value: LegalHeadingLevel } | { ok: false; error: string } {
  if (typeof value !== 'string' || !LEGAL_HEADING_LEVELS.includes(value as LegalHeadingLevel)) {
    return { ok: false, error: 'headingLevel must be h2 or h3' };
  }
  return { ok: true, value: value as LegalHeadingLevel };
}

function readSortOrder(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 0) return null;
  return value;
}

function readPublished(value: unknown): boolean | null {
  if (typeof value !== 'boolean') return null;
  return value;
}

function readBullets(
  value: unknown,
  kind: LegalSectionKind,
): { ok: true; value: BilingualText[] } | { ok: false; error: string } {
  if (value === undefined || value === null) {
    if (kind === 'body') return { ok: true, value: [] };
    return { ok: false, error: 'bullets must be a non-empty array' };
  }
  if (!Array.isArray(value)) return { ok: false, error: 'bullets must be an array' };
  if (kind === 'body') {
    if (value.length === 0) return { ok: true, value: [] };
    return { ok: false, error: 'body sections cannot include bullets' };
  }
  if (value.length === 0) return { ok: false, error: 'bullets must be a non-empty array' };
  if (kind === 'privacy-rights' && value.length < 4) {
    return { ok: false, error: 'privacy-rights needs at least 4 bilingual labels' };
  }
  const next: BilingualText[] = [];
  for (const [index, item] of value.entries()) {
    const parsed = readRequiredBilingual(item, `bullets[${index}]`);
    if (!parsed.ok) return parsed;
    next.push(parsed.value);
  }
  return { ok: true, value: next };
}

function parseSectionWrite(
  body: unknown,
  partial: boolean,
  allowed: readonly LegalSectionKind[],
): { ok: true; patch: LegalSectionPatch } | { ok: false; error: string } {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { ok: false, error: 'Invalid body' };
  }
  const row = body as Record<string, unknown>;
  const patch: LegalSectionPatch = {};

  if (!partial || hasOwn(row, 'slug')) {
    const slug = readSlug(row.slug);
    if (!slug.ok) return slug;
    patch.slug = slug.value;
  }
  if (!partial || hasOwn(row, 'kind')) {
    const kind = readKind(row.kind, allowed);
    if (!kind.ok) return kind;
    patch.kind = kind.value;
  }
  if (!partial || hasOwn(row, 'headingLevel')) {
    const heading = readHeading(row.headingLevel);
    if (!heading.ok) return heading;
    patch.headingLevel = heading.value;
  }
  if (!partial || hasOwn(row, 'title')) {
    const title = readRequiredBilingual(row.title, 'title');
    if (!title.ok) return title;
    patch.title = title.value;
  }
  if (!partial || hasOwn(row, 'body')) {
    const kind = patch.kind;
    const parsed =
      kind === 'bullets'
        ? readOptionalBilingual(row.body, 'body')
        : readRequiredBilingual(row.body, 'body');
    if (!parsed.ok) return parsed;
    patch.body = parsed.value;
  }
  if (!partial || hasOwn(row, 'bullets') || hasOwn(row, 'kind')) {
    const kind = patch.kind;
    if (!kind && !partial) return { ok: false, error: 'kind is required' };
    if (kind) {
      const bullets = readBullets(hasOwn(row, 'bullets') ? row.bullets : undefined, kind);
      if (!bullets.ok) return bullets;
      patch.bullets = bullets.value;
    }
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
  return { ok: true, patch };
}

function asSectionWrite(patch: LegalSectionPatch): LegalSectionWrite | null {
  if (
    !patch.slug ||
    !patch.kind ||
    !patch.headingLevel ||
    !patch.title ||
    !patch.body ||
    !patch.bullets ||
    patch.sortOrder == null ||
    patch.published == null
  ) {
    return null;
  }
  return {
    slug: patch.slug,
    kind: patch.kind,
    headingLevel: patch.headingLevel,
    title: patch.title,
    body: patch.body,
    bullets: patch.bullets,
    sortOrder: patch.sortOrder,
    published: patch.published,
  };
}

function mountDoc(router: Router, legal: LegalStore, doc: LegalDoc) {
  const allowed = allowedKindsFor(doc);
  const prefix = `/${doc}`;

  router.get(prefix, async (_req, res) => {
    try {
      const meta = await legal.getMeta(doc);
      res.json({ meta: persistedMeta(meta) });
    } catch (err) {
      if (isMissingTableError(err)) {
        res.json({ meta: persistedMeta(defaultMetaFor(doc)) });
        return;
      }
      throw err;
    }
  });

  router.patch(prefix, requireSettingsWrite, async (req: AuthedRequest, res) => {
    const parsed = parseMetaWrite(req.body);
    if (!parsed.ok) {
      res.status(400).json({ error: parsed.error });
      return;
    }
    const meta = await legal.upsertMeta(doc, parsed.meta);
    res.json({ meta: persistedMeta(meta) });
  });

  router.get(`${prefix}/sections`, async (_req, res) => {
    try {
      const list = await legal.listSections(doc);
      res.json({ sections: list.map(persistedSection) });
    } catch (err) {
      if (isMissingTableError(err)) {
        res.json({ sections: seedSectionsFor(doc).map(persistedSection) });
        return;
      }
      throw err;
    }
  });

  router.post(`${prefix}/sections`, requireSettingsWrite, async (req: AuthedRequest, res) => {
    const parsed = parseSectionWrite(req.body, false, allowed);
    if (!parsed.ok) {
      res.status(400).json({ error: parsed.error });
      return;
    }
    const body = asSectionWrite(parsed.patch);
    if (!body) {
      res.status(400).json({ error: 'Invalid body' });
      return;
    }
    const existing = await legal.listSections(doc);
    if (existing.some((row) => row.slug === body.slug)) {
      res.status(400).json({ error: 'slug already exists' });
      return;
    }
    const created = await legal.createSection(doc, body);
    res.status(201).json({ item: persistedSection(created) });
  });

  router.patch(`${prefix}/sections/:id`, requireSettingsWrite, async (req: AuthedRequest, res) => {
    const parsed = parseSectionWrite(req.body, true, allowed);
    if (!parsed.ok) {
      res.status(400).json({ error: parsed.error });
      return;
    }
    const current = await legal.findSectionById(doc, String(req.params.id));
    if (!current) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    const nextKind = parsed.patch.kind ?? current.kind;
    if (!allowed.includes(nextKind)) {
      res.status(400).json({ error: `kind must be ${allowed.join(', ')}` });
      return;
    }
    if (parsed.patch.slug) {
      const existing = await legal.listSections(doc);
      if (existing.some((row) => row.slug === parsed.patch.slug && row.id !== current.id)) {
        res.status(400).json({ error: 'slug already exists' });
        return;
      }
    }
    const updated = await legal.updateSection(doc, String(req.params.id), parsed.patch);
    if (!updated) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    res.json({ item: persistedSection(updated) });
  });

  router.delete(`${prefix}/sections/:id`, requireSettingsWrite, async (req: AuthedRequest, res) => {
    const ok = await legal.deleteSection(doc, String(req.params.id));
    if (!ok) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    res.json({ ok: true });
  });
}

export function mountLegalRoutes(app: Express, staff: StaffStore, legal: LegalStore) {
  const requireStaff = createRequireStaff(staff);
  const router = Router();
  router.use(requireStaff);
  mountDoc(router, legal, 'privacy');
  mountDoc(router, legal, 'terms');
  app.use('/api/legal', router);
}
