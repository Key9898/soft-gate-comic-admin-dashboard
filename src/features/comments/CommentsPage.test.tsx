import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { AuthProvider } from '@/features/auth/useAuth';
import { hashPassword, upsertAccount, writeCredential } from '@/lib/auth';
import CommentsPage from './CommentsPage';

const live = vi.hoisted(() => ({
  commentsLoading: false,
  commentsError: new Error('boom') as Error | null,
  retry: vi.fn(),
  reloadCatalog: vi.fn(),
}));

vi.mock('@/lib/api/http', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/api/http')>();
  return { ...actual, isMockApi: () => false };
});

vi.mock('@/lib/DataContext', () => ({
  useData: () => ({
    readerComments: [],
    readerUsers: [],
    setActivityLogs: vi.fn(),
    commentsLoading: live.commentsLoading,
    commentsError: live.commentsError,
    reloadCatalog: live.reloadCatalog,
    retry: live.retry,
  }),
}));

const seed = () => {
  const passwordHash = hashPassword('password1');
  const account = {
    id: '1',
    email: 'staff@test.com',
    username: 'staff',
    displayName: 'Staff',
    role: 'admin' as const,
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
          <CommentsPage />
        </AuthProvider>
      </MemoryRouter>
    </HelmetProvider>,
  );

describe('CommentsPage live lane', () => {
  beforeEach(() => {
    localStorage.clear();
    live.commentsLoading = false;
    live.commentsError = new Error('boom');
    live.retry.mockReset();
    live.reloadCatalog.mockReset();
    seed();
  });

  it('shows Comments request failed instead of an empty list', () => {
    wrap();
    expect(screen.getByRole('alert')).toHaveTextContent('Comments request failed.');
    expect(screen.queryByText('No reader comments')).not.toBeInTheDocument();
  });
});
