export interface BilingualText {
  mm: string;
  en: string;
}

export interface AdminUser {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatar?: string;
  role: 'super_admin' | 'admin' | 'member' | 'viewer';
  createdAt?: string;
  /** Mock-only password digest; when set, login must match. */
  passwordHash?: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatar?: string;
  bio?: string;
  coinBalance: number;
  status: 'active' | 'banned' | 'suspended';
  createdAt: string;
  lastLoginAt?: string;
}

export type ContentRating = 'all' | '13' | '16' | '18';

export type PortalLanguage = 'en' | 'mm';

export interface PortalSettings {
  maintenanceMode: boolean;
  allowRegistration: boolean;
  contactEmail: string;
  defaultLanguage: PortalLanguage;
}

export interface Webtoon {
  id: string;
  title: BilingualText;
  description: BilingualText;
  coverImage?: string;
  coverColor: string;
  author: Author;
  genres: string[];
  tags: string[];
  status: 'ongoing' | 'completed' | 'hiatus' | 'draft';
  isPremium: boolean;
  viewCount: number;
  likeCount: number;
  episodeCount: number;
  rating: number;
  contentRating: ContentRating;
  createdAt: string;
  updatedAt: string;
  spotlight?: boolean;
  spotlightOrder?: number;
  weeklyViewCount?: number;
}

export interface Episode {
  id: string;
  webtoonId: string;
  webtoonTitle: BilingualText;
  title: BilingualText;
  description?: BilingualText;
  images: string[];
  imageSizes?: Array<{ width: number; height: number } | null>;
  isPremium: boolean;
  coinPrice: number;
  viewCount: number;
  likeCount: number;
  episodeNumber: number;
  status: 'published' | 'draft' | 'scheduled';
  createdAt: string;
  updatedAt: string;
  freeAt?: string;
  scheduledAt?: string;
}

export interface Author {
  id: string;
  name: BilingualText;
  avatar?: string;
  bio?: BilingualText;
  followerCount: number;
  webtoonCount: number;
  status: 'active' | 'inactive';
}

export interface Genre {
  id: string;
  name: BilingualText;
  slug: string;
  description?: string;
  webtoonCount: number;
}

export interface Comment {
  id: string;
  userId: string;
  user: User;
  webtoonId: string;
  episodeId: string;
  content: BilingualText;
  likeCount: number;
  status: 'visible' | 'hidden' | 'deleted';
  createdAt: string;
}

export interface DashboardStats {
  totalUsers: number;
  totalWebtoons: number;
  totalEpisodes: number;
  totalViews: number;
  totalRevenue: number;
  newUsersToday: number;
  activeUsersToday: number;
  newEpisodesToday: number;
}

export interface RevenueData {
  date: string;
  revenue: number;
  coins: number;
}

export interface UserGrowthData {
  date: string;
  users: number;
  activeUsers: number;
}

export interface PopularWebtoon {
  id: string;
  title: BilingualText;
  views: number;
  likes: number;
  revenue: number;
}

export interface Notification {
  id: string;
  type: 'system' | 'report' | 'payment' | 'content';
  title: BilingualText;
  message: BilingualText;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
}

export interface MediaFile {
  id: string;
  name: string;
  type: 'image' | 'pdf';
  url: string;
  size: number;
  uploadedAt: string;
  category?: string;
}

export interface ActivityLog {
  id: string;
  adminId: string;
  adminName: string;
  action: 'create' | 'update' | 'delete' | 'publish' | 'ban' | 'unban' | 'login' | 'logout';
  targetType:
    | 'webtoon'
    | 'author'
    | 'genre'
    | 'episode'
    | 'user'
    | 'comment'
    | 'settings'
    | 'auth'
    | 'report'
    | 'media'
    | 'schedule'
    | 'transaction'
    | 'coin-package'
    | 'staff';
  targetId: string;
  targetName: BilingualText;
  details?: BilingualText;
  createdAt: string;
}

export interface Report {
  id: string;
  type: 'webtoon' | 'episode' | 'comment' | 'user';
  reason: 'spam' | 'inappropriate' | 'copyright' | 'other';
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  priority: 'high' | 'medium' | 'low';
  reporterId: string;
  reporterName: string;
  targetId: string;
  targetName: BilingualText;
  description: BilingualText;
  createdAt: string;
}

export interface Transaction {
  id: string;
  type: 'purchase' | 'payout' | 'refund' | 'deposit';
  userId: string;
  userName: BilingualText;
  amount: number;
  coins: number;
  status: 'completed' | 'pending' | 'failed' | 'cancelled';
  description: BilingualText;
  createdAt: string;
  paymentMethod?: string;
}

export interface ScheduledEpisode {
  id: string;
  webtoonId: string;
  webtoonTitle: BilingualText;
  episodeNumber: number;
  title: BilingualText;
  scheduledAt: string;
  status: 'scheduled' | 'published' | 'draft';
}

export interface CoinPackage {
  id: string;
  coins: number;
  price: number;
  bonus?: number;
  popular?: boolean;
  bestValue?: boolean;
}

export interface SharedData {
  dashboardStats: DashboardStats;
  revenueData: RevenueData[];
  userGrowthData: UserGrowthData[];
  popularWebtoons: PopularWebtoon[];
  authors: Author[];
  genres: Genre[];
  coinPackages: CoinPackage[];
  webtoons: Webtoon[];
  episodes: Episode[];
  users: User[];
  comments: Comment[];
  mediaFiles: MediaFile[];
  activityLogs: ActivityLog[];
  reports: Report[];
  transactions: Transaction[];
  scheduledEpisodes: ScheduledEpisode[];
  notifications: Notification[];
  settings?: PortalSettings;
}
