import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  adminAppUrl,
  createMailerFromEnv,
  formatInviteRole,
  isMailerConfigured,
  renderStaffInviteHtml,
  staffInviteUrl,
} from './mailer.js';

const configured = {
  BREVO_API_KEY: 'xkeysib-test',
  BREVO_SENDER_EMAIL: 'noreply@example.com',
  BREVO_SENDER_NAME: 'Desk',
  ADMIN_APP_URL: 'https://admin.example.com/',
};

describe('mailer config', () => {
  it('treats missing, blank, and fake keys as not configured', () => {
    expect(isMailerConfigured({})).toBe(false);
    expect(isMailerConfigured({ BREVO_API_KEY: 'fake', BREVO_SENDER_EMAIL: 'a@b.c' })).toBe(false);
    expect(isMailerConfigured({ BREVO_API_KEY: 'FAKE', BREVO_SENDER_EMAIL: 'a@b.c' })).toBe(false);
    expect(isMailerConfigured({ BREVO_API_KEY: 'real-key', BREVO_SENDER_EMAIL: '' })).toBe(false);
    expect(isMailerConfigured({ BREVO_API_KEY: 'real-key', BREVO_SENDER_EMAIL: 'a@b.c' })).toBe(
      true,
    );
  });

  it('builds invite URLs from ADMIN_APP_URL with a local default', () => {
    expect(adminAppUrl({})).toBe('http://localhost:5173');
    expect(adminAppUrl({ ADMIN_APP_URL: 'https://admin.example.com/' })).toBe(
      'https://admin.example.com',
    );
    expect(staffInviteUrl('abc', configured)).toBe('https://admin.example.com/invite/abc');
  });

  it('capitalizes invite roles', () => {
    expect(formatInviteRole('member')).toBe('Member');
    expect(formatInviteRole('admin')).toBe('Admin');
    expect(formatInviteRole('viewer')).toBe('Viewer');
  });
});

describe('sendStaffInvite', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('does not fetch when the mailer is not configured', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const mailer = createMailerFromEnv({ BREVO_API_KEY: 'fake', BREVO_SENDER_EMAIL: '' });
    await mailer.sendStaffInvite({
      to: 'member@softgate.com',
      role: 'member',
      inviteUrl: 'http://localhost:5173/invite/tok',
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('posts in-repo HTML to Brevo without a templateId', async () => {
    const fetchMock = vi.fn(async () => new Response('{}', { status: 201 }));
    vi.stubGlobal('fetch', fetchMock);
    const mailer = createMailerFromEnv(configured);
    const inviteUrl = 'https://admin.example.com/invite/tok';
    await mailer.sendStaffInvite({
      to: 'member@softgate.com',
      role: 'member',
      inviteUrl,
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://api.brevo.com/v3/smtp/email');
    const headers = new Headers(init.headers);
    expect(headers.get('api-key')).toBe('xkeysib-test');
    const body = JSON.parse(String(init.body)) as {
      sender: { email: string; name: string };
      to: Array<{ email: string }>;
      subject: string;
      htmlContent: string;
      templateId?: number;
    };
    expect(body.templateId).toBeUndefined();
    expect(body.sender).toEqual({ email: 'noreply@example.com', name: 'Desk' });
    expect(body.to).toEqual([{ email: 'member@softgate.com' }]);
    expect(body.subject).toBe("You're invited to SoftGate Comic Admin");
    expect(body.htmlContent).toContain(inviteUrl);
    expect(body.htmlContent).toContain('member@softgate.com');
    expect(body.htmlContent).toContain('Member');
    expect(body.htmlContent).not.toContain('{{inviteUrl}}');
  });

  it('swallows fetch failures', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('network');
      }),
    );
    const mailer = createMailerFromEnv(configured);
    await expect(
      mailer.sendStaffInvite({
        to: 'member@softgate.com',
        role: 'member',
        inviteUrl: 'https://admin.example.com/invite/tok',
      }),
    ).resolves.toBeUndefined();
  });

  it('renders all placeholders', () => {
    const html = renderStaffInviteHtml({
      to: 'a@b.c',
      role: 'viewer',
      inviteUrl: 'http://localhost:5173/invite/x',
    });
    expect(html).toContain('http://localhost:5173/invite/x');
    expect(html).toContain('a@b.c');
    expect(html).toContain('Viewer');
    expect(html).not.toContain('{{email}}');
    expect(html).not.toContain('{{role}}');
  });
});
