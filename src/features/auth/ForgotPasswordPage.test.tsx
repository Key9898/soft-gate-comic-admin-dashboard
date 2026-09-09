import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { AuthProvider } from './useAuth';
import { ThemeProvider } from '@/lib/theme';
import {
  DEMO_PASSWORD_RESET_OTP,
  getAccountByEmail,
  hashPassword,
  upsertAccount,
  verifyPassword,
} from '@/lib/auth';
import ForgotPasswordPage from './ForgotPasswordPage';

function renderForgot() {
  return render(
    <HelmetProvider>
      <ThemeProvider>
        <MemoryRouter initialEntries={['/forgot-password']}>
          <AuthProvider>
            <Routes>
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            </Routes>
          </AuthProvider>
        </MemoryRouter>
      </ThemeProvider>
    </HelmetProvider>,
  );
}

describe('ForgotPasswordPage', () => {
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

  it('walks email, mock OTP, and saves the new password', async () => {
    const user = userEvent.setup({ delay: null });
    renderForgot();
    await user.type(screen.getByLabelText(/email/i), 'reader@softgate.test');
    await user.click(screen.getByRole('button', { name: /continue/i }));
    expect(screen.getByText(/not emailed/i)).toBeInTheDocument();
    await user.type(screen.getByLabelText(/one-time code/i), DEMO_PASSWORD_RESET_OTP);
    await user.click(screen.getByRole('button', { name: /verify code/i }));
    await user.type(
      document.getElementById('forgot-new-password') as HTMLInputElement,
      'changed99',
    );
    await user.type(
      document.getElementById('forgot-confirm-password') as HTMLInputElement,
      'changed99',
    );
    await user.click(screen.getByRole('button', { name: /set new password/i }));
    expect(screen.getByText(/password was updated in this browser/i)).toBeInTheDocument();
    const account = getAccountByEmail('reader@softgate.test');
    expect(account?.passwordHash).toBeTruthy();
    expect(verifyPassword('changed99', account?.passwordHash ?? '')).toBe(true);
  });

  it('links back to login', () => {
    renderForgot();
    expect(screen.getByRole('link', { name: /back to login/i })).toHaveAttribute('href', '/login');
  });
});
