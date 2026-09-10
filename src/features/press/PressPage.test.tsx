import { StrictMode } from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter } from 'react-router-dom';
import { render, screen, waitFor } from '@/test/utils';
import { render as rtlRender } from '@testing-library/react';
import { AuthProvider } from '@/features/auth/useAuth';
import { DataProvider } from '@/lib/DataContext';
import { hashPassword, upsertAccount, writeCredential } from '@/lib/auth';
import { DEFAULT_PRESS_META } from '@/lib/press';
import PressPage from './PressPage';

const live = vi.hoisted(() => ({ on: false }));

vi.mock('@/lib/api/http', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/api/http')>();
  return { ...actual, isMockApi: () => !live.on };
});

vi.mock('@/lib/api/press', () => ({
  getPressMeta: () => Promise.reject(new Error('boom')),
  listPressNews: () => Promise.reject(new Error('boom')),
  listPressStills: () => Promise.reject(new Error('boom')),
  createPressNews: vi.fn(),
  createPressStill: vi.fn(),
  deletePressNews: vi.fn(),
  deletePressStill: vi.fn(),
  updatePressMeta: vi.fn(),
  updatePressNews: vi.fn(),
  updatePressStill: vi.fn(),
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
          <PressPage />
        </DataProvider>
      </AuthProvider>
    </HelmetProvider>,
  );

describe('PressPage staff access', () => {
  beforeEach(() => {
    localStorage.clear();
    live.on = false;
  });

  it('hides Add news for a viewer', () => {
    seed('viewer');
    wrap();
    expect(screen.getByRole('heading', { name: 'Press' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /add news/i })).not.toBeInTheDocument();
    expect(DEFAULT_PRESS_META.zipUrl).toMatch(/press-kit/);
  });

  it('opens Add news when ?new=1 for a writer', async () => {
    seed('admin');
    rtlRender(
      <StrictMode>
        <HelmetProvider>
          <MemoryRouter initialEntries={['/press?new=1']}>
            <AuthProvider>
              <DataProvider>
                <PressPage />
              </DataProvider>
            </AuthProvider>
          </MemoryRouter>
        </HelmetProvider>
      </StrictMode>,
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Add news' })).toBeInTheDocument();
    });
  });
});

describe('PressPage live lane', () => {
  beforeEach(() => {
    localStorage.clear();
    live.on = true;
    seed('admin');
  });

  it('shows Press request failed instead of empty news', async () => {
    wrap();
    expect(await screen.findByRole('alert')).toHaveTextContent('Press request failed.');
    expect(screen.queryByText('No press news')).not.toBeInTheDocument();
  });
});
