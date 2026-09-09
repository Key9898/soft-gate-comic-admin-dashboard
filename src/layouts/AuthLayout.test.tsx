import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryRouter, Navigate, Route, Routes } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { render, screen } from '@testing-library/react';
import { AuthProvider } from '@/features/auth/useAuth';
import { ThemeProvider } from '@/lib/theme';
import AuthLayout from '@/layouts/AuthLayout';
import LoginPage from '@/features/auth/LoginPage';
import SetupPage from '@/features/auth/SetupPage';
import ForgotPasswordPage from '@/features/auth/ForgotPasswordPage';

function renderAuth(path: string) {
  return render(
    <HelmetProvider>
      <ThemeProvider>
        <MemoryRouter initialEntries={[path]}>
          <AuthProvider>
            <Routes>
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/setup" element={<SetupPage />} />
                <Route path="/register" element={<Navigate to="/login" replace />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              </Route>
            </Routes>
          </AuthProvider>
        </MemoryRouter>
      </ThemeProvider>
    </HelmetProvider>,
  );
}

describe('AuthLayout', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('shows skip link, logo, and no catalog nav', () => {
    renderAuth('/login');
    expect(screen.getByRole('link', { name: /skip to content/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /softgate comic/i })).toHaveAttribute('href', '/login');
    expect(screen.queryByRole('link', { name: /^webtoons$/i })).not.toBeInTheDocument();
  });

  it('does not use the split card on forgot-password', () => {
    renderAuth('/forgot-password');
    expect(screen.queryByTestId('auth-split-card')).not.toBeInTheDocument();
  });

  it('uses the split card on login without Sign Up', () => {
    renderAuth('/login');
    expect(screen.getByTestId('auth-split-card')).toHaveAttribute('data-view', 'login');
    expect(screen.getByTestId('auth-split-form-login')).toBeInTheDocument();
    expect(screen.getByTestId('auth-split-form-setup')).toBeInTheDocument();
    expect(screen.queryByTestId('auth-split-form-register')).not.toBeInTheDocument();
    expect(screen.getByTestId('auth-split-bg').className).toMatch(/translate-x-full/);
    expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /sign up/i })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /create the first super admin/i })).toBeInTheDocument();
  });

  it('slides the photo over sign in on setup', () => {
    renderAuth('/setup');
    expect(screen.getByTestId('auth-split-card')).toHaveAttribute('data-view', 'setup');
    expect(screen.getByTestId('auth-split-form-setup')).toBeInTheDocument();
    expect(screen.getByTestId('auth-split-bg').className).not.toMatch(/translate-x-full/);
    expect(
      screen.getByRole('heading', { name: /create the first super admin/i }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /sign up/i })).not.toBeInTheDocument();
  });

  it('sends /register to login', () => {
    renderAuth('/register');
    expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByTestId('auth-split-card')).toBeInTheDocument();
  });
});
