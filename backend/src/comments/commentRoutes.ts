import type { Express, NextFunction, Response } from 'express';
import { Router } from 'express';
import { canWriteCommunity } from '../auth/rbac.js';
import { createRequireStaff, type AuthedRequest } from '../auth/requireStaff.js';
import type { StaffStore } from '../auth/staffStore.js';
import { publicComment, type CommentStore } from './commentStore.js';

function requireCommunityWrite(req: AuthedRequest, res: Response, next: NextFunction) {
  if (!canWriteCommunity(req.staff?.role)) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }
  next();
}

function readReported(
  body: unknown,
): { ok: true; reported: boolean } | { ok: false; error: string } {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { ok: false, error: 'Invalid body' };
  }
  const reported = (body as { reported?: unknown }).reported;
  if (typeof reported !== 'boolean') {
    return { ok: false, error: 'reported must be a boolean' };
  }
  return { ok: true, reported };
}

export function mountCommentRoutes(app: Express, staff: StaffStore, comments: CommentStore) {
  const requireStaff = createRequireStaff(staff);
  const router = Router();
  router.use(requireStaff);

  router.get('/', async (req, res) => {
    const raw = req.query.reported;
    const filter =
      raw === 'true' ? { reported: true } : raw === 'false' ? { reported: false } : undefined;
    const list = await comments.list(filter);
    res.json({ comments: list.map(publicComment) });
  });

  router.patch('/:id', requireCommunityWrite, async (req: AuthedRequest, res) => {
    const parsed = readReported(req.body);
    if (!parsed.ok) {
      res.status(400).json({ error: parsed.error });
      return;
    }
    const updated = await comments.updateReported(String(req.params.id), parsed.reported);
    if (!updated) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    res.json({ comment: publicComment(updated) });
  });

  router.delete('/:id', requireCommunityWrite, async (req: AuthedRequest, res) => {
    const ok = await comments.delete(String(req.params.id));
    if (!ok) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    res.json({ ok: true });
  });

  app.use('/api/comments', router);
}
