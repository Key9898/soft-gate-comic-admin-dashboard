import { describe, it, expect } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { DataProvider, useData } from './DataContext';
import { SHARED_DATA_SCHEMA_VERSION, SHARED_DATA_STORAGE_KEY } from '@softgate/shared';

const wrapper = ({ children }: { children: ReactNode }) => <DataProvider>{children}</DataProvider>;

describe('DataContext catalog loading', () => {
  it('mock path settles with no error and a retry function', async () => {
    const { result } = renderHook(() => useData(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBeNull();
    expect(typeof result.current.retry).toBe('function');
  });

  it('merges portal-safe settings into the schema 14 blob', async () => {
    renderHook(() => useData(), { wrapper });

    await waitFor(() => {
      expect(localStorage.getItem(SHARED_DATA_STORAGE_KEY)).toBeTruthy();
    });

    const raw = localStorage.getItem(SHARED_DATA_STORAGE_KEY);
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(raw!) as {
      schemaVersion: number;
      data: { settings?: Record<string, unknown>; coinPackages?: unknown[] };
    };
    expect(parsed.schemaVersion).toBe(SHARED_DATA_SCHEMA_VERSION);
    expect(parsed.data.settings).toMatchObject({
      maintenanceMode: false,
      allowRegistration: true,
      contactEmail: 'admin@softgatecomic.com',
      defaultLanguage: 'en',
    });
    expect(parsed.data.settings).not.toHaveProperty('requireEmailVerification');
    expect(parsed.data.settings).not.toHaveProperty('notifications');
    expect(parsed.data.coinPackages).toHaveLength(6);
  });
});
