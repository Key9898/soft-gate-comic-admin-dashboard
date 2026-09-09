import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../app.js';
import { createMemoryStaffStore } from '../auth/memoryStaffStore.js';
import { createMemoryCatalogStore } from '../catalog/memoryCatalogStore.js';
import { createMemoryCoinPackageStore } from '../coins/memoryCoinPackageStore.js';
import { createMemoryCommentStore } from '../comments/memoryCommentStore.js';
import { createMemoryNotificationStore } from './memoryNotificationStore.js';
import { createMemoryPlatformSettingsStore } from '../settings/memoryPlatformSettingsStore.js';
import { createMemoryReaderUserStore } from '../users/memoryReaderUserStore.js';
import type { NotificationStore, NotificationWrite } from './notificationStore.js';

const sampleWrite: NotificationWrite = {
  type: 'report',
  title: { en: 'New report', mm: '' },
  message: { en: 'A user reported content', mm: '' },
  actionUrl: '/reports',
};

function appWithNotifications(notifications: NotificationStore) {
  return createApp({
    store: createMemoryStaffStore(),
    catalog: createMemoryCatalogStore(),
    coinPackages: createMemoryCoinPackageStore(),
    comments: createMemoryCommentStore(),
    readerUsers: createMemoryReaderUserStore(),
    notifications,
    settings: createMemoryPlatformSettingsStore(),
  });
}

async function registerOwner(app: ReturnType<typeof createApp>) {
  const res = await request(app).post('/api/staff/register').send({
    email: 'owner@softgate.com',
    password: 'password1',
    displayName: 'Owner',
  });
  expect(res.status).toBe(201);
  return res.headers['set-cookie'] as string[];
}

describe('notification routes', () => {
  it('rejects unauthenticated reads', async () => {
    const app = appWithNotifications(createMemoryNotificationStore());
    const res = await request(app).get('/api/notifications');
    expect(res.status).toBe(401);
  });

  it('lets a member read and forbids member writes', async () => {
    const notifications = createMemoryNotificationStore();
    await notifications.create(sampleWrite);
    const app = appWithNotifications(notifications);
    const ownerCookie = await registerOwner(app);
    const invited = await request(app)
      .post('/api/staff/invites')
      .set('Cookie', ownerCookie)
      .send({ email: 'member@softgate.com', role: 'member' });
    const accepted = await request(app).post('/api/staff/invites/accept').send({
      token: invited.body.token,
      password: 'password1',
      displayName: 'Member',
    });
    const memberCookie = accepted.headers['set-cookie'] as string[];

    const listed = await request(app).get('/api/notifications').set('Cookie', memberCookie);
    expect(listed.status).toBe(200);
    expect(listed.body.notifications).toHaveLength(1);

    const deniedRead = await request(app)
      .patch(`/api/notifications/${listed.body.notifications[0].id}`)
      .set('Cookie', memberCookie)
      .send({ isRead: true });
    expect(deniedRead.status).toBe(403);

    const deniedAll = await request(app)
      .patch('/api/notifications/read-all')
      .set('Cookie', memberCookie);
    expect(deniedAll.status).toBe(403);

    const deniedDelete = await request(app)
      .delete(`/api/notifications/${listed.body.notifications[0].id}`)
      .set('Cookie', memberCookie);
    expect(deniedDelete.status).toBe(403);
  });

  it('marks read, marks all read, and hard-deletes for admin', async () => {
    const notifications = createMemoryNotificationStore();
    const first = await notifications.create(sampleWrite);
    const second = await notifications.create({
      ...sampleWrite,
      type: 'system',
      title: { en: 'Maintenance', mm: '' },
      actionUrl: undefined,
    });
    const app = appWithNotifications(notifications);
    const cookie = await registerOwner(app);

    const marked = await request(app)
      .patch(`/api/notifications/${first.id}`)
      .set('Cookie', cookie)
      .send({ isRead: true });
    expect(marked.status).toBe(200);
    expect(marked.body.notification.isRead).toBe(true);
    expect(marked.body.notification.createdAt).toBe(first.createdAt);
    expect(marked.body.notification.actionUrl).toBe('/reports');

    const again = await request(app)
      .patch(`/api/notifications/${first.id}`)
      .set('Cookie', cookie)
      .send({ isRead: true });
    expect(again.status).toBe(200);
    expect(again.body.notification.isRead).toBe(true);

    const bad = await request(app)
      .patch(`/api/notifications/${first.id}`)
      .set('Cookie', cookie)
      .send({ isRead: false });
    expect(bad.status).toBe(400);

    const missing = await request(app)
      .patch('/api/notifications/missing')
      .set('Cookie', cookie)
      .send({ isRead: true });
    expect(missing.status).toBe(404);

    const all = await request(app).patch('/api/notifications/read-all').set('Cookie', cookie);
    expect(all.status).toBe(200);
    expect(all.body.ok).toBe(true);

    const listed = await request(app).get('/api/notifications').set('Cookie', cookie);
    expect(listed.status).toBe(200);
    expect(listed.body.notifications).toHaveLength(2);
    expect(listed.body.notifications.every((row: { isRead: boolean }) => row.isRead)).toBe(true);
    expect(listed.body.notifications[0].id).toBe(second.id);

    const deleted = await request(app)
      .delete(`/api/notifications/${first.id}`)
      .set('Cookie', cookie);
    expect(deleted.status).toBe(200);
    expect(deleted.body.ok).toBe(true);

    const afterDelete = await request(app).get('/api/notifications').set('Cookie', cookie);
    expect(afterDelete.body.notifications).toHaveLength(1);
    expect(afterDelete.body.notifications[0].id).toBe(second.id);

    const goneAgain = await request(app)
      .delete(`/api/notifications/${first.id}`)
      .set('Cookie', cookie);
    expect(goneAgain.status).toBe(404);

    const missingDelete = await request(app)
      .delete('/api/notifications/missing')
      .set('Cookie', cookie);
    expect(missingDelete.status).toBe(404);
  });
});
