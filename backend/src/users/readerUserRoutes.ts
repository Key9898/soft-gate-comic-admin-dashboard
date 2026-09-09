import type { Express, NextFunction, Response } from 'express';
import { Router } from 'express';
import { canWriteCommunity } from '../auth/rbac.js';
import { createRequireStaff, type AuthedRequest } from '../auth/requireStaff.js';
import type { StaffStore } from '../auth/staffStore.js';
import {
  EmailTakenError,
  publicUser,
  type ReaderUserProfilePatch,
  type ReaderUserStore,
} from './readerUserStore.js';

function requireCommunityWrite(req: AuthedRequest, res: Response, next: NextFunction) {
  if (!canWriteCommunity(req.staff?.role)) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }
  next();
}

function readProfilePatch(
  body: unknown,
): { ok: true; patch: ReaderUserProfilePatch } | { ok: false; error: string } {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { ok: false, error: 'Invalid body' };
  }
  const raw = body as Record<string, unknown>;
  const patch: ReaderUserProfilePatch = {};
  if ('displayName' in raw) {
    if (typeof raw.displayName !== 'string')
      return { ok: false, error: 'displayName must be a string' };
    patch.displayName = raw.displayName;
  }
  if ('email' in raw) {
    if (typeof raw.email !== 'string') return { ok: false, error: 'email must be a string' };
    patch.email = raw.email;
  }
  if ('bio' in raw) {
    if (typeof raw.bio !== 'string') return { ok: false, error: 'bio must be a string' };
    patch.bio = raw.bio;
  }
  if ('avatar' in raw) {
    if (raw.avatar !== null && typeof raw.avatar !== 'string') {
      return { ok: false, error: 'avatar must be a string or null' };
    }
    patch.avatar = raw.avatar;
  }
  if (
    patch.displayName === undefined &&
    patch.email === undefined &&
    patch.bio === undefined &&
    patch.avatar === undefined
  ) {
    return { ok: false, error: 'Invalid body' };
  }
  return { ok: true, patch };
}

export function mountReaderUserRoutes(app: Express, staff: StaffStore, users: ReaderUserStore) {
  const requireStaff = createRequireStaff(staff);
  const router = Router();
  router.use(requireStaff);

  router.get('/', async (_req, res) => {
    const list = await users.list();
    res.json({ users: list.map(publicUser) });
  });

  router.patch('/:id', requireCommunityWrite, async (req: AuthedRequest, res) => {
    const parsed = readProfilePatch(req.body);
    if (!parsed.ok) {
      res.status(400).json({ error: parsed.error });
      return;
    }
    try {
      const updated = await users.updateProfile(String(req.params.id), parsed.patch);
      if (!updated) {
        res.status(404).json({ error: 'Not found' });
        return;
      }
      res.json({ user: publicUser(updated) });
    } catch (error) {
      if (error instanceof EmailTakenError) {
        res.status(400).json({ error: 'Email taken' });
        return;
      }
      throw error;
    }
  });

  router.delete('/:id', requireCommunityWrite, async (req: AuthedRequest, res) => {
    const ok = await users.delete(String(req.params.id));
    if (!ok) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    res.json({ ok: true });
  });

  app.use('/api/users', router);
}
