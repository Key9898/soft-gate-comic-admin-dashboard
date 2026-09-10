import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@/lib/theme';
import DashboardPage from './DashboardPage';

vi.mock('@/lib/api/http', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/api/http')>();
  return { ...actual, isMockApi: () => false };
});

vi.mock('@/lib/DataContext', () => ({
  useData: () => ({
    revenueData: [],
    userGrowthData: [],
    popularWebtoons: [],
    webtoons: [],
    episodes: [],
    users: [],
    readerUsers: [],
    comments: [],
    readerComments: [],
    transactions: [],
    isLoading: false,
    commentsLoading: false,
    commentsError: null,
    usersLoading: false,
    usersError: null,
  }),
}));

const wrap = () =>
  render(
    <HelmetProvider>
      <MemoryRouter>
        <ThemeProvider>
          <DashboardPage />
        </ThemeProvider>
      </MemoryRouter>
    </HelmetProvider>,
  );

describe('DashboardPage live desk', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('does not leak mock charts or purchase totals', () => {
    wrap();
    expect(screen.queryByText('The Last Horizon')).not.toBeInTheDocument();
    expect(screen.queryByText('$29.98')).not.toBeInTheDocument();
    expect(screen.queryByText('$75,400')).not.toBeInTheDocument();
    expect(screen.getAllByText('Not wired on live').length).toBeGreaterThan(0);
  });
});
