import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HelmetProvider } from 'react-helmet-async';
import { render, screen } from '@/test/utils';
import { AuthProvider } from '@/features/auth/useAuth';
import { DataProvider } from '@/lib/DataContext';
import { hashPassword, upsertAccount, writeCredential } from '@/lib/auth';
import { DEFAULT_PRIVACY_META } from '@/lib/legal';
import LegalPage from './LegalPage';

const live = vi.hoisted(() => ({ on: false }));

vi.mock('@/lib/api/http', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/api/http')>();
  return { ...actual, isMockApi: () => !live.on };
});

vi.mock('@/lib/api/legal', () => ({
  getLegalMeta: () => Promise.reject(new Error('boom')),
  listLegalSections: () => Promise.reject(new Error('boom')),
  createLegalSection: vi.fn(),
  deleteLegalSection: vi.fn(),
  updateLegalMeta: vi.fn(),
  updateLegalSection: vi.fn(),
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
          <LegalPage />
        </DataProvider>
      </AuthProvider>
    </HelmetProvider>,
  );

describe('LegalPage staff access', () => {
  beforeEach(() => {
    localStorage.clear();
    live.on = false;
  });

  it('hides Save and Add section for a viewer', () => {
    seed('viewer');
    wrap();
    expect(screen.getByRole('heading', { name: 'Legal' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Privacy Policy' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Terms of Service' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /add section/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /save privacy policy/i })).not.toBeInTheDocument();
    expect(DEFAULT_PRIVACY_META.glance[0]?.en).toMatch(/does not send your data to any server/);
  });
});

describe('LegalPage live lane', () => {
  beforeEach(() => {
    localStorage.clear();
    live.on = true;
    seed('admin');
  });

  it('shows Legal request failed instead of empty sections', async () => {
    wrap();
    expect(await screen.findByRole('alert')).toHaveTextContent('Legal request failed.');
    expect(screen.queryByText('No privacy policy sections')).not.toBeInTheDocument();
  });
});
