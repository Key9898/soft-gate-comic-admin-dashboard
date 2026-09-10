import { describe, it, expect, beforeEach } from 'vitest';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { DataProvider } from '@/lib/DataContext';
import { ThemeProvider } from '@/lib/theme';
import AnalyticsPage from './AnalyticsPage';

const wrap = () =>
  render(
    <HelmetProvider>
      <MemoryRouter>
        <ThemeProvider>
          <DataProvider>
            <AnalyticsPage />
          </DataProvider>
        </ThemeProvider>
      </MemoryRouter>
    </HelmetProvider>,
  );

describe('AnalyticsPage mock desk', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('still shows demo revenue and series names', () => {
    wrap();
    expect(screen.getByText('$75,400')).toBeInTheDocument();
    expect(screen.getAllByText('Love in Seoul').length).toBeGreaterThan(0);
    expect(screen.queryByText('Not wired on live')).not.toBeInTheDocument();
  });
});
