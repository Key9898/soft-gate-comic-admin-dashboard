import { describe, it, expect, beforeEach } from 'vitest';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider } from '@/features/auth/useAuth';
import { DataProvider } from '@/lib/DataContext';
import { hashPassword, upsertAccount, writeCredential } from '@/lib/auth';
import WebtoonsPage from './WebtoonsPage';

const PathProbe = () => {
  const location = useLocation();
  return <div data-testid="path">{`${location.pathname}${location.search}`}</div>;
};

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

const wrap = (path = '/webtoons') =>
  render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[path]}>
        <AuthProvider>
          <DataProvider>
            <Routes>
              <Route path="/webtoons" element={<WebtoonsPage />} />
              <Route path="/webtoons/new" element={<PathProbe />} />
              <Route path="/webtoons/:webtoonId/edit" element={<PathProbe />} />
            </Routes>
          </DataProvider>
        </AuthProvider>
      </MemoryRouter>
    </HelmetProvider>,
  );

describe('WebtoonsPage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('navigates to the in-page editor instead of an add modal', async () => {
    const user = userEvent.setup({ delay: null });
    seed('admin');
    wrap();
    expect(screen.getByRole('heading', { name: 'Webtoons' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /add webtoon/i }));
    expect(screen.getByTestId('path')).toHaveTextContent('/webtoons/new');
    expect(screen.queryByRole('heading', { name: 'Add New Webtoon' })).not.toBeInTheDocument();
  });

  it('opens Edit on the editor route', async () => {
    const user = userEvent.setup({ delay: null });
    seed('admin');
    wrap();
    await user.click(screen.getAllByRole('button', { name: 'Webtoon actions menu' })[0]);
    await user.click(screen.getByRole('button', { name: 'Edit' }));
    expect(screen.getByTestId('path')).toHaveTextContent('/webtoons/1/edit');
    expect(screen.queryByRole('heading', { name: 'Edit Webtoon' })).not.toBeInTheDocument();
  });

  it('replaces ?new=1 with /webtoons/new', async () => {
    seed('admin');
    wrap('/webtoons?new=1');
    await waitFor(() => {
      expect(screen.getByTestId('path')).toHaveTextContent('/webtoons/new');
    });
  });

  it('keeps the delete confirm modal', async () => {
    const user = userEvent.setup({ delay: null });
    seed('admin');
    wrap();
    await user.click(screen.getAllByRole('button', { name: 'Webtoon actions menu' })[0]);
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    expect(screen.getByRole('heading', { name: 'Delete Webtoon' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /close modal/i })).toBeInTheDocument();
  });
});
