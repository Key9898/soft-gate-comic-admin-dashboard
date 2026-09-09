import { describe, it, expect, beforeEach } from 'vitest';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { render as rtlRender, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider } from '@/features/auth/useAuth';
import { hashPassword, upsertAccount, writeCredential } from '@/lib/auth';
import { ROLE_BLURBS, SUPER_ADMIN_BLURB } from '@/lib/auth/staffAccess';
import HelpPage from './HelpPage';
import {
  ADMIN_INVITE,
  ADMIN_SIGNIN,
  BUSINESS_NOTE,
  CATALOG_NOTES,
  COMMUNITY_NOTE,
  OVERVIEW_DATA_MOCK,
} from './handbook';

const PathProbe = () => {
  const location = useLocation();
  return <div data-testid="path">{location.pathname}</div>;
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

const wrap = (path = '/help') =>
  rtlRender(
    <HelmetProvider>
      <MemoryRouter initialEntries={[path]}>
        <AuthProvider>
          <Routes>
            <Route path="/help" element={<HelpPage />} />
            <Route path="*" element={<PathProbe />} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    </HelmetProvider>,
  );

describe('HelpPage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('shows Overview desk-owner and mock data, not Create slugs', () => {
    seed('admin');
    wrap();
    expect(screen.getByRole('heading', { name: 'Help' })).toBeInTheDocument();
    expect(screen.getByText(/email the desk owner/i)).toBeInTheDocument();
    expect(screen.getByText(OVERVIEW_DATA_MOCK)).toBeInTheDocument();
    expect(screen.queryByText(/Reach the SoftGate team/i)).not.toBeInTheDocument();
    expect(screen.queryByText('webtoon.new')).not.toBeInTheDocument();
  });

  it('shows catalog schedule, coin, and bulk PDF honesty', async () => {
    const user = userEvent.setup({ delay: null });
    seed('admin');
    wrap();
    await user.click(screen.getByRole('tab', { name: 'Catalog' }));
    expect(screen.getByText(CATALOG_NOTES[2].body)).toBeInTheDocument();
    expect(screen.getByText(/existing draft or scheduled episode/i)).toBeInTheDocument();
    expect(screen.getByText(/not a payments API/i)).toBeInTheDocument();
    expect(screen.getByText(/Bulk Upload \(PDF split\) is mock desk only/i)).toBeInTheDocument();
  });

  it('shows community mock copy for Member and Viewer, not viewer-only', async () => {
    const user = userEvent.setup({ delay: null });
    seed('member');
    wrap();
    await user.click(screen.getByRole('tab', { name: 'Community' }));
    expect(screen.getByText(COMMUNITY_NOTE.body)).toBeInTheDocument();
    expect(screen.getByText(/Member and Viewer can look only/i)).toBeInTheDocument();
    expect(screen.queryByText(/viewer only/i)).not.toBeInTheDocument();
  });

  it('shows business mock copy', async () => {
    const user = userEvent.setup({ delay: null });
    seed('admin');
    wrap();
    await user.click(screen.getByRole('tab', { name: 'Business' }));
    expect(screen.getByText(BUSINESS_NOTE.body)).toBeInTheDocument();
  });

  it('shows all role blurbs and invite copy-link on Admin', async () => {
    const user = userEvent.setup({ delay: null });
    seed('admin');
    wrap();
    await user.click(screen.getByRole('tab', { name: 'Admin' }));
    expect(screen.getByText(SUPER_ADMIN_BLURB)).toBeInTheDocument();
    expect(screen.getByText(ROLE_BLURBS.admin)).toBeInTheDocument();
    expect(screen.getByText(ROLE_BLURBS.member)).toBeInTheDocument();
    expect(screen.getByText(ROLE_BLURBS.viewer)).toBeInTheDocument();
    expect(screen.getByText(ADMIN_SIGNIN)).toBeInTheDocument();
    expect(screen.getByText(ADMIN_INVITE)).toBeInTheDocument();
  });

  it('hides Create slugs for a viewer on Commands', async () => {
    seed('viewer');
    wrap('/help?tab=commands');
    await waitFor(() => {
      expect(screen.getByText('authors')).toBeInTheDocument();
    });
    expect(screen.queryByText('webtoon.new')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: /admin@softgatecomic.com/i }),
    ).not.toBeInTheDocument();
  });

  it('shows Create slugs for a writer on Commands', async () => {
    seed('admin');
    wrap('/help?tab=commands');
    await waitFor(() => {
      expect(screen.getByText('webtoon.new')).toBeInTheDocument();
    });
    expect(
      screen.queryByRole('link', { name: /admin@softgatecomic.com/i }),
    ).not.toBeInTheDocument();
  });

  it('navigates to Authors from a go row', async () => {
    const user = userEvent.setup({ delay: null });
    seed('admin');
    wrap('/help?tab=commands');
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /go to authors/i })).toBeInTheDocument();
    });
    await user.click(screen.getByRole('button', { name: /go to authors/i }));
    expect(screen.getByTestId('path')).toHaveTextContent('/authors');
  });
});
