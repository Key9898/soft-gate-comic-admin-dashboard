import { Router, type Request, type Response } from 'express';
import { adminAppUrl, staffInviteUrl, staffResetUrl, type StaffMailer } from '../mail/mailer.js';
import { createInviteToken, hashInviteToken } from './inviteToken.js';
import { newId } from './memoryStaffStore.js';
import { hashPassword, MIN_PASSWORD_LENGTH, verifyPassword } from './password.js';
import { canInviteRole, canManageTeam, canRemoveStaff, type InviteRole } from './rbac.js';
import { createRequireStaff, type AuthedRequest } from './requireStaff.js';
import {
  clearMfaCookie,
  clearStaffCookie,
  MFA_COOKIE,
  setMfaCookie,
  setStaffCookie,
  verifyMfaToken,
} from './session.js';
import { staffClearCookieOptions, staffCookieOptions } from './cookieOptions.js';
import { decryptSecret, encryptSecret } from './secretBox.js';
import {
  generateBackupCodes,
  generateTotpSecret,
  hashBackupCode,
  totpOtpauthUrl,
  verifyTotpCode,
} from './totp.js';
import {
  buildAuthorizeUrl,
  createOidcState,
  createPkceVerifier,
  exchangeOidcCode,
  fetchOidcDiscovery,
  isOidcConfigured,
  oidcRedirectUri,
  pkceChallenge,
} from './oidc.js';
import { publicInvite, publicUser, type StaffStore } from './staffStore.js';

const INVITE_TTL_MS = 48 * 60 * 60 * 1000;
const RESET_TTL_MS = 60 * 60 * 1000;
const OIDC_COOKIE_MS = 10 * 60 * 1000;
const OIDC_STATE = 'sg_oidc_state';
const OIDC_NONCE = 'sg_oidc_nonce';
const OIDC_VERIFIER = 'sg_oidc_verifier';

function normalizeEmail(email: unknown): string | null {
  if (typeof email !== 'string') return null;
  const trimmed = email.trim().toLowerCase();
  return trimmed.includes('@') ? trimmed : null;
}

