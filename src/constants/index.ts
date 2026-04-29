export const APP_NAME = 'WebPad Admin'
export const APP_VERSION = '0.0.1'

export const SIDEBAR_ITEMS = [
  {
    title: 'Dashboard',
    icon: 'LayoutDashboard',
    path: '/',
  },
  {
    title: 'Webtoons',
    icon: 'BookOpen',
    path: '/webtoons',
  },
  {
    title: 'Episodes',
    icon: 'FileText',
    path: '/episodes',
  },
  {
    title: 'Users',
    icon: 'Users',
    path: '/users',
  },
  {
    title: 'Comments',
    icon: 'MessageSquare',
    path: '/comments',
  },
  {
    title: 'Analytics',
    icon: 'BarChart3',
    path: '/analytics',
  },
  {
    title: 'Media',
    icon: 'Image',
    path: '/media',
  },
  {
    title: 'Reports',
    icon: 'Flag',
    path: '/reports',
  },
  {
    title: 'Activity Log',
    icon: 'History',
    path: '/activity-log',
  },
  {
    title: 'Revenue',
    icon: 'DollarSign',
    path: '/revenue',
  },
  {
    title: 'Notifications',
    icon: 'Bell',
    path: '/notifications',
  },
  {
    title: 'Schedule',
    icon: 'Calendar',
    path: '/schedule',
  },
  {
    title: 'Settings',
    icon: 'Settings',
    path: '/settings',
  },
]

export const WEBTOON_STATUSES = ['ongoing', 'completed', 'hiatus', 'draft'] as const
export const EPISODE_STATUSES = ['published', 'draft', 'scheduled'] as const
export const USER_STATUSES = ['active', 'banned', 'suspended'] as const
export const COMMENT_STATUSES = ['visible', 'hidden', 'deleted'] as const

export const ITEMS_PER_PAGE = 10
