export type BilingualText = { en: string; mm: string };

export const COOKIE_META_ID = 'cookies';

export const COOKIE_COPY_KEYS = [
  'cookiesTitle',
  'cookiesSeoDesc',
  'whatAreCookies',
  'whatAreCookiesDesc',
  'howWeUseCookies',
  'howWeUseCookiesDesc',
  'essentialCookies',
  'essentialCookiesDesc',
  'functionalCookies',
  'functionalCookiesDesc',
  'analyticsCookies',
  'analyticsCookiesDesc',
  'marketingCookies',
  'marketingCookiesDesc',
  'storageDetails',
  'storageDetailsDesc',
  'managingCookies',
  'managingCookiesDesc',
  'thirdPartyCookies',
  'thirdPartyCookiesDesc',
  'updatesPolicy',
  'updatesPolicyDesc',
] as const;

export type CookieCopyKey = (typeof COOKIE_COPY_KEYS)[number];
export type CookieCopy = Record<CookieCopyKey, BilingualText>;

export const COOKIE_STORAGE_KEYS = [
  'i18nextLng',
  'softgate_user',
  'softgate_accounts_v1',
  'softgate_wallet_v1',
  'softgate_library_v1',
  'softgate_follows_v1',
  'softgate_engage_v1',
  'softgate_comments_v1',
  'softgate_notifications_v1',
  'softgate_notif_prefs_v1',
  'softgate_recent_searches',
  'softgate.legalReadability',
  'softgate_reader_prefs_v1',
  'softgate_episode_reports_v1',
  'softgate_age_confirm_v1',
  'softgate-shared-data',
] as const;
export type CookieStorageKey = (typeof COOKIE_STORAGE_KEYS)[number];

export type CookieMetaRecord = {
  effectiveDate: string;
  copy: CookieCopy;
  glance: BilingualText[];
};

export type CookieRowRecord = {
  id: string;
  storageKey: CookieStorageKey;
  label: BilingualText;
  description: BilingualText;
  sortOrder: number;
};

export type CookieRowWrite = Omit<CookieRowRecord, 'id'>;
export type CookieRowPatch = Partial<Omit<CookieRowWrite, 'storageKey'>>;

export type CookieStore = {
  ensureSeeded: () => Promise<void>;
  getMeta: () => Promise<CookieMetaRecord>;
  upsertMeta: (input: CookieMetaRecord) => Promise<CookieMetaRecord>;
  listRows: () => Promise<CookieRowRecord[]>;
  findRowById: (id: string) => Promise<CookieRowRecord | null>;
  findRowByStorageKey: (storageKey: string) => Promise<CookieRowRecord | null>;
  createRow: (input: CookieRowWrite) => Promise<CookieRowRecord>;
  updateRow: (id: string, patch: CookieRowPatch) => Promise<CookieRowRecord | null>;
  deleteRow: (id: string) => Promise<boolean>;
};

const bi = (en: string, mm: string): BilingualText => ({ en, mm });