function readString(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

function oidcCookieOptions() {
  return { ...staffCookieOptions(), maxAge: OIDC_COOKIE_MS };
}

function sessionPayload(user: {
  id: string;
  email: string;
  role: 'super_admin' | 'admin' | 'member' | 'viewer';
}) {
  return { sub: user.id, email: user.email, role: user.role };
}

export function createStaffRouter(store: StaffStore, mailer: StaffMailer): Router {
  const router = Router();
  const requireStaff = createRequireStaff(store);

  async function handleSetup(req: Request, res: Response) {
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
    setStaffCookie(res, sessionPayload(user));
    res.status(201).json({ user: publicUser(user) });
  }

  router.get('/auth-options', async (_req, res) => {
    res.json({
      setupRequired: (await store.countUsers()) === 0,
      ssoEnabled: isOidcConfigured(),
    });
  });

  router.post('/setup', handleSetup);
  router.post('/register', handleSetup);

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
    if (user.totpEnabled) {
      setMfaCookie(res, sessionPayload(user));
      res.status(401).json({ error: 'MFA_REQUIRED' });
      return;
    }
    setStaffCookie(res, sessionPayload(user));
    res.json({ user: publicUser(user) });
  });

  router.post('/login/mfa', async (req, res) => {
    const token = req.cookies?.[MFA_COOKIE];
    const payload = typeof token === 'string' ? verifyMfaToken(token) : null;
    if (!payload) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const code = readString(req.body?.code);
    if (!code) {
      res.status(400).json({ error: 'code is required' });
      return;
    }
    const user = await store.findUserById(payload.sub);
    if (!user?.totpEnabled) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const secret = user.totpSecret ? decryptSecret(user.totpSecret) : null;
    const totpOk = secret ? verifyTotpCode(secret, code) : false;
    const backupHash = hashBackupCode(code);
    const backupIndex = user.totpBackupHashes.indexOf(backupHash);
    if (!totpOk && backupIndex < 0) {
      res.status(401).json({ error: 'Invalid code' });
      return;
    }
    if (backupIndex >= 0) {
      const next = user.totpBackupHashes.filter((_, index) => index !== backupIndex);
      await store.updateUser(user.id, { totpBackupHashes: next });
    }
    clearMfaCookie(res);
    setStaffCookie(res, sessionPayload(user));
    res.json({ user: publicUser(user) });
  });

  router.post('/forgot', async (req, res) => {
    const email = normalizeEmail(req.body?.email);
    if (email) {
      const user = await store.findUserByEmail(email);
      if (user) {
        const rawToken = createInviteToken();
        await store.createPasswordReset({
          id: newId(),
          userId: user.id,
          tokenHash: hashInviteToken(rawToken),
          expiresAt: new Date(Date.now() + RESET_TTL_MS),
        });
        await mailer.sendStaffForgot({
          to: email,
          resetUrl: staffResetUrl(rawToken),
        });
      }
    }
    res.json({ ok: true });
  });

  router.post('/reset', async (req, res) => {
    const token = readString(req.body?.token);
    const password = readString(req.body?.password);
    if (!token || !password) {
      res.status(400).json({ error: 'token and password are required' });
      return;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      res
        .status(400)
        .json({ error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` });
      return;
    }
    const record = await store.findPasswordResetByTokenHash(hashInviteToken(token));
    if (!record || record.consumedAt || record.expiresAt.getTime() < Date.now()) {
      res.status(400).json({ error: 'Invalid or expired token' });
      return;
    }
    const user = await store.findUserById(record.userId);
    if (!user) {
      res.status(400).json({ error: 'Invalid or expired token' });
      return;
    }
    await store.updateUser(user.id, { passwordHash: await hashPassword(password) });
    await store.consumePasswordReset(record.id);
    await mailer.sendStaffPasswordChanged({ to: user.email });
    res.json({ ok: true });
  });

  router.get('/oidc/start', async (_req, res) => {
    if (!isOidcConfigured()) {
      res.status(404).json({ error: 'SSO is not configured' });
      return;
    }
    try {
      const discovery = await fetchOidcDiscovery();
      const state = createOidcState();
      const nonce = createOidcState();
      const verifier = createPkceVerifier();
      const cookies = oidcCookieOptions();
      res.cookie(OIDC_STATE, state, cookies);
      res.cookie(OIDC_NONCE, nonce, cookies);
      res.cookie(OIDC_VERIFIER, verifier, cookies);
      res.redirect(
        buildAuthorizeUrl({
          authorizationEndpoint: discovery.authorization_endpoint,
          clientId: (process.env.OIDC_CLIENT_ID ?? '').trim(),
          redirectUri: oidcRedirectUri(),
          state,
          nonce,
          challenge: pkceChallenge(verifier),
        }),
      );
    } catch {
      res.status(503).json({ error: 'SSO is unavailable' });
    }
  });

  router.get('/oidc/callback', async (req, res) => {
    const loginUrl = `${adminAppUrl()}/login`;
    if (!isOidcConfigured()) {
      res.redirect(`${loginUrl}?sso=error`);
      return;
    }
    const code = readString(req.query.code);
    const state = readString(req.query.state);
    const cookieState = readString(req.cookies?.[OIDC_STATE]);
    const nonce = readString(req.cookies?.[OIDC_NONCE]);
    const verifier = readString(req.cookies?.[OIDC_VERIFIER]);
    res.clearCookie(OIDC_STATE, staffClearCookieOptions());
    res.clearCookie(OIDC_NONCE, staffClearCookieOptions());
    res.clearCookie(OIDC_VERIFIER, staffClearCookieOptions());
    if (!code || !state || !cookieState || state !== cookieState || !nonce || !verifier) {
      res.redirect(`${loginUrl}?sso=error`);
      return;
    }
    try {
      const identity = await exchangeOidcCode({
        code,
        redirectUri: oidcRedirectUri(),
        verifier,
        nonce,
      });
      if (!identity) {
        res.redirect(`${loginUrl}?sso=error`);
        return;
      }
      const user = await store.findUserByEmail(identity.email);
      if (!user) {
        res.redirect(`${loginUrl}?sso=denied`);
        return;
      }
      if (user.totpEnabled) {
        setMfaCookie(res, sessionPayload(user));
        res.redirect(`${loginUrl}?mfa=1`);
        return;
      }
      setStaffCookie(res, sessionPayload(user));
      res.redirect(`${adminAppUrl()}/`);
    } catch {
      res.redirect(`${loginUrl}?sso=error`);
    }
  });

  router.post('/logout', (_req, res) => {
    clearStaffCookie(res);
    clearMfaCookie(res);
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

  router.post('/me/totp/start', requireStaff, async (req: AuthedRequest, res) => {
    const user = await store.findUserById(req.staff!.id);
    if (!user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    if (user.totpEnabled) {
      res.status(409).json({ error: 'MFA is already enabled' });
      return;
    }
    const secret = generateTotpSecret();
    await store.updateUser(user.id, { totpSecret: encryptSecret(secret), totpEnabled: false });
    res.json({ secret, otpauthUrl: totpOtpauthUrl(user.email, secret) });
  });

  router.post('/me/totp/confirm', requireStaff, async (req: AuthedRequest, res) => {
    const user = await store.findUserById(req.staff!.id);
    if (!user?.totpSecret) {
      res.status(400).json({ error: 'MFA setup has not started' });
      return;
    }
    const code = readString(req.body?.code);
    const secret = decryptSecret(user.totpSecret);
    if (!code || !secret || !verifyTotpCode(secret, code)) {
      res.status(400).json({ error: 'Invalid code' });
      return;
    }
    const backupCodes = generateBackupCodes();
    await store.updateUser(user.id, {
      totpEnabled: true,
      totpBackupHashes: backupCodes.map(hashBackupCode),
    });
    res.json({ backupCodes });
  });

  router.delete('/me/totp', requireStaff, async (req: AuthedRequest, res) => {
    const user = await store.findUserById(req.staff!.id);
    if (!user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const password = readString(req.body?.password);
    if (!password || !(await verifyPassword(password, user.passwordHash))) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }
    await store.updateUser(user.id, {
      totpEnabled: false,
      totpSecret: null,
      totpBackupHashes: [],
    });
    res.json({ ok: true });
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
    setStaffCookie(res, sessionPayload(user));
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
    await mailer.sendStaffInvite({
      to: invite.email,
      role: invite.role,
      inviteUrl: staffInviteUrl(rawToken),
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
    await mailer.sendStaffInvite({
      to: email,
      role,
      inviteUrl: staffInviteUrl(rawToken),
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
