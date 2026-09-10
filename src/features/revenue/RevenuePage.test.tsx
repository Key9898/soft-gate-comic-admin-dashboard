import { describe, it, expect, beforeEach } from 'vitest';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { AuthProvider } from '@/features/auth/useAuth';
import { DataProvider } from '@/lib/DataContext';
import { hashPassword, upsertAccount, writeCredential } from '@/lib/auth';
import RevenuePage from './RevenuePage';

const seed = () => {
  const passwordHash = hashPassword('password1');
  const account = {
    id: '1',
    email: 'staff@test.com',
    username: 'staff',
    displayName: 'Staff',
    role: 'super_admin' as const,
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
      <MemoryRouter>
        <AuthProvider>
          <DataProvider>
            <RevenuePage />
          </DataProvider>
        </AuthProvider>
      </MemoryRouter>
    </HelmetProvider>,
  );

describe('RevenuePage mock desk', () => {
  beforeEach(() => {
    localStorage.clear();
    seed();
  });

  it('still shows demo purchases', () => {
    wrap();
    expect(screen.getByText('john_doe')).toBeInTheDocument();
    expect(screen.getByText('jane_smith')).toBeInTheDocument();
    expect(screen.getByText('$29.98')).toBeInTheDocument();
    expect(screen.queryByText('Not wired on live')).not.toBeInTheDocument();
  });
});
