import { describe, it, expect } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { render, screen } from '@testing-library/react';
import { AuthProvider } from '@/features/auth/useAuth';
import { ThemeProvider } from '@/lib/theme';
import AuthLayout from '@/layouts/AuthLayout';
import LoginPage from '@/features/auth/LoginPage';
import RegisterPage from '@/features/auth/RegisterPage';
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
                <Route path="/register" element={<RegisterPage />} />
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

  it('keeps both forms glued and only slides the photo on login', () => {
    renderAuth('/login');
    const loginPane = screen.getByTestId('auth-split-form-login');
    const registerPane = screen.getByTestId('auth-split-form-register');
    expect(loginPane.className).not.toMatch(/translate-x-full/);
    expect(registerPane.className).not.toMatch(/translate-x-full/);
    expect(screen.getByTestId('auth-split-bg').className).toMatch(/translate-x-full/);
    expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
  });

  it('slides the photo left on register without moving the form panes', () => {
    renderAuth('/register');
    expect(screen.getByTestId('auth-split-card')).toHaveAttribute('data-view', 'register');
    expect(screen.getByTestId('auth-split-form-login').className).not.toMatch(/translate-x-full/);
    expect(screen.getByTestId('auth-split-form-register').className).not.toMatch(
      /translate-x-full/,
    );
    expect(screen.getByTestId('auth-split-bg').className).not.toMatch(/translate-x-full/);
    expect(screen.getByRole('heading', { name: /create a staff account/i })).toBeInTheDocument();
  });
});
