import { hashPassword } from '../src/lib/auth/passwordHash';
import type { Page } from '@playwright/test';

const STAFF_EMAIL = 'admin@example.com';
const STAFF_PASSWORD = 'password123';

export async function seedStaffAndLogin(page: Page) {
  const hash = hashPassword(STAFF_PASSWORD);
  const account = {
    id: '1',
    email: STAFF_EMAIL,
    username: 'admin',
    displayName: 'Admin',
    role: 'super_admin',
    createdAt: '2026-08-22',
    passwordHash: hash,
  };

  await page.addInitScript(
    ({ email, hash: passwordHash, accountJson }) => {
      localStorage.setItem(
        'softgate_admin_accounts_v1',
        JSON.stringify({
          schemaVersion: 1,
          byEmail: { [email]: JSON.parse(accountJson) },
        }),
      );
      localStorage.setItem('softgate_admin_credentials', JSON.stringify({ [email]: passwordHash }));
    },
    { email: STAFF_EMAIL, hash, accountJson: JSON.stringify(account) },
  );

  await page.goto('/login');
  await page.locator('#login-email').fill(STAFF_EMAIL);
  await page.locator('#login-password').fill(STAFF_PASSWORD);
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL('/');
}