export const DEFAULT_COOKIE_META: CookieMetaRecord = {
  effectiveDate: '2026-09-10',
  copy: {
    cookiesTitle: bi('Cookie Policy', 'ကွတ်ကီး မူဝါဒ'),
    cookiesSeoDesc: bi(
      "SoftGate Comic uses no tracking cookies. Learn what this demo portal stores in your browser's local storage and how to clear it.",
      'SoftGate Comic သည် tracking ကွတ်ကီး မသုံးပါ။ ဤ demo portal က browser local storage ထဲတွင် ဘာသိမ်းဆည်းသည်နှင့် ရှင်းလင်းနည်းကို လေ့လာပါ။',
    ),
    whatAreCookies: bi('What Are Cookies', 'ကွတ်ကီးများ ဆိုသည်မှာ'),
    whatAreCookiesDesc: bi(
      'Cookies are small files sent by websites to your device. Local storage is a similar browser feature that keeps data on your device without sending it anywhere.',
      'ကွတ်ကီးများသည် ဝက်ဘ်ဆိုက်များမှ သင့်စက်ပေါ်သို့ ပို့သည့် သေးငယ်သော ဖိုင်များ ဖြစ်ပါသည်။ Local storage သည် အချက်အလက်ကို မည်သည့်နေရာသို့မျှ မပို့ဘဲ သင့်စက်ပေါ်တွင်သာ သိမ်းဆည်းသော ဆင်တူ browser လုပ်ဆောင်ချက် ဖြစ်ပါသည်။',
    ),
    howWeUseCookies: bi(
      'Cookies & Local Storage We Use',
      'ကျွန်ုပ်တို့ အသုံးပြုသော ကွတ်ကီးနှင့် Local Storage',
    ),
    howWeUseCookiesDesc: bi(
      "We do not use cookies at all. This demo portal uses your browser's local storage to run essential features — sign-in, wallet, Library, reading activity, and the demo catalog — entirely on your device:",
      'ကွတ်ကီး လုံးဝ မသုံးပါ။ ဤ demo portal သည် sign-in၊ ပိုက်ဆံအိတ်၊ Library၊ ဖတ်ရှုမှု လှုပ်ရှားမှုနှင့် demo catalog ကဲ့သို့ မရှိမဖြစ် လုပ်ဆောင်ချက်များအတွက် browser local storage ကို သင့်စက်ပေါ်တွင်သာ အသုံးပြုပါသည် —',
    ),
    essentialCookies: bi('Essential Storage', 'မရှိမဖြစ် Storage'),
    essentialCookiesDesc: bi(
      'Entries required for core features: demo accounts on this device, your signed-in session, and the Coin wallet. Without them, sign-in and premium unlocking cannot work.',
      'အဓိက လုပ်ဆောင်ချက်များအတွက် လိုအပ်သည်များ — ဤစက်ပေါ်ရှိ demo အကောင့်များ၊ ဝင်ရောက်ထားသော session နှင့် Coin ပိုက်ဆံအိတ်။ ၎င်းတို့ မရှိပါက sign-in နှင့် premium ဖွင့်ခြင်း အလုပ်မလုပ်နိုင်ပါ။',
    ),
    functionalCookies: bi('Functional Storage', 'လုပ်ဆောင်ချက် Storage'),
    functionalCookiesDesc: bi(
      'Entries that remember your choices: language, Library subscriptions, author follows, history, likes, series ratings, comments, notifications, recent searches, legal reading preferences, 18+ self-confirm, and the demo catalog copy.',
      'သင့်ရွေးချယ်မှုများ မှတ်ထားသည်များ — ဘာသာစကား၊ Library စာရင်းသွင်းမှုများ၊ စာရေးဆရာ Follow များ၊ မှတ်တမ်း၊ like များ၊ series rating များ၊ comment များ၊ notification များ၊ လတ်တလော ရှာဖွေမှုများ၊ legal ဖတ်ရှုမှု ဆက်တင်များ၊ ၁၈ နှစ်နှင့်အထက် ကိုယ်တိုင် အတည်ပြုချက်နှင့် demo catalog မိတ္တူ။',
    ),
    analyticsCookies: bi('Analytics', 'ခွဲခြမ်းစိတ်ဖြာရေး'),
    analyticsCookiesDesc: bi(
      'None. SoftGate Comic does not use analytics cookies, scripts, or any usage tracking on this demo portal.',
      'မရှိပါ။ SoftGate Comic သည် ဤ demo portal တွင် analytics ကွတ်ကီး၊ script သို့မဟုတ် အသုံးပြုမှု tracking တစ်မျိုးမျှ မသုံးပါ။',
    ),
    marketingCookies: bi('Marketing & Advertising', 'စီးပွားရေးနှင့် ကြော်ငြာ'),
    marketingCookiesDesc: bi(
      'None. There are no advertising or marketing cookies, pixels, or trackers of any kind.',
      'မရှိပါ။ ကြော်ငြာ သို့မဟုတ် marketing ကွတ်ကီး၊ pixel၊ tracker တစ်မျိုးမျှ မရှိပါ။',
    ),
    storageDetails: bi(
      'What We Store In Your Browser',
      'သင့် Browser ထဲတွင် ကျွန်ုပ်တို့ သိမ်းဆည်းသည်များ',
    ),
    storageDetailsDesc: bi(
      'Every entry is essential or functional. Nothing is used for tracking, profiling, or advertising.',
      'အားလုံးသည် မရှိမဖြစ် သို့မဟုတ် လုပ်ဆောင်ချက်အတွက်သာ ဖြစ်ပါသည်။ Tracking၊ profiling သို့မဟုတ် ကြော်ငြာအတွက် တစ်ခုမျှ အသုံးမပြုပါ။',
    ),
    managingCookies: bi('Managing Your Data', 'သင့်အချက်အလက် စီမံခန့်ခွဲခြင်း'),
    managingCookiesDesc: bi(
      'You can clear everything at any time from your browser settings (Clear site data). Doing so signs you out and resets accounts, wallet, Library, history, likes, ratings, catalog cache, and preferences.',
      'Browser ဆက်တင် (Clear site data) မှ အချိန်မရွေး အားလုံး ရှင်းလင်းနိုင်ပါသည်။ ရှင်းလင်းလိုက်ပါက logout ဖြစ်သွားပြီး အကောင့်များ၊ ပိုက်ဆံအိတ်၊ Library၊ မှတ်တမ်း၊ like များ၊ rating များ၊ catalog cache နှင့် ဆက်တင်များ အားလုံး ပြန်လည် စတင်သွားပါမည်။',
    ),
    thirdPartyCookies: bi('Third-Party Cookies', 'တတိယပါတီ ကွတ်ကီးများ'),
    thirdPartyCookiesDesc: bi(
      'None. This demo portal loads no third-party cookies, trackers, or embedded advertising services.',
      'မရှိပါ။ ဤ demo portal သည် တတိယပါတီ ကွတ်ကီး၊ tracker သို့မဟုတ် ကြော်ငြာ ဝန်ဆောင်မှု တစ်ခုမျှ မတင်ပါ။',
    ),
    updatesPolicy: bi('Policy Updates', 'မူဝါဒ ပြောင်းလဲမှုများ'),
    updatesPolicyDesc: bi(
      'We may update this policy as the product evolves — for example, when a real backend replaces local storage. Material changes will appear on this page with a new date.',
      'ထုတ်ကုန် ပြောင်းလဲလာသည်နှင့်အမျှ — ဥပမာ local storage နေရာတွင် backend အစစ် အစားထိုးလာချိန် — ဤမူဝါဒကို ပြင်ဆင်နိုင်ပါသည်။ အရေးကြီး ပြောင်းလဲမှုများကို ရက်စွဲအသစ်ဖြင့် ဤစာမျက်နှာတွင် ဖော်ပြပါမည်။',
    ),
  },
  glance: [
    bi(
      'SoftGate Comic does not set any tracking cookies.',
      'SoftGate Comic သည် tracking ကွတ်ကီး တစ်ခုမျှ မသုံးပါ။',
    ),
    bi('Analytics: none.', 'ခွဲခြမ်းစိတ်ဖြာရေး — မရှိပါ။'),
    bi('Marketing and advertising: none.', 'စီးပွားရေးနှင့် ကြော်ငြာ — မရှိပါ။'),
    bi(
      'The portal uses browser local storage on this device, and session storage for guest 18+ confirm.',
      'Portal သည် ဤစက်ပေါ်ရှိ browser local storage နှင့် ဧည့်သည် ၁၈ နှစ်နှင့်အထက် အတည်ပြုချက်အတွက် session storage ကို အသုံးပြုပါသည်။',
    ),
    bi(
      'Clear site data in your browser to remove everything listed on this page.',
      'ဤစာမျက်နှာတွင် ဖော်ပြထားသမျှ ဖယ်ရှားရန် browser တွင် site data ရှင်းလင်းပါ။',
    ),
  ],
};

