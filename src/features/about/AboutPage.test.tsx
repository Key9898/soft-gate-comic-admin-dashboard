import { StrictMode } from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter } from 'react-router-dom';
import { render, screen, waitFor } from '@/test/utils';
import { render as rtlRender } from '@testing-library/react';
import { AuthProvider } from '@/features/auth/useAuth';
import { DataProvider } from '@/lib/DataContext';
import { hashPassword, upsertAccount, writeCredential } from '@/lib/auth';
import AboutPage from './AboutPage';

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
          <AboutPage />
        </DataProvider>
      </AuthProvider>
    </HelmetProvider>,
  );

describe('AboutPage staff access', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('hides Add history for a viewer', () => {
    seed('viewer');
    wrap();
    expect(screen.getByRole('heading', { name: 'About' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /add history/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /add member/i })).not.toBeInTheDocument();
  });

  it('opens Add history when ?new=1 for a writer', async () => {
    seed('admin');
    rtlRender(
      <StrictMode>
        <HelmetProvider>
          <MemoryRouter initialEntries={['/about?new=1']}>
            <AuthProvider>
              <DataProvider>
                <AboutPage />
              </DataProvider>
            </AuthProvider>
          </MemoryRouter>
        </HelmetProvider>
      </StrictMode>,
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Add history' })).toBeInTheDocument();
    });
    expect(screen.queryByRole('heading', { name: 'Add member' })).not.toBeInTheDocument();
  });

  it('opens Add member when ?new=member for a writer', async () => {
    seed('admin');
    rtlRender(
      <StrictMode>
        <HelmetProvider>
          <MemoryRouter initialEntries={['/about?new=member']}>
            <AuthProvider>
              <DataProvider>
                <AboutPage />
              </DataProvider>
            </AuthProvider>
          </MemoryRouter>
        </HelmetProvider>
      </StrictMode>,
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Add member' })).toBeInTheDocument();
    });
    expect(screen.queryByRole('heading', { name: 'Add history' })).not.toBeInTheDocument();
  });
});
