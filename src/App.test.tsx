import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import type { ReactNode } from 'react';
import { ThemeProvider } from '@/lib/theme';
import { ToastProvider } from './components/Toast';
import { DataProvider } from '@/lib/DataContext';
import { AuthProvider } from '@/features/auth/useAuth';
import { MemoryRouter } from 'react-router-dom';
import DashboardPage from '@/features/dashboard/DashboardPage';
import App from './App';

const shell = ({ children }: { children: ReactNode }) => (
  <HelmetProvider>
    <ThemeProvider>
      <ToastProvider>{children}</ToastProvider>
    </ThemeProvider>
  </HelmetProvider>
);

describe('App splash', () => {
  it('does not render a full-screen Loading... splash', () => {
    render(shell({ children: <App /> }));
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });
});

describe('Dashboard mock load', () => {
  it('has no busy region after the first tick', async () => {
    render(
      shell({
        children: (
          <AuthProvider>
            <DataProvider>
              <MemoryRouter>
                <DashboardPage />
              </MemoryRouter>
            </DataProvider>
          </AuthProvider>
        ),
      }),
    );

    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
    expect(screen.getByRole('heading', { name: /dashboard/i })).toBeInTheDocument();
  });
});
