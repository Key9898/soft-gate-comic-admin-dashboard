import type { Express, NextFunction, Response } from 'express';
import { Router } from 'express';
import { canWriteBusiness } from '../auth/rbac.js';
import { createRequireStaff, type AuthedRequest } from '../auth/requireStaff.js';
import type { StaffStore } from '../auth/staffStore.js';
import { readBilingual } from '../notifications/notificationStore.js';
import {
  isReaderBroadcastType,
  publicBroadcast,
  type ReaderBroadcastStore,
} from './broadcastStore.js';
import type { BroadcastAudience, WebsiteBroadcastClient } from './websiteBroadcastClient.js';

function requireBusinessWrite(req: AuthedRequest, res: Response, next: NextFunction) {
  if (!canWriteBusiness(req.staff?.role)) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }
  next();
}

function readHref(value: unknown): { ok: true; href?: string } | { ok: false; error: string } {
  if (value === undefined || value === null || value === '') return { ok: true };
  if (typeof value !== 'string') return { ok: false, error: 'href must be a portal path' };
  const href = value.trim();
  if (!href) return { ok: true };
  if (!href.startsWith('/') || href.startsWith('//')) {
    return { ok: false, error: 'href must be a portal path' };
  }
  return { ok: true, href };
}

function requiredBilingual(
  value: unknown,
  label: string,
): { ok: true; value: { en: string; mm: string } } | { ok: false; error: string } {
  const text = readBilingual(value);
  if (!text) return { ok: false, error: `${label} must include en and mm` };
  const en = text.en.trim();
  const mm = text.mm.trim();
  if (!en || !mm) return { ok: false, error: `${label} must include en and mm` };
  return { ok: true, value: { en, mm } };
}

function readAudience(
  value: unknown,
): { ok: true; audience: BroadcastAudience } | { ok: false; error: string } {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return { ok: false, error: 'audience is required' };
  }
  const row = value as Record<string, unknown>;
  if (row.all === true) {
    if (Array.isArray(row.userIds) && row.userIds.length > 0) {
      return { ok: false, error: 'audience cannot be all and selected' };
    }
    return { ok: true, audience: { all: true } };
  }
  if (!Array.isArray(row.userIds)) return { ok: false, error: 'audience is required' };
  const userIds = [
    ...new Set(
      row.userIds.filter((id): id is string => typeof id === 'string' && id.trim() !== ''),
    ),
  ];
  if (userIds.length < 1) return { ok: false, error: 'audience is required' };
  return { ok: true, audience: { userIds } };
}

function websiteErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error && err.message.trim()) return err.message;
  return fallback;
}

export function mountReaderBroadcastRoutes(
  app: Express,
  staff: StaffStore,
  broadcasts: ReaderBroadcastStore,
  website: WebsiteBroadcastClient,
) {
  const requireStaff = createRequireStaff(staff);
  const router = Router();
  router.use(requireStaff);

  router.get('/', async (_req, res) => {
    const list = await broadcasts.list();
    res.json({ broadcasts: list.map(publicBroadcast) });
  });

  router.get('/readers', requireBusinessWrite, async (req, res) => {
    if (!website.configured) {
      res.status(503).json({ error: 'Reader broadcast is not configured' });
      return;
    }
    const q = typeof req.query.q === 'string' ? req.query.q : '';
    try {
      const readers = await website.searchReaders(q);
      res.json({ readers });
    } catch (err) {
      res.status(502).json({ error: websiteErrorMessage(err, 'Could not search readers') });
    }
  });

  router.post('/preview', requireBusinessWrite, async (req, res) => {
    if (!website.configured) {
      res.status(503).json({ error: 'Reader broadcast is not configured' });
      return;
    }
    const parsed = readAudience(
      req.body && typeof req.body === 'object' && !Array.isArray(req.body)
        ? (req.body as { audience?: unknown }).audience
        : undefined,
    );
    if (!parsed.ok) {
      res.status(400).json({ error: parsed.error });
      return;
    }
    try {
      const preview = await website.preview(parsed.audience);
      res.json(preview);
    } catch (err) {
      res.status(502).json({ error: websiteErrorMessage(err, 'Could not preview audience') });
    }
  });

  router.post('/', requireBusinessWrite, async (req: AuthedRequest, res) => {
    if (!website.configured) {
      res.status(503).json({ error: 'Reader broadcast is not configured' });
      return;
    }
    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
      res.status(400).json({ error: 'Invalid body' });
      return;
    }
    const row = req.body as Record<string, unknown>;
    if (!isReaderBroadcastType(row.type)) {
      res.status(400).json({ error: 'type must be system or promotion' });
      return;
    }
    const title = requiredBilingual(row.title, 'title');
    if (!title.ok) {
      res.status(400).json({ error: title.error });
      return;
    }
    const message = requiredBilingual(row.message, 'message');
    if (!message.ok) {
      res.status(400).json({ error: message.error });
      return;
    }
    const href = readHref(row.href);
    if (!href.ok) {
      res.status(400).json({ error: href.error });
      return;
    }
    const audience = readAudience(row.audience);
    if (!audience.ok) {
      res.status(400).json({ error: audience.error });
      return;
    }
    const createdById = req.staff?.id;
    if (!createdById) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    let preview;
    try {
      preview = await website.preview(audience.audience);
    } catch (err) {
      res.status(502).json({ error: websiteErrorMessage(err, 'Could not preview audience') });
      return;
    }
    if (preview.readers < 1) {
      res.status(400).json({ error: 'This audience has no readers' });
      return;
    }

    const created = await broadcasts.createSending({
      type: row.type,
      title: title.value,
      message: message.value,
      href: href.href,
      audience: 'all' in audience.audience ? 'all' : 'selected',
      readerIds: 'userIds' in audience.audience ? audience.audience.userIds : [],
      createdById,
    });

    try {
      const sent = await website.send({
        campaignId: created.id,
        type: created.type,
        title: created.title,
        message: created.message,
        href: created.href,
        audience: audience.audience,
      });
      const updated = await broadcasts.markSent(created.id, {
        inboxCount: sent.inbox,
        emailed: sent.emailed,
        pushed: sent.pushed,
        skippedPref: sent.skippedPref,
      });
      res.status(201).json({ broadcast: publicBroadcast(updated ?? created) });
    } catch (err) {
      const reason = websiteErrorMessage(err, 'Could not send broadcast');
      const failed = await broadcasts.markFailed(created.id, reason);
      res.status(502).json({
        error: reason,
        broadcast: publicBroadcast(failed ?? created),
      });
    }
  });

  app.use('/api/reader-broadcasts', router);
}
