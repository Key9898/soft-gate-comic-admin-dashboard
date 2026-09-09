import type { Express, NextFunction, Response } from 'express';
import { Router } from 'express';
import { canWriteBusiness } from '../auth/rbac.js';
import { createRequireStaff, type AuthedRequest } from '../auth/requireStaff.js';
import type { StaffStore } from '../auth/staffStore.js';
import { publicNotification, type NotificationStore } from './notificationStore.js';

function requireBusinessWrite(req: AuthedRequest, res: Response, next: NextFunction) {
  if (!canWriteBusiness(req.staff?.role)) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }
  next();
}

function readMarkRead(body: unknown): { ok: true } | { ok: false; error: string } {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { ok: false, error: 'Invalid body' };
  }
  const row = body as Record<string, unknown>;
  if (row.isRead !== true) {
    return { ok: false, error: 'isRead must be true' };
  }
  return { ok: true };
}

export function mountNotificationRoutes(
  app: Express,
  staff: StaffStore,
  notifications: NotificationStore,
) {
  const requireStaff = createRequireStaff(staff);
  const router = Router();
  router.use(requireStaff);

  router.get('/', async (_req, res) => {
    const list = await notifications.list();
    res.json({ notifications: list.map(publicNotification) });
  });

  router.patch('/read-all', requireBusinessWrite, async (_req, res) => {
    await notifications.markAllRead();
    res.json({ ok: true });
  });

  router.patch('/:id', requireBusinessWrite, async (req: AuthedRequest, res) => {
    const parsed = readMarkRead(req.body);
    if (!parsed.ok) {
      res.status(400).json({ error: parsed.error });
      return;
    }
    const updated = await notifications.markRead(String(req.params.id));
    if (!updated) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    res.json({ notification: publicNotification(updated) });
  });

  router.delete('/:id', requireBusinessWrite, async (req: AuthedRequest, res) => {
    const ok = await notifications.delete(String(req.params.id));
    if (!ok) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    res.json({ ok: true });
  });

  app.use('/api/notifications', router);
}
