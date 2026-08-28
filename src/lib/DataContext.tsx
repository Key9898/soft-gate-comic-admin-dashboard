import React, {
  createContext,
  useCallback,
  useContext,
  useState,
  useEffect,
  ReactNode,
  Dispatch,
  SetStateAction,
} from 'react';
import {
  SharedData,
  Webtoon,
  Episode,
  User,
  Comment,
  DashboardStats,
  RevenueData,
  UserGrowthData,
  PopularWebtoon,
  Author,
  Genre,
  CoinPackage,
  MediaFile,
  ActivityLog,
  Report,
  Transaction,
  ScheduledEpisode,
  Notification,
} from '@softgate/shared';
import {
  loadFromLocalStorage,
  saveToLocalStorage,
  mockDashboardStats,
  mockRevenueData,
  mockUserGrowthData,
  mockPopularWebtoons,
  mockAuthors,
  mockGenres,
  mockCoinPackages,
  mockWebtoons,
  mockEpisodes,
  mockUsers,
  mockComments,
  mockMediaFiles,
  mockActivityLogs,
  mockReports,
  mockTransactions,
  mockScheduledEpisodes,
  mockNotifications,
  ADMIN_SETTINGS_STORAGE_KEY,
  toPortalSettings,
  normalizePortalLanguage,
} from '@/data';
import { isMockApi } from '@/lib/api/http';
import { loadCatalog } from '@/lib/api/catalog';
import { listMedia } from '@/lib/api/media';

export interface PlatformSettings {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  maintenanceMode: boolean;
  allowRegistration: boolean;
  requireEmailVerification: boolean;
  defaultLanguage: 'en' | 'mm';
  notifications: {
    newUser: boolean;
    newWebtoon: boolean;
    newComment: boolean;
    reportSubmitted: boolean;
  };
}

const defaultSettings: PlatformSettings = {
  siteName: 'SoftGate Comic',
  siteDescription: 'Your gateway to amazing webtoons',
  contactEmail: 'admin@softgatecomic.com',
  maintenanceMode: false,
  allowRegistration: true,
  requireEmailVerification: true,
  defaultLanguage: 'en',
  notifications: {
    newUser: true,
    newWebtoon: true,
    newComment: true,
    reportSubmitted: true,
  },
};

const mockNonCatalog = {
  dashboardStats: mockDashboardStats,
  revenueData: mockRevenueData,
  userGrowthData: mockUserGrowthData,
  popularWebtoons: mockPopularWebtoons,
  coinPackages: mockCoinPackages,
  users: mockUsers,
  comments: mockComments,
  mediaFiles: mockMediaFiles,
  activityLogs: mockActivityLogs,
  reports: mockReports,
  transactions: mockTransactions,
  scheduledEpisodes: mockScheduledEpisodes,
  notifications: mockNotifications,
};

function emptyApiCatalog(): SharedData {
  return {
    ...mockNonCatalog,
    authors: [],
    genres: [],
    webtoons: [],
    episodes: [],
    mediaFiles: [],
  };
}

function loadMockDb(): SharedData {
  const loaded = loadFromLocalStorage();
  const base = loaded || {
    ...mockNonCatalog,
    authors: mockAuthors,
    genres: mockGenres,
    webtoons: mockWebtoons,
    episodes: mockEpisodes,
  };
  return {
    ...base,
    notifications: base.notifications ?? mockNotifications,
    transactions: base.transactions?.length ? base.transactions : mockTransactions,
  };
}

