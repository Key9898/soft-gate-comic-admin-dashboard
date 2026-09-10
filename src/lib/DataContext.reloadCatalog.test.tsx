import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import type { ReactNode } from 'react';
import { ApiError } from '@/lib/api/http';

const mocks = vi.hoisted(() => ({
  loadCatalog: vi.fn(),
  listMedia: vi.fn(),
  listCoinPackages: vi.fn(),
  listComments: vi.fn(),
  listReaderUsers: vi.fn(),
  listNotifications: vi.fn(),
  getPlatformSettings: vi.fn(),
  listAboutHistories: vi.fn(),
  listAboutTeamMembers: vi.fn(),
  getAboutTeamMeta: vi.fn(),
}));

vi.mock('@/lib/api/http', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/api/http')>();
  return {
    ...actual,
    isMockApi: () => false,
  };
});

vi.mock('@/lib/api/catalog', () => ({ loadCatalog: mocks.loadCatalog }));
vi.mock('@/lib/api/media', () => ({ listMedia: mocks.listMedia }));
vi.mock('@/lib/api/coinPackages', () => ({ listCoinPackages: mocks.listCoinPackages }));
vi.mock('@/lib/api/comments', () => ({ listComments: mocks.listComments }));
vi.mock('@/lib/api/users', () => ({ listReaderUsers: mocks.listReaderUsers }));
vi.mock('@/lib/api/notifications', () => ({ listNotifications: mocks.listNotifications }));
vi.mock('@/lib/api/settings', () => ({ getPlatformSettings: mocks.getPlatformSettings }));
vi.mock('@/lib/api/aboutHistory', () => ({ listAboutHistories: mocks.listAboutHistories }));
vi.mock('@/lib/api/aboutTeam', () => ({
  listAboutTeamMembers: mocks.listAboutTeamMembers,
  getAboutTeamMeta: mocks.getAboutTeamMeta,
}));

import { DataProvider, useData } from './DataContext';

const wrapper = ({ children }: { children: ReactNode }) => <DataProvider>{children}</DataProvider>;

const catalogOk = {
  authors: [],
  genres: [],
  webtoons: [{ id: 'wt-1', title: { en: 'Live Series', mm: '' } }],
  episodes: [],
};

const fail500 = () => Promise.reject(new ApiError(500, 'Internal Server Error'));

function stubSatellites() {
  mocks.listMedia.mockResolvedValue({ files: [] });
  mocks.listCoinPackages.mockResolvedValue({ coinPackages: [] });
  mocks.listComments.mockRejectedValue(new ApiError(500, 'Internal Server Error'));
  mocks.listReaderUsers.mockResolvedValue({ users: [] });
  mocks.listNotifications.mockResolvedValue({ notifications: [] });
  mocks.getPlatformSettings.mockResolvedValue({
    settings: {
      maintenanceMode: false,
      allowRegistration: true,
      contactEmail: 'admin@softgatecomic.com',
      defaultLanguage: 'en',
    },
  });
  mocks.listAboutHistories.mockRejectedValue(new ApiError(500, 'Internal Server Error'));
  mocks.listAboutTeamMembers.mockResolvedValue({ members: [] });
  mocks.getAboutTeamMeta.mockResolvedValue({
    meta: {
      deck: { en: '', mm: '' },
      standInNote: { en: '', mm: '' },
      standInVisible: false,
    },
  });
}

describe('DataContext live reloadCatalog', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    stubSatellites();
  });

  it('keeps webtoons when comments and about history fail', async () => {
    mocks.loadCatalog.mockResolvedValue(catalogOk);
    const { result } = renderHook(() => useData(), { wrapper });
    await act(async () => {
      await result.current.reloadCatalog();
    });
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.error).toBeNull();
    expect(result.current.webtoons).toHaveLength(1);
    expect(result.current.webtoons[0].id).toBe('wt-1');
    expect(result.current.readerComments).toEqual([]);
    expect(result.current.commentsError).not.toBeNull();
    expect(result.current.aboutHistories).toEqual([]);
    expect(result.current.aboutError).not.toBeNull();
  });

  it('clears catalog loading before a slow comments request finishes', async () => {
    let resolveComments: (value: { comments: [] }) => void = () => {};
    mocks.listComments.mockReturnValue(
      new Promise((resolve) => {
        resolveComments = resolve;
      }),
    );
    mocks.loadCatalog.mockResolvedValue(catalogOk);
    const { result } = renderHook(() => useData(), { wrapper });
    let finished: Promise<void> | undefined;
    await act(async () => {
      finished = result.current.reloadCatalog();
    });
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.webtoons).toHaveLength(1);
      expect(result.current.commentsLoading).toBe(true);
      expect(result.current.error).toBeNull();
    });
    await act(async () => {
      resolveComments({ comments: [] });
      await finished;
    });
    await waitFor(() => {
      expect(result.current.commentsLoading).toBe(false);
      expect(result.current.commentsError).toBeNull();
    });
  });

  it('keeps comments from a prior success when a later comments request fails', async () => {
    const commentRow = {
      id: 'c1',
      episodeKey: 'ep-1',
      userId: 'u1',
      content: 'hi',
      spoiler: false,
      reported: false,
      isEdited: false,
      createdAt: '2026-09-10',
    };
    mocks.loadCatalog.mockResolvedValue(catalogOk);
    mocks.listComments.mockResolvedValueOnce({ comments: [commentRow] });
    const { result } = renderHook(() => useData(), { wrapper });
    await act(async () => {
      await result.current.reloadCatalog();
    });
    expect(result.current.readerComments).toHaveLength(1);
    expect(result.current.commentsError).toBeNull();

    mocks.listComments.mockRejectedValueOnce(new ApiError(500, 'Internal Server Error'));
    await act(async () => {
      await result.current.reloadCatalog();
    });
    expect(result.current.readerComments).toHaveLength(1);
    expect(result.current.commentsError).not.toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.webtoons).toHaveLength(1);
  });

  it('does not leak mock charts or transactions on the live desk', async () => {
    mocks.loadCatalog.mockResolvedValue(catalogOk);
    const { result } = renderHook(() => useData(), { wrapper });
    await act(async () => {
      await result.current.reloadCatalog();
    });
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.revenueData).toEqual([]);
    expect(result.current.userGrowthData).toEqual([]);
    expect(result.current.popularWebtoons).toEqual([]);
    expect(result.current.transactions).toEqual([]);
    expect(result.current.reports).toEqual([]);
    expect(result.current.activityLogs).toEqual([]);
    expect(result.current.popularWebtoons.some((row) => row.title.en === 'The Last Horizon')).toBe(
      false,
    );
  });

  it('sets the catalog banner when catalog itself fails', async () => {
    mocks.loadCatalog.mockImplementation(fail500);
    const { result } = renderHook(() => useData(), { wrapper });
    await act(async () => {
      await result.current.reloadCatalog();
    });
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.error).not.toBeNull();
    expect(result.current.webtoons).toEqual([]);
  });
});
