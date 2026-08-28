import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../app.js';
import { createMemoryStaffStore } from './memoryStaffStore.js';

describe('staff auth routes', () => {
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
});
