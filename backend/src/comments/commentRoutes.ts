import type { Express, NextFunction, Response } from 'express';
import { Router } from 'express';
import { canWriteCommunity } from '../auth/rbac.js';
import { createRequireStaff, type AuthedRequest } from '../auth/requireStaff.js';
import type { StaffStore } from '../auth/staffStore.js';
import { isCommentStatus, publicComment, type CommentStore } from './commentStore.js';

function requireCommunityWrite(req: AuthedRequest, res: Response, next: NextFunction) {
  if (!canWriteCommunity(req.staff?.role)) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }
  next();
}

function readStatus(
  body: unknown,
): { ok: true; status: 'visible' | 'hidden' | 'deleted' } | { ok: false; error: string } {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { ok: false, error: 'Invalid body' };
  }
  const row = body as Record<string, unknown>;
  if (!isCommentStatus(row.status)) {
    return { ok: false, error: 'status must be visible, hidden, or deleted' };
  }
  return { ok: true, status: row.status };
}

export function mountCommentRoutes(app: Express, staff: StaffStore, comments: CommentStore) {
  const requireStaff = createRequireStaff(staff);
  const router = Router();
  router.use(requireStaff);

  router.get('/', async (_req, res) => {
    const list = await comments.list();
    res.json({ comments: list.map(publicComment) });
  });

  router.patch('/:id', requireCommunityWrite, async (req: AuthedRequest, res) => {
    const parsed = readStatus(req.body);
    if (!parsed.ok) {
      res.status(400).json({ error: parsed.error });
      return;
    }
    const updated = await comments.updateStatus(String(req.params.id), parsed.status);
    if (!updated) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    res.json({ comment: publicComment(updated) });
  });

  router.delete('/:id', requireCommunityWrite, async (req: AuthedRequest, res) => {
    const current = await comments.findById(String(req.params.id));
    if (!current) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    await comments.updateStatus(String(req.params.id), 'deleted');
    res.json({ ok: true });
  });

  app.use('/api/comments', router);
}
