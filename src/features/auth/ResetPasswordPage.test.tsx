import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { AuthProvider } from './useAuth';
import { ThemeProvider } from '@/lib/theme';
import { getAccountByEmail, hashPassword, upsertAccount } from '@/lib/auth';
import ResetPasswordPage from './ResetPasswordPage';

function renderReset(path: string) {
  return render(
    <HelmetProvider>
      <ThemeProvider>
        <MemoryRouter initialEntries={[path]}>
          <AuthProvider>
            <Routes>
              <Route path="/reset-password/:token?" element={<ResetPasswordPage />} />
            </Routes>
          </AuthProvider>
        </MemoryRouter>
      </ThemeProvider>
    </HelmetProvider>,
  );
}

describe('ResetPasswordPage', () => {
  beforeEach(() => {
    localStorage.clear();
    upsertAccount({
      id: '1',
      email: 'reader@softgate.test',
      username: 'reader',
      displayName: 'Reader',
      role: 'super_admin',
      passwordHash: hashPassword('secret12'),
      createdAt: '2026-08-22',
    });
  });

  it('shows an incomplete link when no token is present', () => {
    renderReset('/reset-password');
    expect(screen.getByRole('heading', { name: /incomplete link/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /go to forgot password/i })).toHaveAttribute(
      'href',
      '/forgot-password',
    );
  });

  it('accepts new password fields with a token without saving', async () => {
    const user = userEvent.setup({ delay: null });
    renderReset('/reset-password/future-token');
    await user.type(document.getElementById('reset-new-password') as HTMLInputElement, 'changed99');
    await user.type(
      document.getElementById('reset-confirm-password') as HTMLInputElement,
      'changed99',
    );
    await user.click(screen.getByRole('button', { name: /set new password/i }));
    expect(screen.getByText(/demo password is unchanged/i)).toBeInTheDocument();
    expect(getAccountByEmail('reader@softgate.test')?.passwordHash).toBe(hashPassword('secret12'));
  });
});
