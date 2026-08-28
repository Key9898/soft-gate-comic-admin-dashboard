import { Router } from 'express';
import { createInviteToken, hashInviteToken } from './inviteToken.js';
import { newId } from './memoryStaffStore.js';
import { hashPassword, MIN_PASSWORD_LENGTH, verifyPassword } from './password.js';
import { canInviteRole, canManageTeam, canRemoveStaff, type InviteRole } from './rbac.js';
import { createRequireStaff, type AuthedRequest } from './requireStaff.js';
import { clearStaffCookie, setStaffCookie } from './session.js';
import { publicInvite, publicUser, type StaffStore } from './staffStore.js';

const INVITE_TTL_MS = 48 * 60 * 60 * 1000;

function normalizeEmail(email: unknown): string | null {
  if (typeof email !== 'string') return null;
  const trimmed = email.trim().toLowerCase();
  return trimmed.includes('@') ? trimmed : null;
}

function readString(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

export function createStaffRouter(store: StaffStore): Router {
  const router = Router();
  const requireStaff = createRequireStaff(store);

  router.post('/register', async (req, res) => {
    const count = await store.countUsers();
    if (count > 0) {
      res.status(403).json({ error: 'Registration is locked' });
      return;
    }
    const email = normalizeEmail(req.body?.email);
    const password = readString(req.body?.password);
    const displayName = readString(req.body?.displayName)?.trim();
    if (!email || !password || !displayName) {
      res.status(400).json({ error: 'email, password, and displayName are required' });
      return;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      res
        .status(400)
        .json({ error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` });
      return;
    }
    const user = await store.createUser({
      id: newId(),
      email,
      displayName,
      role: 'super_admin',
      passwordHash: await hashPassword(password),
    });
    setStaffCookie(res, { sub: user.id, email: user.email, role: user.role });
    res.status(201).json({ user: publicUser(user) });
  });

  router.post('/login', async (req, res) => {
    const email = normalizeEmail(req.body?.email);
    const password = readString(req.body?.password);
    if (!email || !password) {
      res.status(400).json({ error: 'email and password are required' });
      return;
    }
    const user = await store.findUserByEmail(email);
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }
    setStaffCookie(res, { sub: user.id, email: user.email, role: user.role });
    res.json({ user: publicUser(user) });
  });

  router.post('/logout', (_req, res) => {
    clearStaffCookie(res);
    res.json({ ok: true });
  });

  router.get('/me', requireStaff, async (req: AuthedRequest, res) => {
    const user = await store.findUserById(req.staff!.id);
    if (!user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    res.json({ user: publicUser(user) });
  });

  router.get('/invites', requireStaff, async (_req, res) => {
    const invites = await store.listInvites();
    res.json({ invites: invites.map(publicInvite) });
  });

  router.post('/invites/accept', async (req, res) => {
    const token = readString(req.body?.token);
    const password = readString(req.body?.password);
    const displayName = readString(req.body?.displayName)?.trim();
    if (!token || !password || !displayName) {
      res.status(400).json({ error: 'token, password, and displayName are required' });
      return;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      res
        .status(400)
        .json({ error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` });
      return;
    }
    const invite = await store.findInviteByTokenHash(hashInviteToken(token));
    if (!invite || invite.status !== 'pending' || invite.expiresAt.getTime() < Date.now()) {
      res.status(400).json({ error: 'Invalid or expired invite' });
      return;
    }
    if (await store.findUserByEmail(invite.email)) {
      res.status(409).json({ error: 'Account already exists' });
      return;
    }
    const user = await store.createUser({
      id: newId(),
      email: invite.email,
      displayName,
      role: invite.role,
      passwordHash: await hashPassword(password),
    });
    await store.updateInvite(invite.id, { status: 'accepted', acceptedAt: new Date() });
    setStaffCookie(res, { sub: user.id, email: user.email, role: user.role });
    res.status(201).json({ user: publicUser(user) });
  });

  router.post('/invites/:id/resend', requireStaff, async (req: AuthedRequest, res) => {
    if (!canManageTeam(req.staff?.role)) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }
    const invite = await store.findInviteById(String(req.params.id));
    if (!invite || invite.status !== 'pending') {
      res.status(404).json({ error: 'Invite not found' });
      return;
    }
    const rawToken = createInviteToken();
    const updated = await store.updateInvite(invite.id, {
      tokenHash: hashInviteToken(rawToken),
      expiresAt: new Date(Date.now() + INVITE_TTL_MS),
    });
    res.json({ invite: publicInvite(updated ?? invite), token: rawToken });
  });

  router.post('/invites', requireStaff, async (req: AuthedRequest, res) => {
    if (!canManageTeam(req.staff?.role)) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }
    const email = normalizeEmail(req.body?.email);
    const role = readString(req.body?.role) as InviteRole | null;
    if (!email || !role) {
      res.status(400).json({ error: 'email and role are required' });
      return;
    }
    if (!canInviteRole(req.staff?.role, role)) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }
    if (await store.findUserByEmail(email)) {
      res.status(409).json({ error: 'Account already exists' });
      return;
    }
    const rawToken = createInviteToken();
    const invite = await store.createInvite({
      id: newId(),
      email,
      role,
      tokenHash: hashInviteToken(rawToken),
      inviterId: req.staff!.id,
      expiresAt: new Date(Date.now() + INVITE_TTL_MS),
    });
    res.status(201).json({ invite: publicInvite(invite), token: rawToken });
  });

  router.get('/', requireStaff, async (_req, res) => {
    const users = await store.listUsers();
    res.json({ users: users.map(publicUser) });
  });

  router.delete('/:id', requireStaff, async (req: AuthedRequest, res) => {
    const target = await store.findUserById(String(req.params.id));
    if (!target) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    if (!canRemoveStaff(req.staff?.role, target.role)) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }
    await store.deleteUser(target.id);
    res.json({ ok: true });
  });

  return router;
}
