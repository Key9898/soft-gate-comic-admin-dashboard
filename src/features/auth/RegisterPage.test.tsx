import { describe, it, expect } from 'vitest';
import userEvent from '@testing-library/user-event';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@/lib/theme';
import { AuthProvider } from './useAuth';
import RegisterPage from './RegisterPage';

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

describe('RegisterPage', () => {
  it('blocks submit until terms are accepted', async () => {
    const user = userEvent.setup({ delay: null });
    wrap(<RegisterPage />);
    await user.type(screen.getByLabelText(/username/i), 'newadmin');
    await user.type(screen.getByLabelText(/display name/i), 'New Admin');
    await user.type(screen.getByLabelText(/email/i), 'new@softgate.test');
    await user.type(document.getElementById('register-password') as HTMLInputElement, 'secret12');
    await user.type(
      document.getElementById('register-confirm-password') as HTMLInputElement,
      'secret12',
    );
    await user.click(screen.getByRole('button', { name: /create account/i }));
    expect(screen.getByText(/agree to the terms and privacy/i)).toBeInTheDocument();
  });

  it('rejects passwords shorter than 8 characters', async () => {
    const user = userEvent.setup({ delay: null });
    wrap(<RegisterPage />);
    await user.type(screen.getByLabelText(/username/i), 'newadmin');
    await user.type(screen.getByLabelText(/display name/i), 'New Admin');
    await user.type(screen.getByLabelText(/email/i), 'new@softgate.test');
    await user.type(document.getElementById('register-password') as HTMLInputElement, 'secret1');
    await user.type(
      document.getElementById('register-confirm-password') as HTMLInputElement,
      'secret1',
    );
    await user.click(screen.getByRole('checkbox'));
    await user.click(screen.getByRole('button', { name: /create account/i }));
    expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument();
  });
});
