import { describe, it, expect, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@/lib/theme';
import { AuthProvider } from './useAuth';
import SetupPage from './SetupPage';

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

describe('SetupPage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('blocks submit until terms are accepted', async () => {
    const user = userEvent.setup({ delay: null });
    wrap(<SetupPage />);
    expect(
      screen.getByRole('heading', { name: /create the first super admin/i }),
    ).toBeInTheDocument();
    await user.type(screen.getByLabelText(/username/i), 'newadmin');
    await user.type(screen.getByLabelText(/display name/i), 'New Admin');
    await user.type(screen.getByLabelText(/email/i), 'new@softgate.test');
    await user.type(document.getElementById('setup-password') as HTMLInputElement, 'secret12');
    await user.type(
      document.getElementById('setup-confirm-password') as HTMLInputElement,
      'secret12',
    );
    await user.click(screen.getByRole('button', { name: /create super admin/i }));
    expect(screen.getByText(/agree to the terms and privacy/i)).toBeInTheDocument();
  });

  it('rejects passwords shorter than 8 characters', async () => {
    const user = userEvent.setup({ delay: null });
    wrap(<SetupPage />);
    await user.type(screen.getByLabelText(/username/i), 'newadmin');
    await user.type(screen.getByLabelText(/display name/i), 'New Admin');
    await user.type(screen.getByLabelText(/email/i), 'new@softgate.test');
    await user.type(document.getElementById('setup-password') as HTMLInputElement, 'secret1');
    await user.type(
      document.getElementById('setup-confirm-password') as HTMLInputElement,
      'secret1',
    );
    await user.click(screen.getByRole('checkbox'));
    await user.click(screen.getByRole('button', { name: /create super admin/i }));
    expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument();
  });
});
