import React, {
  createContext,
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
  MediaFile,
  ActivityLog,
  Report,
  Transaction,
  ScheduledEpisode,
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
  mockWebtoons,
  mockEpisodes,
  mockUsers,
  mockComments,
  mockMediaFiles,
  mockActivityLogs,
  mockReports,
  mockTransactions,
  mockScheduledEpisodes,
} from '@/data';

export interface PlatformSettings {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  maintenanceMode: boolean;
  allowRegistration: boolean;
  requireEmailVerification: boolean;
  defaultLanguage: string;
  defaultTheme: string;
  notifications: {
    newUser: boolean;
    newWebtoon: boolean;
    newComment: boolean;
    reportSubmitted: boolean;
  };
}

const defaultSettings: PlatformSettings = {
  siteName: 'Soft-Gate Comic',
  siteDescription: 'Your gateway to amazing webtoons',
  contactEmail: 'admin@softgatecomic.com',
  maintenanceMode: false,
  allowRegistration: true,
  requireEmailVerification: true,
  defaultLanguage: 'en',
  defaultTheme: 'light',
  notifications: {
    newUser: true,
    newWebtoon: true,
    newComment: true,
    reportSubmitted: true,
  },
};

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
  settings: PlatformSettings;
  setSettings: Dispatch<SetStateAction<PlatformSettings>>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [db, setDb] = useState<SharedData>(() => {
    const loaded = loadFromLocalStorage();
    if (loaded) return loaded;
    return {
      dashboardStats: mockDashboardStats,
      revenueData: mockRevenueData,
      userGrowthData: mockUserGrowthData,
      popularWebtoons: mockPopularWebtoons,
      authors: mockAuthors,
      genres: mockGenres,
      webtoons: mockWebtoons,
      episodes: mockEpisodes,
      users: mockUsers,
      comments: mockComments,
      mediaFiles: mockMediaFiles,
      activityLogs: mockActivityLogs,
      reports: mockReports,
      transactions: mockTransactions,
      scheduledEpisodes: mockScheduledEpisodes,
    };
  });

  const [settings, setSettings] = useState<PlatformSettings>(() => {
    const stored = localStorage.getItem('softgate_admin_settings');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return defaultSettings;
      }
    }
    return defaultSettings;
  });

  // Load data from backend if VITE_USE_MOCK_API is 'false'
  useEffect(() => {
    const isMock = import.meta.env.VITE_USE_MOCK_API !== 'false';
    if (!isMock) {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
      fetch(`${baseUrl}/api/data`)
        .then((res) => {
          if (!res.ok) throw new Error('Failed to fetch data');
          return res.json();
        })
        .then((data) => {
          setDb(data);
        })
        .catch((err) => {
          console.error('Error fetching data from backend, falling back to local/mock:', err);
        });

      fetch(`${baseUrl}/api/settings`)
        .then((res) => {
          if (!res.ok) throw new Error('Failed to fetch settings');
          return res.json();
        })
        .then((data) => {
          setSettings(data);
        })
        .catch((err) => {
          console.error('Error fetching settings from backend, falling back to local/mock:', err);
        });
    }
  }, []);

  // Save shared database to localStorage or Backend on modifications
  useEffect(() => {
    const isMock = import.meta.env.VITE_USE_MOCK_API !== 'false';
    if (isMock) {
      saveToLocalStorage(db);
    } else {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
      fetch(`${baseUrl}/api/data`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(db),
      }).catch((err) => {
        console.error('Error saving data to backend:', err);
      });
    }
  }, [db]);

  // Save settings to localStorage or Backend on modifications
  useEffect(() => {
    const isMock = import.meta.env.VITE_USE_MOCK_API !== 'false';
    if (isMock) {
      localStorage.setItem('softgate_admin_settings', JSON.stringify(settings));
    } else {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
      fetch(`${baseUrl}/api/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      }).catch((err) => {
        console.error('Error saving settings to backend:', err);
      });
    }
  }, [settings]);

  // State setters helpers to trigger re-renders by mutating the db wrapper state
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
    settings,
    setSettings,
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
