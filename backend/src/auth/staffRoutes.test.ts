import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';
import { createApp } from '../app.js';
import { createMemoryStaffStore } from './memoryStaffStore.js';

describe('staff auth routes', () => {
  it('exposes auth-options and aliases setup to register', async () => {
    const store = createMemoryStaffStore();
    const app = createApp({ store });
    const empty = await request(app).get('/api/staff/auth-options');
    expect(empty.status).toBe(200);
    expect(empty.body).toEqual({ setupRequired: true, ssoEnabled: false });

    const first = await request(app).post('/api/staff/setup').send({
      email: 'owner@softgate.com',
      password: 'password1',
      displayName: 'Owner',
    });
    expect(first.status).toBe(201);
    expect(first.body.user.role).toBe('super_admin');

    const locked = await request(app).get('/api/staff/auth-options');
    expect(locked.body.setupRequired).toBe(false);

    const second = await request(app).post('/api/staff/setup').send({
      email: 'two@softgate.com',
      password: 'password1',
      displayName: 'Two',
    });
    expect(second.status).toBe(403);
  });

  it('resets a password with a consumed token and does not enumerate emails', async () => {
    const sendStaffForgot = vi.fn(async () => {});
    const sendStaffPasswordChanged = vi.fn(async () => {});
    const store = createMemoryStaffStore();
    const app = createApp({
      store,
      mailer: {
        sendStaffInvite: async () => {},
        sendStaffForgot,
        sendStaffPasswordChanged,
      },
    });
    await request(app).post('/api/staff/register').send({
      email: 'owner@softgate.com',
      password: 'password1',
      displayName: 'Owner',
    });

    const missing = await request(app).post('/api/staff/forgot').send({ email: 'nobody@x.com' });
    expect(missing.status).toBe(200);
    expect(sendStaffForgot).not.toHaveBeenCalled();

    const forgot = await request(app)
      .post('/api/staff/forgot')
      .send({ email: 'owner@softgate.com' });
    expect(forgot.status).toBe(200);
    expect(sendStaffForgot).toHaveBeenCalledTimes(1);
    const resetUrl = sendStaffForgot.mock.calls[0][0].resetUrl as string;
    const token = resetUrl.split('/').pop() as string;

    const reset = await request(app)
      .post('/api/staff/reset')
      .send({ token, password: 'password2' });
    expect(reset.status).toBe(200);
    expect(sendStaffPasswordChanged).toHaveBeenCalledTimes(1);

    const oldLogin = await request(app).post('/api/staff/login').send({
      email: 'owner@softgate.com',
      password: 'password1',
    });
    expect(oldLogin.status).toBe(401);

    const newLogin = await request(app).post('/api/staff/login').send({
      email: 'owner@softgate.com',
      password: 'password2',
    });
    expect(newLogin.status).toBe(200);
  });

  it('challenges TOTP after password when MFA is enabled', async () => {
    const { encryptSecret } = await import('./secretBox.js');
    const { generateTotpCode, generateTotpSecret } = await import('./totp.js');
    const store = createMemoryStaffStore();
    const app = createApp({ store });
    const owner = await request(app).post('/api/staff/register').send({
      email: 'owner@softgate.com',
      password: 'password1',
      displayName: 'Owner',
    });
    const id = owner.body.user.id as string;
    const secret = generateTotpSecret();
    await store.updateUser(id, {
      totpEnabled: true,
      totpSecret: encryptSecret(secret),
    });

    const challenged = await request(app).post('/api/staff/login').send({
      email: 'owner@softgate.com',
      password: 'password1',
    });
    expect(challenged.status).toBe(401);
    expect(challenged.body.error).toBe('MFA_REQUIRED');
    const mfaCookie = challenged.headers['set-cookie'] as string[];
    expect(mfaCookie.some((c: string) => c.startsWith('sg_staff_mfa='))).toBe(true);

    const ok = await request(app)
      .post('/api/staff/login/mfa')
      .set('Cookie', mfaCookie)
      .send({ code: generateTotpCode(secret) });
    expect(ok.status).toBe(200);
    expect(ok.body.user.email).toBe('owner@softgate.com');
  });

  it('registers the first super_admin and rejects a second register', async () => {
    const app = createApp({ store: createMemoryStaffStore() });
    const first = await request(app).post('/api/staff/register').send({
      email: 'Owner@Softgate.com',
      password: 'password1',
      displayName: 'Owner',
    });
    expect(first.status).toBe(201);
    expect(first.body.user.role).toBe('super_admin');
    expect(first.body.user.email).toBe('owner@softgate.com');
    expect(first.headers['set-cookie']?.some((c: string) => c.startsWith('sg_staff='))).toBe(true);

    const second = await request(app).post('/api/staff/register').send({
      email: 'two@softgate.com',
      password: 'password1',
      displayName: 'Two',
    });
    expect(second.status).toBe(403);
  });

  it('invites a member, accepts, and forbids removing super_admin', async () => {
    const app = createApp({ store: createMemoryStaffStore() });
    const owner = await request(app).post('/api/staff/register').send({
      email: 'owner@softgate.com',
      password: 'password1',
      displayName: 'Owner',
    });
    const cookie = owner.headers['set-cookie'] as string[];

    const invited = await request(app)
      .post('/api/staff/invites')
      .set('Cookie', cookie)
      .send({ email: 'member@softgate.com', role: 'member' });
    expect(invited.status).toBe(201);
    expect(invited.body.token).toMatch(/^[a-f0-9]{64}$/);
    expect(invited.body.invite.role).toBe('member');

    const accepted = await request(app).post('/api/staff/invites/accept').send({
      token: invited.body.token,
      password: 'password1',
      displayName: 'Member',
    });
    expect(accepted.status).toBe(201);
    expect(accepted.body.user.role).toBe('member');

    const removed = await request(app)
      .delete(`/api/staff/${owner.body.user.id}`)
      .set('Cookie', cookie);
    expect(removed.status).toBe(403);
  });

  it('returns 404 for SSO start when OIDC is not configured', async () => {
    const app = createApp({ store: createMemoryStaffStore() });
    const res = await request(app).get('/api/staff/oidc/start');
    expect(res.status).toBe(404);
  });

  it('still returns the invite token when the mailer runs', async () => {
    const sendStaffInvite = vi.fn(async () => {});
    const app = createApp({
      store: createMemoryStaffStore(),
      mailer: {
        sendStaffInvite,
        sendStaffForgot: async () => {},
        sendStaffPasswordChanged: async () => {},
      },
    });
    const owner = await request(app).post('/api/staff/register').send({
      email: 'owner@softgate.com',
      password: 'password1',
      displayName: 'Owner',
    });
    const cookie = owner.headers['set-cookie'] as string[];

    const invited = await request(app)
      .post('/api/staff/invites')
      .set('Cookie', cookie)
      .send({ email: 'member@softgate.com', role: 'member' });
    expect(invited.status).toBe(201);
    expect(invited.body.token).toMatch(/^[a-f0-9]{64}$/);
    expect(sendStaffInvite).toHaveBeenCalledTimes(1);
    expect(sendStaffInvite.mock.calls[0][0]).toMatchObject({
      to: 'member@softgate.com',
      role: 'member',
    });
    expect(sendStaffInvite.mock.calls[0][0].inviteUrl).toMatch(
      /^http:\/\/localhost:5173\/invite\/[a-f0-9]{64}$/,
    );
  });
});
