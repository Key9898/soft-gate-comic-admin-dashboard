import { describe, it, expect, beforeEach } from 'vitest';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider } from '@/features/auth/useAuth';
import { DataProvider } from '@/lib/DataContext';
import { hashPassword, upsertAccount, writeCredential } from '@/lib/auth';
import WebtoonEditorPage from './WebtoonEditorPage';

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

const wrap = (path: string) =>
  render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[path]}>
        <AuthProvider>
          <DataProvider>
            <Routes>
              <Route path="/webtoons/new" element={<WebtoonEditorPage />} />
              <Route path="/webtoons/:webtoonId/edit" element={<WebtoonEditorPage />} />
              <Route path="/webtoons" element={<PathProbe />} />
            </Routes>
          </DataProvider>
        </AuthProvider>
      </MemoryRouter>
    </HelmetProvider>,
  );

describe('WebtoonEditorPage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('shows the create page without a dialog', async () => {
    seed('admin');
    wrap('/webtoons/new');
    expect(await screen.findByRole('heading', { name: 'Add Webtoon' })).toBeInTheDocument();
    expect(screen.getAllByText('Choose from Media').length).toBeGreaterThan(0);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('redirects a viewer away from the editor', async () => {
    seed('viewer');
    wrap('/webtoons/new');
    await waitFor(() => {
      expect(screen.getByTestId('path')).toHaveTextContent('/webtoons');
    });
  });

  it('shows not-found after catalog load for an unknown id', async () => {
    seed('admin');
    wrap('/webtoons/missing-id/edit');
    expect(await screen.findByRole('heading', { name: 'Webtoon not found' })).toBeInTheDocument();
  });
});
