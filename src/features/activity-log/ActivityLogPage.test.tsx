import { describe, it, expect, beforeEach } from 'vitest';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { DataProvider } from '@/lib/DataContext';
import ActivityLogPage from './ActivityLogPage';

const wrap = () =>
  render(
    <HelmetProvider>
      <MemoryRouter>
        <DataProvider>
          <ActivityLogPage />
        </DataProvider>
      </MemoryRouter>
    </HelmetProvider>,
  );

describe('ActivityLogPage mock desk', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('still shows demo logs', () => {
    wrap();
    expect(screen.getByText('Admin User')).toBeInTheDocument();
    expect(screen.getByText(/The Last Horizon/)).toBeInTheDocument();
    expect(screen.queryByText('This session only')).not.toBeInTheDocument();
  });
});
