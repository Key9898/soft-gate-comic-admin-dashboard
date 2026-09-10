export type CommandGroup = 'Catalog' | 'Community' | 'Business' | 'Admin' | 'Create' | 'System';
export type CommandKind = 'go' | 'create' | 'system';
export type CommandRequires = 'catalog' | 'invite' | 'settings';
export type SystemAction = 'commands' | 'theme.light' | 'theme.dark' | 'theme.system' | 'logout';

export type CommandEntry = {
  slug: string;
  title: string;
  group: CommandGroup;
  kind: CommandKind;
  path?: string;
  action?: SystemAction;
  requires?: CommandRequires;
};

export const COMMAND_GROUP_ORDER: CommandGroup[] = [
  'Catalog',
  'Community',
  'Business',
  'Admin',
  'Create',
  'System',
];

export const COMMANDS: CommandEntry[] = [
  { slug: 'dashboard', title: 'Go to Dashboard', group: 'Catalog', kind: 'go', path: '/' },
  { slug: 'webtoons', title: 'Go to Webtoons', group: 'Catalog', kind: 'go', path: '/webtoons' },
  { slug: 'authors', title: 'Go to Authors', group: 'Catalog', kind: 'go', path: '/authors' },
  { slug: 'genres', title: 'Go to Genres', group: 'Catalog', kind: 'go', path: '/genres' },
  { slug: 'episodes', title: 'Go to Episodes', group: 'Catalog', kind: 'go', path: '/episodes' },
  { slug: 'media', title: 'Go to Media', group: 'Catalog', kind: 'go', path: '/media' },
  {
    slug: 'packages',
    title: 'Go to Coin packages',
    group: 'Catalog',
    kind: 'go',
    path: '/coin-packages',
  },
  { slug: 'schedule', title: 'Go to Schedule', group: 'Catalog', kind: 'go', path: '/schedule' },
  { slug: 'users', title: 'Go to Users', group: 'Community', kind: 'go', path: '/users' },
  { slug: 'comments', title: 'Go to Comments', group: 'Community', kind: 'go', path: '/comments' },
  { slug: 'reports', title: 'Go to Reports', group: 'Community', kind: 'go', path: '/reports' },
  {
    slug: 'analytics',
    title: 'Go to Analytics',
    group: 'Business',
    kind: 'go',
    path: '/analytics',
  },
  { slug: 'revenue', title: 'Go to Revenue', group: 'Business', kind: 'go', path: '/revenue' },
  {
    slug: 'activity',
    title: 'Go to Activity Log',
    group: 'Business',
    kind: 'go',
    path: '/activity-log',
  },
  {
    slug: 'notifications',
    title: 'Go to Notifications',
    group: 'Business',
    kind: 'go',
    path: '/notifications',
  },
  { slug: 'team', title: 'Go to Team', group: 'Admin', kind: 'go', path: '/team' },
  { slug: 'settings', title: 'Go to Settings', group: 'Admin', kind: 'go', path: '/settings' },
  { slug: 'about', title: 'Go to About', group: 'Admin', kind: 'go', path: '/about' },
  { slug: 'press', title: 'Go to Press', group: 'Admin', kind: 'go', path: '/press' },
  { slug: 'faq', title: 'Go to FAQ', group: 'Admin', kind: 'go', path: '/faq' },
  { slug: 'cookies', title: 'Go to Cookies', group: 'Admin', kind: 'go', path: '/cookies' },
  { slug: 'legal', title: 'Go to Legal', group: 'Admin', kind: 'go', path: '/legal' },
  { slug: 'profile', title: 'Go to Profile', group: 'Admin', kind: 'go', path: '/profile' },
  { slug: 'help', title: 'Go to Help', group: 'Admin', kind: 'go', path: '/help' },
  {
    slug: 'webtoon.new',
    title: 'Add Webtoon',
    group: 'Create',
    kind: 'create',
    path: '/webtoons/new',
    requires: 'catalog',
  },
  {
    slug: 'episode.new',
    title: 'Add Episode',
    group: 'Create',
    kind: 'create',
    path: '/episodes/new',
    requires: 'catalog',
  },
  {
    slug: 'author.new',
    title: 'Add Author',
    group: 'Create',
    kind: 'create',
    path: '/authors?new=1',
    requires: 'catalog',
  },
  {
    slug: 'genre.new',
    title: 'Add Genre',
    group: 'Create',
    kind: 'create',
    path: '/genres?new=1',
    requires: 'catalog',
  },
  {
    slug: 'package.new',
    title: 'Add coin package',
    group: 'Create',
    kind: 'create',
    path: '/coin-packages?new=1',
    requires: 'catalog',
  },
  {
    slug: 'media.new',
    title: 'Upload media',
    group: 'Create',
    kind: 'create',
    path: '/media?new=1',
    requires: 'catalog',
  },
  {
    slug: 'invite.new',
    title: 'Invite staff',
    group: 'Create',
    kind: 'create',
    path: '/team?new=1',
    requires: 'invite',
  },
  {
    slug: 'history.new',
    title: 'Add history',
    group: 'Create',
    kind: 'create',
    path: '/about?new=1',
    requires: 'settings',
  },
  {
    slug: 'member.new',
    title: 'Add member',
    group: 'Create',
    kind: 'create',
    path: '/about?new=member',
    requires: 'settings',
  },
  {
    slug: 'press.news',
    title: 'Add press news',
    group: 'Create',
    kind: 'create',
    path: '/press?new=1',
    requires: 'settings',
  },
  {
    slug: 'faq.new',
    title: 'Add FAQ',
    group: 'Create',
    kind: 'create',
    path: '/faq?new=1',
    requires: 'settings',
  },
  { slug: 'commands', title: 'Commands', group: 'System', kind: 'system', action: 'commands' },
  {
    slug: 'theme.light',
    title: 'Theme: Light',
    group: 'System',
    kind: 'system',
    action: 'theme.light',
  },
  {
    slug: 'theme.dark',
    title: 'Theme: Dark',
    group: 'System',
    kind: 'system',
    action: 'theme.dark',
  },
  {
    slug: 'theme.system',
    title: 'Theme: System',
    group: 'System',
    kind: 'system',
    action: 'theme.system',
  },
  { slug: 'logout', title: 'Sign out', group: 'System', kind: 'system', action: 'logout' },
];

export type CommandAccess = {
  canWriteCatalog: boolean;
  canInvite: boolean;
  canWriteSettings: boolean;
};

export const isCommandVisible = (command: CommandEntry, access: CommandAccess): boolean => {
  if (command.requires === 'catalog' && !access.canWriteCatalog) return false;
  if (command.requires === 'invite' && !access.canInvite) return false;
  if (command.requires === 'settings' && !access.canWriteSettings) return false;
  return true;
};

export const filterCommands = (query: string, access: CommandAccess): CommandEntry[] => {
  const visible = COMMANDS.filter((command) => isCommandVisible(command, access));
  const needle = query.trim().toLowerCase();
  if (!needle) return visible;
  return visible.filter(
    (command) =>
      command.slug.toLowerCase().includes(needle) || command.title.toLowerCase().includes(needle),
  );
};

export const groupCommands = (
  commands: CommandEntry[],
): Array<{ group: CommandGroup; items: CommandEntry[] }> =>
  COMMAND_GROUP_ORDER.flatMap((group) => {
    const items = commands.filter((command) => command.group === group);
    return items.length ? [{ group, items }] : [];
  });
