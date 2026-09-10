import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import CatalogStatus from './CatalogStatus';

const catalog = vi.hoisted(() => ({
  isLoading: false,
  error: null as Error | null,
  retry: vi.fn(),
}));

vi.mock('@/lib/DataContext', () => ({
  useData: () => catalog,
}));

describe('CatalogStatus', () => {
  beforeEach(() => {
    catalog.isLoading = false;
    catalog.error = null;
    catalog.retry.mockReset();
  });

  it('shows catalog copy when the core lane failed', () => {
    catalog.error = new Error('catalog');
    render(<CatalogStatus />);
    expect(screen.getByRole('alert')).toHaveTextContent('Catalog request failed.');
  });

  it('does not show catalog copy when only a side lane failed', () => {
    catalog.error = null;
    render(<CatalogStatus />);
    expect(screen.queryByText('Catalog request failed.')).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
