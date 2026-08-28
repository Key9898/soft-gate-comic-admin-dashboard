export const APP_NAME = 'SoftGate Comic';
export const APP_TITLE = 'SoftGate Comic Admin';
export const APP_VERSION = '0.0.1';

export type SidebarItem = {
  title: string;
  icon: string;
  path: string;
};

export type SidebarSection = {
  label?: string;
  items: SidebarItem[];
};

export const SIDEBAR_SECTIONS: SidebarSection[] = [
  {
    items: [{ title: 'Dashboard', icon: 'LayoutDashboard', path: '/' }],
  },
  {
    label: 'Catalog',
    items: [
      { title: 'Webtoons', icon: 'BookOpen', path: '/webtoons' },
      { title: 'Authors', icon: 'PenTool', path: '/authors' },
      { title: 'Genres', icon: 'LayoutGrid', path: '/genres' },
      { title: 'Episodes', icon: 'FileText', path: '/episodes' },
      { title: 'Media', icon: 'Image', path: '/media' },
      { title: 'Coin packages', icon: 'Coins', path: '/coin-packages' },
      { title: 'Schedule', icon: 'Calendar', path: '/schedule' },
    ],
  },
  {
    label: 'Community',
    items: [
      { title: 'Users', icon: 'Users', path: '/users' },
      { title: 'Comments', icon: 'MessageSquare', path: '/comments' },
      { title: 'Reports', icon: 'Flag', path: '/reports' },
    ],
  },
  {
    label: 'Business',
    items: [
      { title: 'Analytics', icon: 'BarChart3', path: '/analytics' },
      { title: 'Revenue', icon: 'DollarSign', path: '/revenue' },
      { title: 'Activity Log', icon: 'History', path: '/activity-log' },
      { title: 'Notifications', icon: 'Bell', path: '/notifications' },
    ],
  },
  {
    label: 'Admin',
    items: [
      { title: 'Team', icon: 'UserPlus', path: '/team' },
      { title: 'Settings', icon: 'Settings', path: '/settings' },
    ],
  },
];

export const SIDEBAR_ITEMS = SIDEBAR_SECTIONS.flatMap((section) => section.items);

export const WEBTOON_STATUSES = ['ongoing', 'completed', 'hiatus', 'draft'] as const;
export const EPISODE_STATUSES = ['published', 'draft', 'scheduled'] as const;
export const USER_STATUSES = ['active', 'banned', 'suspended'] as const;
export const COMMENT_STATUSES = ['visible', 'hidden', 'deleted'] as const;

export const ITEMS_PER_PAGE = 10;
