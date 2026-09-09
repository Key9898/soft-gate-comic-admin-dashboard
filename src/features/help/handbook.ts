export const HELP_TAB_IDS = [
  'overview',
  'catalog',
  'community',
  'business',
  'admin',
  'commands',
] as const;

export type HelpTabId = (typeof HELP_TAB_IDS)[number];

export const HELP_TABS: ReadonlyArray<{ id: HelpTabId; label: string }> = [
  { id: 'overview', label: 'Overview' },
  { id: 'catalog', label: 'Catalog' },
  { id: 'community', label: 'Community' },
  { id: 'business', label: 'Business' },
  { id: 'admin', label: 'Admin' },
  { id: 'commands', label: 'Commands' },
];

export const isHelpTab = (value: string | null): value is HelpTabId =>
  HELP_TAB_IDS.some((id) => id === value);

export const parseHelpTab = (value: string | null): HelpTabId =>
  isHelpTab(value) ? value : 'overview';

export const OVERVIEW_DESK =
  'This is the staff console for SoftGate Comic. The public reader site is softgatecomic.com, not this desk.';

export const OVERVIEW_DATA_MOCK =
  'This browser keeps mock data. Saves stay here. They do not appear on the public site.';

export const OVERVIEW_DATA_API =
  'This desk is connected to the catalog API. Catalog, media, and coin packages you save can reach the reader site. Users on this desk are portal ReaderUser rows. Delete removes the reader; wallet coins are read-only. Team is still staff. Comments on this desk are portal ReaderComment rows. Reported is the moderation queue; delete removes the reader thread. Notifications you mark read or delete save on this desk’s notifications API; they are not the reader inbox. Super Admin and Admin can also send bilingual reader broadcasts when the website service is configured. Maintenance, registration, contact email, and default language save on this desk’s settings API; they can reach the reader site when the portal persist is on. Dashboard charts, revenue, and reports stay mock or local even then. Theme and the other Settings controls stay in this browser. Webtoon and episode counts on the Dashboard can be real; purchase and growth charts are not.';

export const OVERVIEW_JUMP = 'Jump with Search or jump… in the header, or Ctrl+K (Mac: ⌘K).';

export const OVERVIEW_BROKEN =
  'If something is broken, or you need an invite, email the desk owner.';

export const DESK_OWNER_EMAIL = 'admin@softgatecomic.com';

export const CATALOG_NOTES: ReadonlyArray<{ title: string; body: string }> = [
  {
    title: 'Order',
    body: 'Add an active author (and a genre) before a series, then episodes. Covers and files come from Media.',
  },
  {
    title: 'Delete a series',
    body: 'A series that still has episodes cannot be deleted against the catalog API. Remove or move the episodes first.',
  },
  {
    title: 'Schedule',
    body: 'Schedule times an existing draft or scheduled episode. Published episodes are not eligible here. Unschedule returns the episode to draft. Times are Asia/Yangon, including the episode form Schedule Date.',
  },
  {
    title: 'Episode files',
    body: 'Bulk Upload (PDF split) is mock desk only. The episode form PDF slot is not saved — use page images.',
  },
  {
    title: 'Media size',
    body: 'Upload limits: image 2MB, PDF 10MB.',
  },
  {
    title: 'Coin packages',
    body: 'Coin packages are shop SKUs on this desk, not a payments API. When the catalog API is on, packages save on the server. Super Admin and Admin can write; Member and Viewer look only.',
  },
];

export const COMMUNITY_NOTE = {
  title: 'Users, comments, reports',
  body: 'Live Users are portal ReaderUser rows when the catalog API is on: search email, username, and display name; coins are the wallet balance (read-only); delete removes the reader. Ban and suspend stay on the mock desk only. Team is still staff. Reports stay mock. Comments are portal ReaderComment rows when the catalog API is on: reported is the queue; delete removes the reader thread. Hide and resolve or dismiss need Admin or Super Admin. Member and Viewer can look only. Report actions apply to pending items only.',
};

export const BUSINESS_NOTE = {
  title: 'Charts and money',
  body: 'Analytics and Revenue are mock. Notifications save on this desk’s notifications API when the catalog API is on; they are not the reader inbox. Super Admin and Admin can send bilingual reader broadcasts when the website service is configured; Member and Viewer look only. Delete on the staff inbox is permanent. Revenue Export is a CSV of this desk’s list, not a bank. Payouts are demo. Activity Log is this browser’s trail, not a server audit API.',
};

export const ADMIN_INVITE =
  'Copy the invite link and share it; that always works. The API may also email the invite when mail is configured. Super Admin cannot be invited. Revoke on a pending invite is mock-only.';

export const ADMIN_SIGNIN =
  'This desk has no public Sign up. Empty staff uses Create the first Super Admin. After that, Sign in only. New people join from Team invite. Reader registration is a website setting, not this desk.';

export const ADMIN_SETTINGS =
  'When the catalog API is on, Save writes maintenance, registration, contact email, and default language to this desk’s settings API; they can reach the reader site when the portal persist is on. Theme applies immediately for every role from the header, palette, or Settings, and is not the Save button. Site name, description, email-verification, and notification toggles stay in this browser. Member and Viewer can look only.';

export const ADMIN_PROFILE =
  'Profile is not in the sidebar. Open it from the header or the profile command. Authenticator is optional: if you turn it on, Sign in asks for a 6-digit code. Against the catalog API, name and password stay in this session only; authenticator saves on the staff API.';

export const COMMANDS_INTRO =
  'Go and Create rows open the same destinations as the command palette. System rows are listed for reference.';
