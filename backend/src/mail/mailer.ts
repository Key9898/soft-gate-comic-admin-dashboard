import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export type EnvMap = Record<string, string | undefined>;

export type StaffInviteMail = {
  to: string;
  role: string;
  inviteUrl: string;
};

export type StaffForgotMail = {
  to: string;
  resetUrl: string;
};

export type StaffPasswordChangedMail = {
  to: string;
};

export type StaffMailer = {
  sendStaffInvite: (mail: StaffInviteMail) => Promise<void>;
  sendStaffForgot: (mail: StaffForgotMail) => Promise<void>;
  sendStaffPasswordChanged: (mail: StaffPasswordChangedMail) => Promise<void>;
};

const BREVO_SMTP_URL = 'https://api.brevo.com/v3/smtp/email';
const INVITE_SUBJECT = "You're invited to SoftGate Comic Admin";
const FORGOT_SUBJECT = 'Reset your SoftGate Comic Admin password';
const CHANGED_SUBJECT = 'Your SoftGate Comic Admin password changed';
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

export function staffResetUrl(token: string, env: EnvMap = process.env): string {
  return `${adminAppUrl(env)}/reset-password/${token}`;
}

export function formatInviteRole(role: string): string {
  if (!role) return role;
  return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
}

function loadTemplate(name: string): string {
  const path = fileURLToPath(new URL(`./templates/${name}`, import.meta.url));
  return readFileSync(path, 'utf8');
}

export function loadInviteTemplate(): string {
  return loadTemplate('staff-invite.html');
}

export function renderStaffInviteHtml(mail: StaffInviteMail): string {
  return loadInviteTemplate()
    .replaceAll('{{inviteUrl}}', mail.inviteUrl)
    .replaceAll('{{email}}', mail.to)
    .replaceAll('{{role}}', formatInviteRole(mail.role));
}

export function renderStaffForgotHtml(mail: StaffForgotMail): string {
  return loadTemplate('staff-forgot.html')
    .replaceAll('{{resetUrl}}', mail.resetUrl)
    .replaceAll('{{email}}', mail.to);
}

export function renderStaffPasswordChangedHtml(mail: StaffPasswordChangedMail): string {
  return loadTemplate('staff-reset.html').replaceAll('{{email}}', mail.to);
}

async function sendHtml(
  env: EnvMap,
  to: string,
  subject: string,
  htmlContent: string,
): Promise<void> {
  if (!isMailerConfigured(env)) return;
  try {
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
        to: [{ email: to }],
        subject,
        htmlContent,
      }),
    });
  } catch {
    // Fail-soft: routes still return tokens / ok.
  }
}

export function createMailerFromEnv(env: EnvMap = process.env): StaffMailer {
  return {
    async sendStaffInvite(mail) {
      await sendHtml(env, mail.to, INVITE_SUBJECT, renderStaffInviteHtml(mail));
    },
    async sendStaffForgot(mail) {
      await sendHtml(env, mail.to, FORGOT_SUBJECT, renderStaffForgotHtml(mail));
    },
    async sendStaffPasswordChanged(mail) {
      await sendHtml(env, mail.to, CHANGED_SUBJECT, renderStaffPasswordChangedHtml(mail));
    },
  };
}
