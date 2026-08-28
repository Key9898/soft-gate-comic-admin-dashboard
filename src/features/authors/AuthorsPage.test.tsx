import { describe, it, expect, beforeEach } from 'vitest';
import { HelmetProvider } from 'react-helmet-async';
import { render, screen } from '@/test/utils';
import { AuthProvider } from '@/features/auth/useAuth';
import { DataProvider } from '@/lib/DataContext';
import { hashPassword, upsertAccount, writeCredential } from '@/lib/auth';
import AuthorsPage from './AuthorsPage';

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
          <AuthorsPage />
        </DataProvider>
      </AuthProvider>
    </HelmetProvider>,
  );

describe('AuthorsPage staff access', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('hides Add Author for a viewer', () => {
    seed('viewer');
    wrap();
    expect(screen.getByRole('heading', { name: 'Authors' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /add author/i })).not.toBeInTheDocument();
  });
});
