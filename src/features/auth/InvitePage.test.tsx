import { describe, it, expect, beforeEach } from 'vitest';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@/lib/theme';
import { AuthProvider } from './useAuth';
import { createInvite, hashPassword, upsertAccount, writeCredential } from '@/lib/auth';
import InvitePage from './InvitePage';

const wrap = (token: string) =>
  render(
    <HelmetProvider>
      <ThemeProvider>
        <MemoryRouter initialEntries={[`/invite/${token}`]}>
          <AuthProvider>
            <Routes>
              <Route path="/invite/:token" element={<InvitePage />} />
            </Routes>
          </AuthProvider>
        </MemoryRouter>
      </ThemeProvider>
    </HelmetProvider>,
  );

describe('InvitePage', () => {
  beforeEach(() => {
    localStorage.clear();
    const passwordHash = hashPassword('password1');
    upsertAccount({
      id: '1',
      email: 'admin@test.com',
      username: 'admin',
      displayName: 'Admin',
      role: 'super_admin',
      createdAt: '2026-08-23',
      passwordHash,
    });
    writeCredential('admin@test.com', passwordHash);
  });

  it('shows a generic invalid message for a bad token', () => {
    wrap('not-a-real-token');
    expect(screen.getByRole('heading', { name: /this invite is not valid/i })).toBeInTheDocument();
  });

  it('locks the invited email on a valid token', () => {
    const { rawToken } = createInvite({
      email: 'editor@test.com',
      inviterId: '1',
      actorRole: 'super_admin',
    });
    wrap(rawToken);
    expect(screen.getByRole('heading', { name: /join the staff team/i })).toBeInTheDocument();
    expect(screen.getByDisplayValue('editor@test.com')).toBeInTheDocument();
  });
});
