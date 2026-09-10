import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@/lib/theme';
import AnalyticsPage from './AnalyticsPage';

vi.mock('@/lib/api/http', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/api/http')>();
  return { ...actual, isMockApi: () => false };
});

vi.mock('@/lib/DataContext', () => ({
  useData: () => ({
    revenueData: [],
    userGrowthData: [],
    popularWebtoons: [],
    genres: [],
    users: [],
    webtoons: [],
    isLoading: false,
  }),
}));

const wrap = () =>
  render(
    <HelmetProvider>
      <MemoryRouter>
        <ThemeProvider>
          <AnalyticsPage />
        </ThemeProvider>
      </MemoryRouter>
    </HelmetProvider>,
  );

describe('AnalyticsPage live desk', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('does not leak mock revenue or series names', () => {
    wrap();
    expect(screen.queryByText('$75,400')).not.toBeInTheDocument();
    expect(screen.queryByText('The Last Horizon')).not.toBeInTheDocument();
    expect(screen.queryByText('Love in Seoul')).not.toBeInTheDocument();
    expect(screen.getByText('Revenue Trend')).toBeInTheDocument();
    expect(screen.getByText('Genre Distribution')).toBeInTheDocument();
    expect(screen.getAllByText('Not wired on live').length).toBeGreaterThan(0);
  });
});
