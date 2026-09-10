import { StrictMode } from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter } from 'react-router-dom';
import { render, screen, waitFor } from '@/test/utils';
import { render as rtlRender } from '@testing-library/react';
import { AuthProvider } from '@/features/auth/useAuth';
import { DataProvider } from '@/lib/DataContext';
import { hashPassword, upsertAccount, writeCredential } from '@/lib/auth';
import { DEFAULT_FAQ_ITEMS } from '@/lib/faq';
import FaqPage from './FaqPage';

const live = vi.hoisted(() => ({ on: false }));

vi.mock('@/lib/api/http', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/api/http')>();
  return { ...actual, isMockApi: () => !live.on };
});

vi.mock('@/lib/api/faq', () => ({
  listFaqItems: () => Promise.reject(new Error('boom')),
  createFaqItem: vi.fn(),
  updateFaqItem: vi.fn(),
  deleteFaqItem: vi.fn(),
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
          <FaqPage />
        </DataProvider>
      </AuthProvider>
    </HelmetProvider>,
  );

describe('FaqPage staff access', () => {
  beforeEach(() => {
    localStorage.clear();
    live.on = false;
  });

  it('hides Add FAQ for a viewer', () => {
    seed('viewer');
    wrap();
    expect(screen.getByRole('heading', { name: 'FAQ' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /add faq/i })).not.toBeInTheDocument();
    expect(DEFAULT_FAQ_ITEMS[0]?.id).toBe('q1');
  });

  it('opens Add FAQ when ?new=1 for a writer', async () => {
    seed('admin');
    rtlRender(
      <StrictMode>
        <HelmetProvider>
          <MemoryRouter initialEntries={['/faq?new=1']}>
            <AuthProvider>
              <DataProvider>
                <FaqPage />
              </DataProvider>
            </AuthProvider>
          </MemoryRouter>
        </HelmetProvider>
      </StrictMode>,
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Add FAQ' })).toBeInTheDocument();
    });
  });
});

describe('FaqPage live lane', () => {
  beforeEach(() => {
    localStorage.clear();
    live.on = true;
    seed('admin');
  });

  it('shows FAQ request failed instead of empty items', async () => {
    wrap();
    expect(await screen.findByRole('alert')).toHaveTextContent('FAQ request failed.');
    expect(screen.queryByText('No FAQ items')).not.toBeInTheDocument();
  });
});
