import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export type EnvMap = Record<string, string | undefined>;

export type StaffInviteMail = {
  to: string;
  role: string;
  inviteUrl: string;
};

export type StaffMailer = {
  sendStaffInvite: (mail: StaffInviteMail) => Promise<void>;
};

const BREVO_SMTP_URL = 'https://api.brevo.com/v3/smtp/email';
const INVITE_SUBJECT = "You're invited to SoftGate Comic Admin";
const DEFAULT_SENDER_NAME = 'SoftGate Comic';
const DEFAULT_ADMIN_APP_URL = 'http://localhost:5173';

function read(env: EnvMap, key: string): string {
  return (env[key] ?? '').trim();
}

function isFake(value: string): boolean {
  return value.toLowerCase() === 'fake';
}

export function isMailerConfigured(env: EnvMap = process.env): boolean {
  const key = read(env, 'BREVO_API_KEY');
  const sender = read(env, 'BREVO_SENDER_EMAIL');
  if (!key || isFake(key)) return false;
  return Boolean(sender);
}

export function adminAppUrl(env: EnvMap = process.env): string {
  const raw = read(env, 'ADMIN_APP_URL') || DEFAULT_ADMIN_APP_URL;
  return raw.replace(/\/+$/, '');
}

export function staffInviteUrl(token: string, env: EnvMap = process.env): string {
  return `${adminAppUrl(env)}/invite/${token}`;
}

export function formatInviteRole(role: string): string {
  if (!role) return role;
  return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
}

export function loadInviteTemplate(): string {
  const path = fileURLToPath(new URL('./templates/staff-invite.html', import.meta.url));
  return readFileSync(path, 'utf8');
}

export function renderStaffInviteHtml(mail: StaffInviteMail): string {
  return loadInviteTemplate()
    .replaceAll('{{inviteUrl}}', mail.inviteUrl)
    .replaceAll('{{email}}', mail.to)
    .replaceAll('{{role}}', formatInviteRole(mail.role));
}

export function createMailerFromEnv(env: EnvMap = process.env): StaffMailer {
  return {
    async sendStaffInvite(mail) {
      if (!isMailerConfigured(env)) return;
      try {
        const htmlContent = renderStaffInviteHtml(mail);
        await fetch(BREVO_SMTP_URL, {
          method: 'POST',
          headers: {
            accept: 'application/json',
            'api-key': read(env, 'BREVO_API_KEY'),
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            sender: {
              email: read(env, 'BREVO_SENDER_EMAIL'),
              name: read(env, 'BREVO_SENDER_NAME') || DEFAULT_SENDER_NAME,
            },
            to: [{ email: mail.to }],
            subject: INVITE_SUBJECT,
            htmlContent,
          }),
        });
      } catch {
        // Fail-soft: invite token is still returned by the route.
      }
    },
  };
}
