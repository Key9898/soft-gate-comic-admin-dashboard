import { describe, it, expect } from 'vitest';
import userEvent from '@testing-library/user-event';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@/lib/theme';
import { AuthProvider } from './useAuth';
import LoginPage from './LoginPage';

const wrap = (ui: React.ReactElement) =>
  render(
    <HelmetProvider>
      <ThemeProvider>
        <MemoryRouter>
          <AuthProvider>{ui}</AuthProvider>
        </MemoryRouter>
      </ThemeProvider>
    </HelmetProvider>,
  );

describe('LoginPage', () => {
  it('renders sign in form', () => {
    wrap(<LoginPage />);
    expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('has link to forgot password', () => {
    wrap(<LoginPage />);
    expect(screen.getByRole('link', { name: /forgot password/i })).toHaveAttribute(
      'href',
      '/forgot-password',
    );
  });

  it('rejects passwords shorter than 8 characters', async () => {
    const user = userEvent.setup({ delay: null });
    wrap(<LoginPage />);
    await user.type(screen.getByLabelText(/email/i), 'a@b.co');
    await user.type(document.getElementById('login-password') as HTMLInputElement, 'secret1');
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument();
  });
});
