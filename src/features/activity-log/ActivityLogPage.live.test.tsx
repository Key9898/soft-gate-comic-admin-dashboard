import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import ActivityLogPage from './ActivityLogPage';

vi.mock('@/lib/api/http', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/api/http')>();
  return { ...actual, isMockApi: () => false };
});

vi.mock('@/lib/DataContext', () => ({
  useData: () => ({
    activityLogs: [],
    isLoading: false,
  }),
}));

const wrap = () =>
  render(
    <HelmetProvider>
      <MemoryRouter>
        <ActivityLogPage />
      </MemoryRouter>
    </HelmetProvider>,
  );

describe('ActivityLogPage live desk', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('does not leak mock catalog seeds', () => {
    wrap();
    expect(screen.queryByText('Admin User')).not.toBeInTheDocument();
    expect(screen.queryByText(/The Last Horizon/)).not.toBeInTheDocument();
    expect(screen.getByText('This session only')).toBeInTheDocument();
    expect(screen.getByText('No activity yet')).toBeInTheDocument();
  });
});