interface DataContextType {
  webtoons: Webtoon[];
  setWebtoons: Dispatch<SetStateAction<Webtoon[]>>;
  episodes: Episode[];
  setEpisodes: Dispatch<SetStateAction<Episode[]>>;
  users: User[];
  setUsers: Dispatch<SetStateAction<User[]>>;
  comments: Comment[];
  setComments: Dispatch<SetStateAction<Comment[]>>;
  dashboardStats: DashboardStats;
  setDashboardStats: Dispatch<SetStateAction<DashboardStats>>;
  revenueData: RevenueData[];
  setRevenueData: Dispatch<SetStateAction<RevenueData[]>>;
  userGrowthData: UserGrowthData[];
  setUserGrowthData: Dispatch<SetStateAction<UserGrowthData[]>>;
  popularWebtoons: PopularWebtoon[];
  setPopularWebtoons: Dispatch<SetStateAction<PopularWebtoon[]>>;
  authors: Author[];
  setAuthors: Dispatch<SetStateAction<Author[]>>;
  genres: Genre[];
  setGenres: Dispatch<SetStateAction<Genre[]>>;
  coinPackages: CoinPackage[];
  setCoinPackages: Dispatch<SetStateAction<CoinPackage[]>>;
  mediaFiles: MediaFile[];
  setMediaFiles: Dispatch<SetStateAction<MediaFile[]>>;
  activityLogs: ActivityLog[];
  setActivityLogs: Dispatch<SetStateAction<ActivityLog[]>>;
  reports: Report[];
  setReports: Dispatch<SetStateAction<Report[]>>;
  transactions: Transaction[];
  setTransactions: Dispatch<SetStateAction<Transaction[]>>;
  scheduledEpisodes: ScheduledEpisode[];
  setScheduledEpisodes: Dispatch<SetStateAction<ScheduledEpisode[]>>;
  notifications: Notification[];
  setNotifications: Dispatch<SetStateAction<Notification[]>>;
  settings: PlatformSettings;
  setSettings: Dispatch<SetStateAction<PlatformSettings>>;
  isLoading: boolean;
  error: Error | null;
  retry: () => void;
  reloadCatalog: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

function readAdminSettings(): Partial<PlatformSettings> {
  const stored = localStorage.getItem(ADMIN_SETTINGS_STORAGE_KEY);
  if (!stored) return {};
  try {
    const parsed = JSON.parse(stored) as Record<string, unknown>;
    delete parsed.defaultTheme;
    delete parsed.primaryColor;
    return parsed as Partial<PlatformSettings>;
  } catch {
    return {};
  }
}

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const mock = isMockApi();
  const [db, setDb] = useState<SharedData>(() => (mock ? loadMockDb() : emptyApiCatalog()));
  const [isLoading, setIsLoading] = useState(() => !mock);
  const [error, setError] = useState<Error | null>(null);

  const [settings, setSettings] = useState<PlatformSettings>(() => {
    const fromAdmin = readAdminSettings();
    const loaded = mock ? loadFromLocalStorage() : null;
    const merged: PlatformSettings = {
      ...defaultSettings,
      ...fromAdmin,
      ...(loaded?.settings ?? {}),
    };
    merged.defaultLanguage = normalizePortalLanguage(merged.defaultLanguage);
    return merged;
  });

  const reloadCatalog = useCallback(async () => {
    if (isMockApi()) return;
    setError(null);
    setIsLoading(true);
    try {
      const [catalog, media] = await Promise.all([loadCatalog(), listMedia()]);
      setDb((prev) => ({
        ...prev,
        authors: catalog.authors,
        genres: catalog.genres,
        webtoons: catalog.webtoons,
        episodes: catalog.episodes,
        mediaFiles: media.files,
      }));
      setError(null);
    } catch (err: unknown) {
      const nextError = err instanceof Error ? err : new Error('Failed to fetch catalog');
      setError(nextError);
      setDb((prev) => ({
        ...prev,
        authors: [],
        genres: [],
        webtoons: [],
        episodes: [],
        mediaFiles: [],
      }));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isMockApi()) return;
    saveToLocalStorage({ ...db, settings: toPortalSettings(settings) });
  }, [db, settings]);