export const DEFAULT_COOKIE_ROWS: CookieRowRecord[] = [
  {
    id: 'lang',
    storageKey: 'i18nextLng',
    label: bi('Language preference', 'ဘာသာစကား ရွေးချယ်မှု'),
    description: bi(
      'Remembers your English / Myanmar choice.',
      'English / မြန်မာ ရွေးချယ်မှုကို မှတ်ထားပါသည်။',
    ),
    sortOrder: 1,
  },
  {
    id: 'session',
    storageKey: 'softgate_user',
    label: bi('Account session', 'အကောင့် session'),
    description: bi(
      'Keeps you signed in to your demo account on this device.',
      'ဤစက်ပေါ်ရှိ demo အကောင့်ထဲ ဝင်ရောက်ထားမှုကို ထိန်းသိမ်းပါသည်။',
    ),
    sortOrder: 2,
  },
  {
    id: 'accounts',
    storageKey: 'softgate_accounts_v1',
    label: bi('Demo accounts', 'Demo အကောင့်များ'),
    description: bi(
      'Account records created in this browser, including the password you chose. Credentials stay on this device — this is not a production server.',
      'ဤ browser တွင် ဖန်တီးထားသော အကောင့်မှတ်တမ်းများ၊ သင်ရွေးသော စကားဝှက် အပါအဝင်။ အထောက်အထားများသည် ဤစက်ပေါ်တွင်သာ ရှိပြီး production server မဟုတ်ပါ။',
    ),
    sortOrder: 3,
  },
  {
    id: 'wallet',
    storageKey: 'softgate_wallet_v1',
    label: bi('Coin wallet', 'Coin ပိုက်ဆံအိတ်'),
    description: bi(
      'Your demo Coin balance and top-up history.',
      'သင့် demo Coin လက်ကျန်နှင့် ဖြည့်သွင်းမှု မှတ်တမ်း။',
    ),
    sortOrder: 4,
  },
  {
    id: 'library',
    storageKey: 'softgate_library_v1',
    label: bi('Library & subscriptions', 'Library နှင့် စာရင်းသွင်းမှုများ'),
    description: bi(
      'Series you subscribe to, mute for episode notices, and the last notified episode number. Stored per signed-in demo account.',
      'သင်စာရင်းသွင်းထားသော စီးရီးများ၊ အပိုင်းအသစ် အသိပေးချက် ပိတ်/ဖွင့်နှင့် နောက်ဆုံး အသိပေးခဲ့သော အပိုင်းနံပါတ်။ ဝင်ရောက်ထားသော demo အကောင့်အလိုက် သိမ်းသည်။',
    ),
    sortOrder: 5,
  },
  {
    id: 'follows',
    storageKey: 'softgate_follows_v1',
    label: bi('Author follows', 'စာရေးဆရာ Follow'),
    description: bi(
      'Creators you Follow on this device. This is not a public follower count. Stored per signed-in demo account.',
      'ဤစက်တွင် Follow လုပ်ထားသော ဖန်တီးသူများ။ လူထု follower အရေအတွက် မဟုတ်ပါ။ ဝင်ရောက်ထားသော demo အကောင့်အလိုက် သိမ်းသည်။',
    ),
    sortOrder: 6,
  },
  {
    id: 'engagement',
    storageKey: 'softgate_engage_v1',
    label: bi('History, likes & ratings', 'မှတ်တမ်း၊ like နှင့် rating များ'),
    description: bi(
      'Continue Reading history, episode scroll position, likes, and series ratings on this device.',
      'ဤစက်ပေါ်ရှိ Continue Reading မှတ်တမ်း၊ အပိုင်း scroll နေရာ၊ like များနှင့် series rating များ။',
    ),
    sortOrder: 7,
  },
  {
    id: 'comments',
    storageKey: 'softgate_comments_v1',
    label: bi('Comments', 'Comment များ'),
    description: bi(
      'Comments you have written on episodes and on series discussion threads. Same store for Reader and the series hub.',
      'အပိုင်းများနှင့် စီးရီး ဆွေးနွေးချက်တွင် သင်ရေးသားထားသော comment များ။ Reader နှင့် series hub က တူညီသော store ကို သုံးသည်။',
    ),
    sortOrder: 8,
  },
  {
    id: 'notifications',
    storageKey: 'softgate_notifications_v1',
    label: bi('Notifications', 'Notification များ'),
    description: bi(
      'Your in-app notification list and read state. HTTP mode stores this on the API. Broadcasts, comment replies, and new-episode notices may also email or Web Push when configured.',
      'App တွင်း notification စာရင်းနှင့် ဖတ်ပြီး/မဖတ်ရသေး အခြေအနေ။ HTTP မှာ API တွင် သိမ်းသည်။ Broadcast၊ comment ပြန်ကြားချက်နှင့် အပိုင်းအသစ် အသိပေးချက်များ configured ဖြစ်လျှင် အီးမေးလ် သို့ Web Push ပို့နိုင်သည်။',
    ),
    sortOrder: 9,
  },
  {
    id: 'notifPrefs',
    storageKey: 'softgate_notif_prefs_v1',
    label: bi('Notification preferences', 'Notification ကြိုက်နှစ်သက်မှုများ'),
    description: bi(
      'Which notice types you want: new episodes, comment replies, and promotions. One switch applies to in-app, email, and Web Push. Stored per signed-in account in HTTP mode.',
      'မည်သည့် အသိပေးချက် အမျိုးအစား — အပိုင်းအသစ်၊ comment ပြန်ကြားချက်၊ ကမ်းလှမ်းမှု။ ခလုတ်တစ်ခုသည် in-app၊ အီးမေးလ်၊ Web Push အကုန်။ HTTP တွင် အကောင့်အလိုက် သိမ်းသည်။',
    ),
    sortOrder: 10,
  },
  {
    id: 'searches',
    storageKey: 'softgate_recent_searches',
    label: bi('Recent searches', 'လတ်တလော ရှာဖွေမှုများ'),
    description: bi(
      'Your latest search terms for quick re-search.',
      'အမြန် ပြန်ရှာနိုင်ရန် သင့်နောက်ဆုံး ရှာဖွေမှု စကားလုံးများ။',
    ),
    sortOrder: 11,
  },
  {
    id: 'readability',
    storageKey: 'softgate.legalReadability',
    label: bi('Reading preferences', 'ဖတ်ရှုမှု ဆက်တင်များ'),
    description: bi(
      'Text size and contrast choices on legal pages.',
      'Legal စာမျက်နှာများရှိ စာလုံးအရွယ်နှင့် နောက်ခံအရောင် ရွေးချယ်မှုများ။',
    ),
    sortOrder: 12,
  },
  {
    id: 'reader',
    storageKey: 'softgate_reader_prefs_v1',
    label: bi('Reader display', 'ဖတ်ရှုမျက်နှာပြင်'),
    description: bi(
      'Episode reader theme, brightness, HUD text size, and image fit on this device.',
      'ဤစက်ပေါ်ရှိ အပိုင်းဖတ်ရှု theme၊ အလင်းအမှောင်၊ HUD စာလုံးအရွယ်နှင့် ပုံအရွယ်။',
    ),
    sortOrder: 13,
  },
  {
    id: 'episodeReports',
    storageKey: 'softgate_episode_reports_v1',
    label: bi('Episode reports', 'အပိုင်း တိုင်ကြားချက်များ'),
    description: bi(
      'Episode report flags you confirmed in the reader. Demo only on this device — not a moderation queue and not sent to a server.',
      'စာဖတ်ရာတွင် သင်အတည်ပြုထားသော အပိုင်း တိုင်ကြား အလံများ။ ဤစက်ပေါ် Demo သာ — moderation စာရင်း မဟုတ်၊ ဆာဗာသို့ မပို့ပါ။',
    ),
    sortOrder: 14,
  },
  {
    id: 'ageConfirm',
    storageKey: 'softgate_age_confirm_v1',
    label: bi('18+ age confirm', '၁၈ နှစ်နှင့်အထက် အတည်ပြုချက်'),
    description: bi(
      'Signed-in accounts store one 18+ self-confirm in local storage. Guests store the same confirm in session storage for this tab only. This is not ID verification.',
      'ဝင်ရောက်ထားသော အကောင့်များသည် ၁၈ နှစ်နှင့်အထက် ကိုယ်တိုင် အတည်ပြုချက်ကို local storage တွင် တစ်ကြိမ် သိမ်းသည်။ ဧည့်သည်များသည် ဤတက်ဘ်အတွက် session storage တွင်သာ သိမ်းသည်။ မှတ်ပုံတင် စစ်ဆေးခြင်း မဟုတ်ပါ။',
    ),
    sortOrder: 15,
  },
  {
    id: 'catalog',
    storageKey: 'softgate-shared-data',
    label: bi('Demo catalog', 'Demo catalog'),
    description: bi(
      'A local copy of series and episodes used to run the portal. This is not your reader account.',
      'Portal လည်ပတ်ရန် ဤစက်ပေါ်ရှိ ဇာတ်လမ်းနှင့် အပိုင်းများ၏ ဒေသတွင်း မိတ္တူ။ ဤသည်မှာ သင့်ဖတ်ရှုသူ အကောင့် မဟုတ်ပါ။',
    ),
    sortOrder: 16,
  },
];

