import type { NextFunction, Request, Response } from 'express';
import { verifyStaffToken, STAFF_COOKIE } from './session.js';
import type { StaffStore } from './staffStore.js';

export type AuthedRequest = Request & {
  staff?: { id: string; email: string; role: string };
};

export function createRequireStaff(store: StaffStore) {
  return async (req: AuthedRequest, res: Response, next: NextFunction) => {
    const token = req.cookies?.[STAFF_COOKIE];
    if (typeof token !== 'string') {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const payload = verifyStaffToken(token);
    if (!payload) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const user = await store.findUserById(payload.sub);
    if (!user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    req.staff = { id: user.id, email: user.email, role: user.role };
    next();
  };
}