  useEffect(() => {
    localStorage.setItem(ADMIN_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const setWebtoons = (val: SetStateAction<Webtoon[]>) => {
    setDb((prev) => ({
      ...prev,
      webtoons: typeof val === 'function' ? val(prev.webtoons) : val,
    }));
  };

  const setEpisodes = (val: SetStateAction<Episode[]>) => {
    setDb((prev) => ({
      ...prev,
      episodes: typeof val === 'function' ? val(prev.episodes) : val,
    }));
  };

  const setUsers = (val: SetStateAction<User[]>) => {
    setDb((prev) => ({
      ...prev,
      users: typeof val === 'function' ? val(prev.users) : val,
    }));
  };

  const setComments = (val: SetStateAction<Comment[]>) => {
    setDb((prev) => ({
      ...prev,
      comments: typeof val === 'function' ? val(prev.comments) : val,
    }));
  };

  const setDashboardStats = (val: SetStateAction<DashboardStats>) => {
    setDb((prev) => ({
      ...prev,
      dashboardStats: typeof val === 'function' ? val(prev.dashboardStats) : val,
    }));
  };

  const setRevenueData = (val: SetStateAction<RevenueData[]>) => {
    setDb((prev) => ({
      ...prev,
      revenueData: typeof val === 'function' ? val(prev.revenueData) : val,
    }));
  };

  const setUserGrowthData = (val: SetStateAction<UserGrowthData[]>) => {
    setDb((prev) => ({
      ...prev,
      userGrowthData: typeof val === 'function' ? val(prev.userGrowthData) : val,
    }));
  };

  const setPopularWebtoons = (val: SetStateAction<PopularWebtoon[]>) => {
    setDb((prev) => ({
      ...prev,
      popularWebtoons: typeof val === 'function' ? val(prev.popularWebtoons) : val,
    }));
  };

  const setAuthors = (val: SetStateAction<Author[]>) => {
    setDb((prev) => ({
      ...prev,
      authors: typeof val === 'function' ? val(prev.authors) : val,
    }));
  };

  const setGenres = (val: SetStateAction<Genre[]>) => {
    setDb((prev) => ({
      ...prev,
      genres: typeof val === 'function' ? val(prev.genres) : val,
    }));
  };

  const setCoinPackages = (val: SetStateAction<CoinPackage[]>) => {
    setDb((prev) => ({
      ...prev,
      coinPackages: typeof val === 'function' ? val(prev.coinPackages) : val,
    }));
  };

  const setMediaFiles = (val: SetStateAction<MediaFile[]>) => {
    setDb((prev) => ({
      ...prev,
      mediaFiles: typeof val === 'function' ? val(prev.mediaFiles) : val,
    }));
  };

  const setActivityLogs = (val: SetStateAction<ActivityLog[]>) => {
    setDb((prev) => ({
      ...prev,
      activityLogs: typeof val === 'function' ? val(prev.activityLogs) : val,
    }));
  };

  const setReports = (val: SetStateAction<Report[]>) => {
    setDb((prev) => ({
      ...prev,
      reports: typeof val === 'function' ? val(prev.reports) : val,
    }));
  };

  const setTransactions = (val: SetStateAction<Transaction[]>) => {
    setDb((prev) => ({
      ...prev,
      transactions: typeof val === 'function' ? val(prev.transactions) : val,
    }));
  };

  const setScheduledEpisodes = (val: SetStateAction<ScheduledEpisode[]>) => {
    setDb((prev) => ({
      ...prev,
      scheduledEpisodes: typeof val === 'function' ? val(prev.scheduledEpisodes) : val,
    }));
  };

  const setNotifications = (val: SetStateAction<Notification[]>) => {
    setDb((prev) => ({
      ...prev,
      notifications: typeof val === 'function' ? val(prev.notifications ?? []) : val,
    }));
  };

  const contextValue: DataContextType = {
    webtoons: db.webtoons,
    setWebtoons,
    episodes: db.episodes,
    setEpisodes,
    users: db.users,
    setUsers,
    comments: db.comments,
    setComments,
    dashboardStats: db.dashboardStats,
    setDashboardStats,
    revenueData: db.revenueData,
    setRevenueData,
    userGrowthData: db.userGrowthData,
    setUserGrowthData,
    popularWebtoons: db.popularWebtoons,
    setPopularWebtoons,
    authors: db.authors,
    setAuthors,
    genres: db.genres,
    setGenres,
    coinPackages: db.coinPackages,
    setCoinPackages,
    mediaFiles: db.mediaFiles,
    setMediaFiles,
    activityLogs: db.activityLogs,
    setActivityLogs,
    reports: db.reports,
    setReports,
    transactions: db.transactions,
    setTransactions,
    scheduledEpisodes: db.scheduledEpisodes,
    setScheduledEpisodes,
    notifications: db.notifications ?? [],
    setNotifications,
    settings,
    setSettings,
    isLoading,
    error,
    retry: () => {
      void reloadCatalog();
    },
    reloadCatalog,
  };

  return React.createElement(DataContext.Provider, { value: contextValue }, children);
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
