import type { Express, NextFunction, Response } from 'express';
import { Router } from 'express';
import { canWriteSettings } from '../auth/rbac.js';
import { createRequireStaff, type AuthedRequest } from '../auth/requireStaff.js';
import type { StaffStore } from '../auth/staffStore.js';
import { hasOwn, readBilingual } from '../catalog/parse.js';
import {
  persistedMember,
  publicMeta,
  type AboutTeamMemberPatch,
  type AboutTeamMemberWrite,
  type AboutTeamMetaRecord,
  type AboutTeamStore,
  type BilingualText,
} from './aboutTeamStore.js';

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

function readStandInVisible(value: unknown): boolean | null {
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

function parseMemberWrite(
  body: unknown,
  partial: boolean,
): { ok: true; patch: AboutTeamMemberPatch } | { ok: false; error: string } {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { ok: false, error: 'Invalid body' };
  }
  const row = body as Record<string, unknown>;
  const patch: AboutTeamMemberPatch = {};

  if (!partial || hasOwn(row, 'name')) {
    const name = readRequiredBilingual(row.name, 'name');
    if (!name.ok) return name;
    patch.name = name.value;
  }
  if (!partial || hasOwn(row, 'role')) {
    const role = readRequiredBilingual(row.role, 'role');
    if (!role.ok) return role;
    patch.role = role.value;
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

function asMemberWrite(patch: AboutTeamMemberPatch): AboutTeamMemberWrite | null {
  if (!patch.name || !patch.role || patch.sortOrder == null || patch.published == null) {
    return null;
  }
  return {
    name: patch.name,
    role: patch.role,
    photoUrl: patch.photoUrl || undefined,
    sortOrder: patch.sortOrder,
    published: patch.published,
  };
}

function parseMetaWrite(
  body: unknown,
): { ok: true; meta: AboutTeamMetaRecord } | { ok: false; error: string } {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { ok: false, error: 'Invalid body' };
  }
  const row = body as Record<string, unknown>;
  const deck = readRequiredBilingual(row.deck, 'deck');
  if (!deck.ok) return deck;
  const standInNote = readRequiredBilingual(row.standInNote, 'standInNote');
  if (!standInNote.ok) return standInNote;
  const standInVisible = readStandInVisible(row.standInVisible);
  if (standInVisible == null) return { ok: false, error: 'standInVisible must be a boolean' };
  return {
    ok: true,
    meta: {
      deck: deck.value,
      standInNote: standInNote.value,
      standInVisible,
    },
  };
}

export function mountAboutTeamRoutes(app: Express, staff: StaffStore, team: AboutTeamStore) {
  const requireStaff = createRequireStaff(staff);
  const router = Router();
  router.use(requireStaff);

  router.get('/', async (_req, res) => {
    const members = await team.list();
    res.json({ members: members.map(persistedMember) });
  });

  router.post('/', requireSettingsWrite, async (req: AuthedRequest, res) => {
    const parsed = parseMemberWrite(req.body, false);
    if (!parsed.ok) {
      res.status(400).json({ error: parsed.error });
      return;
    }
    const body = asMemberWrite(parsed.patch);
    if (!body) {
      res.status(400).json({ error: 'Invalid body' });
      return;
    }
    const created = await team.create(body);
    res.status(201).json({ member: persistedMember(created) });
  });

  router.get('/meta', async (_req, res) => {
    const meta = await team.getMeta();
    res.json({ meta: publicMeta(meta) });
  });

  router.patch('/meta', requireSettingsWrite, async (req: AuthedRequest, res) => {
    const parsed = parseMetaWrite(req.body);
    if (!parsed.ok) {
      res.status(400).json({ error: parsed.error });
      return;
    }
    const meta = await team.upsertMeta(parsed.meta);
    res.json({ meta: publicMeta(meta) });
  });

  router.patch('/:id', requireSettingsWrite, async (req: AuthedRequest, res) => {
    const parsed = parseMemberWrite(req.body, true);
    if (!parsed.ok) {
      res.status(400).json({ error: parsed.error });
      return;
    }
    const current = await team.findById(String(req.params.id));
    if (!current) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    const updated = await team.update(String(req.params.id), parsed.patch);
    if (!updated) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    res.json({ member: persistedMember(updated) });
  });

  router.delete('/:id', requireSettingsWrite, async (req: AuthedRequest, res) => {
    const ok = await team.delete(String(req.params.id));
    if (!ok) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    res.json({ ok: true });
  });

  app.use('/api/about/team', router);
}
