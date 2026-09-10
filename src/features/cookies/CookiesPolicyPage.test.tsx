import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HelmetProvider } from 'react-helmet-async';
import { render, screen } from '@/test/utils';
import { AuthProvider } from '@/features/auth/useAuth';
import { DataProvider } from '@/lib/DataContext';
import { hashPassword, upsertAccount, writeCredential } from '@/lib/auth';
import { DEFAULT_COOKIE_META } from '@/lib/cookiesPolicy';
import CookiesPolicyPage from './CookiesPolicyPage';

const live = vi.hoisted(() => ({ on: false }));

vi.mock('@/lib/api/http', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/api/http')>();
  return { ...actual, isMockApi: () => !live.on };
});

vi.mock('@/lib/api/cookies', () => ({
  getCookiesPolicy: () => Promise.reject(new Error('boom')),
  updateCookiesMeta: vi.fn(),
  createCookieRow: vi.fn(),
  updateCookieRow: vi.fn(),
  deleteCookieRow: vi.fn(),
}));

const seed = (role: 'super_admin' | 'admin' | 'member' | 'viewer') => {
  const passwordHash = hashPassword('password1');
  const account = {
    id: '1',
    email: 'staff@test.com',
    username: 'staff',
    displayName: 'Staff',
    role,
    createdAt: '2026-08-23',
    passwordHash,
  };
  upsertAccount(account);
  writeCredential(account.email, passwordHash);
  localStorage.setItem('softgate_admin_user', JSON.stringify(account));
};

const wrap = () =>
  render(
    <HelmetProvider>
      <AuthProvider>
        <DataProvider>
          <CookiesPolicyPage />
        </DataProvider>
      </AuthProvider>
    </HelmetProvider>,
  );

describe('CookiesPolicyPage staff access', () => {
  beforeEach(() => {
    localStorage.clear();
    live.on = false;
  });

  it('hides Save cookies for a viewer', () => {
    seed('viewer');
    wrap();
    expect(screen.getByRole('heading', { name: 'Cookies' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /save cookies/i })).not.toBeInTheDocument();
    expect(DEFAULT_COOKIE_META.copy.analyticsCookiesDesc.en.startsWith('None.')).toBe(true);
  });
});

describe('CookiesPolicyPage live lane', () => {
  beforeEach(() => {
    localStorage.clear();
    live.on = true;
    seed('admin');
  });

  it('shows Cookie policy request failed instead of empty storage', async () => {
    wrap();
    expect(await screen.findByRole('alert')).toHaveTextContent('Cookie policy request failed.');
    expect(screen.queryByText('No storage rows')).not.toBeInTheDocument();
  });
});
