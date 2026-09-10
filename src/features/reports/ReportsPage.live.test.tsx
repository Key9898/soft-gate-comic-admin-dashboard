import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { AuthProvider } from '@/features/auth/useAuth';
import { ToastProvider } from '@/components/Toast';
import { hashPassword, upsertAccount, writeCredential } from '@/lib/auth';
import ReportsPage from './ReportsPage';

vi.mock('@/lib/api/http', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/api/http')>();
  return { ...actual, isMockApi: () => false };
});

vi.mock('@/lib/DataContext', () => ({
  useData: () => ({
    reports: [],
    setReports: vi.fn(),
    setActivityLogs: vi.fn(),
    isLoading: false,
  }),
}));

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
        <ToastProvider>
          <AuthProvider>
            <ReportsPage />
          </AuthProvider>
        </ToastProvider>
      </MemoryRouter>
    </HelmetProvider>,
  );

describe('ReportsPage live desk', () => {
  beforeEach(() => {
    localStorage.clear();
    seed();
  });

  it('does not leak mock reporters', () => {
    wrap();
    expect(screen.queryByText('john_doe')).not.toBeInTheDocument();
    expect(screen.getAllByText('Not wired on live').length).toBeGreaterThan(0);
    expect(screen.getByText('This desk has no reports API.')).toBeInTheDocument();
  });
});