export const COOKIE_ROW_ID_BY_KEY: Record<CookieStorageKey, string> = Object.fromEntries(
  DEFAULT_COOKIE_ROWS.map((row) => [row.storageKey, row.id]),
) as Record<CookieStorageKey, string>;

export function isCookieStorageKey(value: string): value is CookieStorageKey {
  return (COOKIE_STORAGE_KEYS as readonly string[]).includes(value);
}

export function persistedBilingual(row: BilingualText): BilingualText {
  return { en: row.en, mm: row.mm };
}

export function persistedCookieCopy(row: CookieCopy): CookieCopy {
  const next = {} as CookieCopy;
  for (const key of COOKIE_COPY_KEYS) {
    next[key] = persistedBilingual(row[key]);
  }
  return next;
}

export function persistedCookieMeta(row: CookieMetaRecord): CookieMetaRecord {
  return {
    effectiveDate: row.effectiveDate,
    copy: persistedCookieCopy(row.copy),
    glance: row.glance.map(persistedBilingual),
  };
}

export function persistedCookieRow(row: CookieRowRecord): CookieRowRecord {
  return {
    id: row.id,
    storageKey: row.storageKey,
    label: persistedBilingual(row.label),
    description: persistedBilingual(row.description),
    sortOrder: row.sortOrder,
  };
}

export function compareCookieRow(
  a: { sortOrder: number; id: string },
  b: { sortOrder: number; id: string },
): number {
  if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
  return a.id.localeCompare(b.id);
}
