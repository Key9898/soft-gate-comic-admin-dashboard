import { describe, it, expect, beforeEach } from 'vitest';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { DataProvider } from '@/lib/DataContext';
import { ThemeProvider } from '@/lib/theme';
import DashboardPage from './DashboardPage';

const wrap = () =>
  render(
    <HelmetProvider>
      <MemoryRouter>
        <ThemeProvider>
          <DataProvider>
            <DashboardPage />
          </DataProvider>
        </ThemeProvider>
      </MemoryRouter>
    </HelmetProvider>,
  );

describe('DashboardPage mock desk', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('still shows demo series and purchase totals', () => {
    wrap();
    expect(screen.getByText('The Last Horizon')).toBeInTheDocument();
    expect(screen.getByText('$29.98')).toBeInTheDocument();
    expect(screen.queryByText('Not wired on live')).not.toBeInTheDocument();
  });
});
