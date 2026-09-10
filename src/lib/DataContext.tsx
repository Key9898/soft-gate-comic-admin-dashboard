import React, {
  createContext,
  useCallback,
  useContext,
  useState,
  useEffect,
  useRef,
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
  ReaderComment,
  ReaderUser,
  DashboardStats,
  RevenueData,
  UserGrowthData,
  PopularWebtoon,
  Author,
  Genre,
  CoinPackage,
  AboutHistory,
  AboutTeamMember,
  AboutTeamMeta,
  MediaFile,
  ActivityLog,
  Report,
  Transaction,
  ScheduledEpisode,
  Notification,
  mockAboutTeamMeta,
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
import { listCoinPackages } from '@/lib/api/coinPackages';
import { listComments } from '@/lib/api/comments';
import { listMedia } from '@/lib/api/media';
import { listNotifications } from '@/lib/api/notifications';
import { getPlatformSettings } from '@/lib/api/settings';
import { listReaderUsers } from '@/lib/api/users';
import { listAboutHistories } from '@/lib/api/aboutHistory';
import { getAboutTeamMeta, listAboutTeamMembers } from '@/lib/api/aboutTeam';
import { loadAboutHistories, saveAboutHistories } from '@/lib/aboutHistory';
import { loadAboutTeam, saveAboutTeam } from '@/lib/aboutTeam';
import { applyLaneSettle, mapFulfilled } from '@/lib/deskLoad';

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

const FAIL_OPEN_PORTAL_SETTINGS = toPortalSettings({
  maintenanceMode: false,
  allowRegistration: true,
  contactEmail: 'admin@softgatecomic.com',
  defaultLanguage: 'en',
});

const EMPTY_ABOUT_LANE = {
  histories: [] as AboutHistory[],
  members: [] as AboutTeamMember[],
  meta: mockAboutTeamMeta,
};

function overlayPortalSettings(
  prev: PlatformSettings,
  portal: {
    maintenanceMode: boolean;
    allowRegistration: boolean;
    contactEmail: string;
    defaultLanguage: 'en' | 'mm';
  },
): PlatformSettings {
  return {
    ...prev,
    maintenanceMode: portal.maintenanceMode,
    allowRegistration: portal.allowRegistration,
    contactEmail: portal.contactEmail,
    defaultLanguage: portal.defaultLanguage,
  };
}

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
    coinPackages: [],
    comments: [],
    users: [],
    notifications: [],
    revenueData: [],
    userGrowthData: [],
    popularWebtoons: [],
    transactions: [],
    reports: [],
    activityLogs: [],
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
  readerUsers: ReaderUser[];
  comments: Comment[];
  setComments: Dispatch<SetStateAction<Comment[]>>;
  readerComments: ReaderComment[];
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
  aboutHistories: AboutHistory[];
  setAboutHistories: Dispatch<SetStateAction<AboutHistory[]>>;
  aboutTeamMembers: AboutTeamMember[];
  setAboutTeamMembers: Dispatch<SetStateAction<AboutTeamMember[]>>;
  aboutTeamMeta: AboutTeamMeta;
  setAboutTeamMeta: Dispatch<SetStateAction<AboutTeamMeta>>;
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
  commentsLoading: boolean;
  commentsError: Error | null;
  usersLoading: boolean;
  usersError: Error | null;
  notificationsLoading: boolean;
  notificationsError: Error | null;
  mediaLoading: boolean;
  mediaError: Error | null;
  coinsLoading: boolean;
  coinsError: Error | null;
  aboutLoading: boolean;
  aboutError: Error | null;
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
  const [readerComments, setReaderComments] = useState<ReaderComment[]>([]);
  const [readerUsers, setReaderUsers] = useState<ReaderUser[]>([]);
  const [aboutHistories, setAboutHistories] = useState<AboutHistory[]>(() =>
    mock ? loadAboutHistories() : [],
  );
  const [aboutTeamMembers, setAboutTeamMembers] = useState<AboutTeamMember[]>(() =>
    mock ? loadAboutTeam().members : [],
  );
  const [aboutTeamMeta, setAboutTeamMeta] = useState<AboutTeamMeta>(() =>
    mock ? loadAboutTeam().meta : mockAboutTeamMeta,
  );
  const [isLoading, setIsLoading] = useState(() => !mock);
  const [error, setError] = useState<Error | null>(null);
  const [commentsLoading, setCommentsLoading] = useState(() => !mock);
  const [commentsError, setCommentsError] = useState<Error | null>(null);
  const [usersLoading, setUsersLoading] = useState(() => !mock);
  const [usersError, setUsersError] = useState<Error | null>(null);
  const [notificationsLoading, setNotificationsLoading] = useState(() => !mock);
  const [notificationsError, setNotificationsError] = useState<Error | null>(null);
  const [mediaLoading, setMediaLoading] = useState(() => !mock);
  const [mediaError, setMediaError] = useState<Error | null>(null);
  const [coinsLoading, setCoinsLoading] = useState(() => !mock);
  const [coinsError, setCoinsError] = useState<Error | null>(null);
  const [aboutLoading, setAboutLoading] = useState(() => !mock);
  const [aboutError, setAboutError] = useState<Error | null>(null);

  const commentsHadSuccessRef = useRef(false);
  const usersHadSuccessRef = useRef(false);
  const notificationsHadSuccessRef = useRef(false);
  const mediaHadSuccessRef = useRef(false);
  const coinsHadSuccessRef = useRef(false);
  const aboutHadSuccessRef = useRef(false);
  const readerCommentsRef = useRef(readerComments);
  const readerUsersRef = useRef(readerUsers);
  const notificationsRef = useRef(db.notifications ?? []);
  const mediaFilesRef = useRef(db.mediaFiles);
  const coinPackagesRef = useRef(db.coinPackages);
  const aboutLaneRef = useRef({
    histories: aboutHistories,
    members: aboutTeamMembers,
    meta: aboutTeamMeta,
  });
  readerCommentsRef.current = readerComments;
  readerUsersRef.current = readerUsers;
  notificationsRef.current = db.notifications ?? [];
  mediaFilesRef.current = db.mediaFiles;
  coinPackagesRef.current = db.coinPackages;
  aboutLaneRef.current = {
    histories: aboutHistories,
    members: aboutTeamMembers,
    meta: aboutTeamMeta,
  };

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
    setCommentsError(null);
    setUsersError(null);
    setNotificationsError(null);
    setMediaError(null);
    setCoinsError(null);
    setAboutError(null);
    setIsLoading(true);
    setCommentsLoading(true);
    setUsersLoading(true);
    setNotificationsLoading(true);
    setMediaLoading(true);
    setCoinsLoading(true);
    setAboutLoading(true);
    try {
      try {
        const catalog = await loadCatalog();
        setError(null);
        setDb((prev) => ({
          ...prev,
          authors: catalog.authors,
          genres: catalog.genres,
          webtoons: catalog.webtoons,
          episodes: catalog.episodes,
        }));
      } catch (reason) {
        setError(reason instanceof Error ? reason : new Error('Failed to fetch catalog'));
        setDb((prev) => ({
          ...prev,
          authors: [],
          genres: [],
          webtoons: [],
          episodes: [],
        }));
      } finally {
        setIsLoading(false);
      }

      const [media, packs, commentList, readerList, inbox, aboutLane, platform] =
        await Promise.allSettled([
          listMedia(),
          listCoinPackages(),
          listComments(),
          listReaderUsers(),
          listNotifications(),
          Promise.all([listAboutHistories(), listAboutTeamMembers(), getAboutTeamMeta()]).then(
            ([historyList, teamList, teamMeta]) => ({
              histories: historyList.histories,
              members: teamList.members,
              meta: teamMeta.meta,
            }),
          ),
          getPlatformSettings(),
        ]);

      const commentsNext = applyLaneSettle(
        mapFulfilled(commentList, (row) => row.comments),
        readerCommentsRef.current,
        commentsHadSuccessRef.current,
        [],
      );
      commentsHadSuccessRef.current = commentsNext.hadSuccess;
      readerCommentsRef.current = commentsNext.value;
      setReaderComments(commentsNext.value);
      setCommentsError(commentsNext.error);

      const usersNext = applyLaneSettle(
        mapFulfilled(readerList, (row) => row.users),
        readerUsersRef.current,
        usersHadSuccessRef.current,
        [],
      );
      usersHadSuccessRef.current = usersNext.hadSuccess;
      readerUsersRef.current = usersNext.value;
      setReaderUsers(usersNext.value);
      setUsersError(usersNext.error);

      const notificationsNext = applyLaneSettle(
        mapFulfilled(inbox, (row) => row.notifications),
        notificationsRef.current,
        notificationsHadSuccessRef.current,
        [],
      );
      notificationsHadSuccessRef.current = notificationsNext.hadSuccess;
      notificationsRef.current = notificationsNext.value;

      const mediaNext = applyLaneSettle(
        mapFulfilled(media, (row) => row.files),
        mediaFilesRef.current,
        mediaHadSuccessRef.current,
        [],
      );
      mediaHadSuccessRef.current = mediaNext.hadSuccess;
      mediaFilesRef.current = mediaNext.value;

      const coinsNext = applyLaneSettle(
        mapFulfilled(packs, (row) => row.coinPackages),
        coinPackagesRef.current,
        coinsHadSuccessRef.current,
        [],
      );
      coinsHadSuccessRef.current = coinsNext.hadSuccess;
      coinPackagesRef.current = coinsNext.value;

      setDb((prev) => ({
        ...prev,
        mediaFiles: mediaNext.value,
        coinPackages: coinsNext.value,
        notifications: notificationsNext.value,
      }));
      setMediaError(mediaNext.error);
      setCoinsError(coinsNext.error);
      setNotificationsError(notificationsNext.error);

      const aboutNext = applyLaneSettle(
        aboutLane,
        aboutLaneRef.current,
        aboutHadSuccessRef.current,
        EMPTY_ABOUT_LANE,
      );
      aboutHadSuccessRef.current = aboutNext.hadSuccess;
      aboutLaneRef.current = aboutNext.value;
      setAboutHistories(aboutNext.value.histories);
      setAboutTeamMembers(aboutNext.value.members);
      setAboutTeamMeta(aboutNext.value.meta);
      setAboutError(aboutNext.error);

      setSettings((prev) =>
        overlayPortalSettings(
          prev,
          platform.status === 'fulfilled' ? platform.value.settings : FAIL_OPEN_PORTAL_SETTINGS,
        ),
      );
    } finally {
      setCommentsLoading(false);
      setUsersLoading(false);
      setNotificationsLoading(false);
      setMediaLoading(false);
      setCoinsLoading(false);
      setAboutLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isMockApi()) return;
    saveToLocalStorage({ ...db, settings: toPortalSettings(settings) });
  }, [db, settings]);

  useEffect(() => {
    if (!isMockApi()) return;
    saveAboutHistories(aboutHistories);
  }, [aboutHistories]);

  useEffect(() => {
    if (!isMockApi()) return;
    saveAboutTeam(aboutTeamMembers, aboutTeamMeta);
  }, [aboutTeamMembers, aboutTeamMeta]);

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
    readerUsers,
    comments: db.comments,
    setComments,
    readerComments,
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
    aboutHistories,
    setAboutHistories,
    aboutTeamMembers,
    setAboutTeamMembers,
    aboutTeamMeta,
    setAboutTeamMeta,
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
    commentsLoading,
    commentsError,
    usersLoading,
    usersError,
    notificationsLoading,
    notificationsError,
    mediaLoading,
    mediaError,
    coinsLoading,
    coinsError,
    aboutLoading,
    aboutError,
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
