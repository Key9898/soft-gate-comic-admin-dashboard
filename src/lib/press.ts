export type BilingualText = { en: string; mm: string };

export const PRESS_STORAGE_KEY = 'softgate_admin_press_v1';
export const PRESS_SCHEMA_VERSION = 1;

export const PRESS_FACT_KEYS = [
  'legalName',
  'product',
  'stage',
  'market',
  'hq',
  'founded',
  'platforms',
  'languages',
  'website',
] as const;

export type PressFactKey = (typeof PRESS_FACT_KEYS)[number];

export type PressCopy = {
  intro: BilingualText;
  boilerplateTitle: BilingualText;
  boilerplate: BilingualText;
  mediaKit: BilingualText;
  mediaKitDesc: BilingualText;
  downloadZip: BilingualText;
  zipHint: BilingualText;
  download: BilingualText;
  paletteTitle: BilingualText;
  usageTitle: BilingualText;
  usageDoTitle: BilingualText;
  usageDontTitle: BilingualText;
  usageDo1: BilingualText;
  usageDo2: BilingualText;
  usageDo3: BilingualText;
  usageDont1: BilingualText;
  usageDont2: BilingualText;
  usageDont3: BilingualText;
  trademark: BilingualText;
  factSheet: BilingualText;
  newsTitle: BilingualText;
  newsIntro: BilingualText;
  newsSlotTitle: BilingualText;
  newsSlotCopy: BilingualText;
  screenshotsTitle: BilingualText;
  stillsNote: BilingualText;
  spokespersonTitle: BilingualText;
  deskBadge: BilingualText;
  deskNote: BilingualText;
  interviewCta: BilingualText;
  contact: BilingualText;
  contactDesc: BilingualText;
  contactHours: BilingualText;
  otherInquiries: BilingualText;
  updated: BilingualText;
};

export const PRESS_COPY_KEYS = [
  'intro',
  'boilerplateTitle',
  'boilerplate',
  'mediaKit',
  'mediaKitDesc',
  'downloadZip',
  'zipHint',
  'download',
  'paletteTitle',
  'usageTitle',
  'usageDoTitle',
  'usageDontTitle',
  'usageDo1',
  'usageDo2',
  'usageDo3',
  'usageDont1',
  'usageDont2',
  'usageDont3',
  'trademark',
  'factSheet',
  'newsTitle',
  'newsIntro',
  'newsSlotTitle',
  'newsSlotCopy',
  'screenshotsTitle',
  'stillsNote',
  'spokespersonTitle',
  'deskBadge',
  'deskNote',
  'interviewCta',
  'contact',
  'contactDesc',
  'contactHours',
  'otherInquiries',
  'updated',
] as const satisfies ReadonlyArray<keyof PressCopy>;

export const PRESS_COPY_LABELS: Record<keyof PressCopy, string> = {
  intro: 'Intro',
  boilerplateTitle: 'Boilerplate title',
  boilerplate: 'Boilerplate',
  mediaKit: 'Brand assets title',
  mediaKitDesc: 'Brand assets blurb',
  downloadZip: 'Download ZIP label',
  zipHint: 'ZIP hint',
  download: 'Download label',
  paletteTitle: 'Palette title',
  usageTitle: 'Logo use title',
  usageDoTitle: 'Do title',
  usageDontTitle: "Don't title",
  usageDo1: 'Do 1',
  usageDo2: 'Do 2',
  usageDo3: 'Do 3',
  usageDont1: "Don't 1",
  usageDont2: "Don't 2",
  usageDont3: "Don't 3",
  trademark: 'Trademark',
  factSheet: 'Fact sheet title',
  newsTitle: 'News title',
  newsIntro: 'News intro',
  newsSlotTitle: 'Empty-news title',
  newsSlotCopy: 'Empty-news body',
  screenshotsTitle: 'Stills title',
  stillsNote: 'Stills note',
  spokespersonTitle: 'Spokesperson title',
  deskBadge: 'Desk badge',
  deskNote: 'Desk note',
  interviewCta: 'Interview CTA',
  contact: 'Contact title',
  contactDesc: 'Contact description',
  contactHours: 'Contact hours',
  otherInquiries: 'Other inquiries',
  updated: 'Updated line',
};

export const PRESS_COPY_TEXTAREA = new Set<keyof PressCopy>([
  'boilerplate',
  'mediaKitDesc',
  'zipHint',
  'trademark',
  'newsIntro',
  'newsSlotCopy',
  'stillsNote',
  'deskNote',
  'contactDesc',
  'contactHours',
  'otherInquiries',
]);

export type PressFact = {
  label: BilingualText;
  value: BilingualText;
  href?: string;
};

export type PressPaletteSwatch = {
  hex: string;
  label: BilingualText;
};

export type PressAsset = {
  name: BilingualText;
  url: string;
  format: string;
};

export type PressMeta = {
  copy: PressCopy;
  zipUrl: string;
  contactEmail: string;
  facts: Record<PressFactKey, PressFact>;
  palette: PressPaletteSwatch[];
  assets: PressAsset[];
  spokespersonMemberId?: string;
};

export type PressNews = {
  id: string;
  title: BilingualText;
  body: BilingualText;
  href?: string;
  sortOrder: number;
  published: boolean;
  demoBadge: boolean;
};

export type PressStill = {
  id: string;
  title: BilingualText;
  imageUrl: string;
  sortOrder: number;
  published: boolean;
  demoBadge: boolean;
};

export type PressSnapshot = {
  meta: PressMeta;
  news: PressNews[];
  stills: PressStill[];
};

const bi = (en: string, mm: string): BilingualText => ({ en, mm });

export const DEFAULT_PRESS_META: PressMeta = {
  copy: {
    intro: bi(
      'News and media information about SoftGate Comic.',
      'SoftGate Comic နှင့် ပတ်သက်သည့် သတင်းများနှင့် မီဒီယာ အချက်အလက်များ။',
    ),
    boilerplateTitle: bi('About SoftGate Comic', 'SoftGate Comic အကြောင်း'),
    boilerplate: bi(
      'SoftGate Comic is the webtoon reading portal of SoftGate, designed for readers in Myanmar. The platform offers a curated webtoon catalog with English and Myanmar interfaces, episode reading, bookmarks, and a coin-based unlock system. SoftGate Comic is currently a demo portal in active development.',
      'SoftGate Comic သည် SoftGate ၏ ဝဘ်တွန်း ဖတ်ရှုရေး portal ဖြစ်ပြီး မြန်မာစာဖတ်သူများအတွက် ဒီဇိုင်းထုတ်ထားပါသည်။ အင်္ဂလိပ်နှင့် မြန်မာ ဘာသာစကား နှစ်မျိုးဖြင့် ရွေးချယ်ထားသော ဝဘ်တွန်း စာရင်း၊ အပိုင်းလိုက် ဖတ်ရှုခြင်း၊ bookmark နှင့် coin ဖြင့် ဖွင့်ယူသည့် စနစ်တို့ ပါဝင်ပါသည်။ SoftGate Comic သည် လက်ရှိတွင် ဖွံ့ဖြိုးဆဲ demo portal ဖြစ်ပါသည်။',
    ),
    mediaKit: bi('Brand Assets', 'မီဒီယာကိရိယာ'),
    mediaKitDesc: bi(
      'Official SoftGate Comic logo and icon files for media and partner use. Download the ZIP first; single files are also listed.',
      'မီဒီယာနှင့် ပါတနာများ အသုံးပြုရန် SoftGate Comic ၏ တရားဝင် logo နှင့် icon ဖိုင်များ။ ZIP ကို အရင် ဒေါင်းလုဒ်လုပ်ပါ။ တစ်ဖိုင်ချင်းလည်း ရှိပါသည်။',
    ),
    downloadZip: bi('Download media kit', 'မီဒီယာကိရိယာ ဒေါင်းလုဒ်'),
    zipHint: bi(
      'The ZIP contains logo.svg, logo.png, and icon-512.png at the archive root — the same bytes as the files below.',
      'ZIP ထဲတွင် archive ရင်းမြစ်၌ logo.svg၊ logo.png နှင့် icon-512.png သုံးဖိုင် ပါသည် — အောက်ပါ ဖိုင်များနှင့် တူညီသော bytes ဖြစ်သည်။',
    ),
    download: bi('Download', 'ဒေါင်းလုဒ်'),
    paletteTitle: bi('Brand colors', 'အမှတ်အသား အရောင်များ'),
    usageTitle: bi('Logo use', 'Logo အသုံးပြုခြင်း'),
    usageDoTitle: bi('Do', 'လုပ်ပါ'),
    usageDontTitle: bi("Don't", 'မလုပ်ပါနှင့်'),
    usageDo1: bi(
      'Keep the logo colors and proportions as provided.',
      'ပေးထားသော logo အရောင်နှင့် အချိုးအစားကို ထားပါ။',
    ),
    usageDo2: bi('Leave clear space around the mark.', 'အမှတ်ပတ်လည်တွင် နေရာလွတ် ချန်ထားပါ။'),
    usageDo3: bi(
      'Use the provided SVG or PNG files; do not redraw the mark.',
      'ပေးထားသော SVG သို့မဟုတ် PNG ကို သုံးပါ။ အမှတ်ကို ပြန်မဆွဲပါနှင့်။',
    ),
    usageDont1: bi(
      'Do not recolor, stretch, or rotate the logo.',
      'Logo ကို အရောင်ပြင်ခြင်း၊ ဆွဲဆန့်ခြင်း၊ လှည့်ခြင်း မပြုပါနှင့်။',
    ),
    usageDont2: bi(
      'Do not place the logo on a busy background.',
      'နောက်ခံရှုပ်သော နေရာတွင် logo မထားပါနှင့်။',
    ),
    usageDont3: bi(
      'Do not use the browser tab favicon as the logo.',
      'Browser tab favicon ကို logo အဖြစ် မသုံးပါနှင့်။',
    ),
    trademark: bi(
      'SoftGate and SoftGate Comic names and marks are trademarks of SoftGate. Use them only to identify this product.',
      'SoftGate နှင့် SoftGate Comic အမည်နှင့် အမှတ်များသည် SoftGate ၏ trademark များဖြစ်သည်။ ဤထုတ်ကုန်ကို ဖော်ပြရန်သာ သုံးပါ။',
    ),
    factSheet: bi('Fact Sheet', 'အချက်အလက်များ'),
    newsTitle: bi('News', 'သတင်းများ'),
    newsIntro: bi(
      'This is a press-kit archive, not a live newsroom CMS. Public releases will land here when they exist.',
      'ဤစာမျက်နှာသည် press-kit စုစည်းမှုဖြစ်ပြီး တိုက်ရိုက် သတင်းခန်း CMS မဟုတ်ပါ။ အများသုံး ကြေညာချက်များ ရှိလာသောအခါ ဤနေရာတွင် ထည့်သွားပါမည်။',
    ),
    newsSlotTitle: bi('No public press release yet', 'အများသုံး press release မရှိသေး'),
    newsSlotCopy: bi(
      'This Demo row is a client-swap slot. SoftGate Comic has not published public press releases, coverage logos, or traffic metrics.',
      'ဤ Demo အတန်းသည် client-swap နေရာဖြစ်သည်။ SoftGate Comic သည် အများသုံး press release၊ coverage logo သို့မဟုတ် လာရောက်ကြည့်ရှုမှု ကိန်းဂဏန်းများ မထုတ်ပြန်ရသေးပါ။',
    ),
    screenshotsTitle: bi('Product images', 'ထုတ်ကုန်ပုံများ'),
    stillsNote: bi(
      'Guest-open Demo stills of this portal for client swap. Home is the live Home. Hub and Reader cards use always-on Company pages while the published catalog is empty — not a login wall or a 404.',
      'ဤ portal ၏ ဧည့်သည်ဖွင့်နိုင်သော Demo stills ဖြစ်ပြီး client-swap အတွက်ဖြစ်သည်။ ပင်မစာမျက်နှာသည် တကယ့် Home ဖြစ်သည်။ ထုတ်ဝေပြီးသော catalog ဗလာဖြစ်နေစဉ် hub နှင့် Reader ကတ်များသည် အမြဲဖွင့်နိုင်သော Company စာမျက်နှာများကို သုံးသည် — login နံရံ သို့မဟုတ် 404 မဟုတ်ပါ။',
    ),
    spokespersonTitle: bi('Spokesperson', 'ပြောရေးဆိုခွင့်ရှိသူ'),
    deskBadge: bi('Media desk (Demo)', 'မီဒီယာစားပွဲ (Demo)'),
    deskNote: bi(
      'Portrait and name are stand-ins until the studio publishes its public roster. Interview requests go to the media email.',
      'ဓာတ်ပုံနှင့် အမည်သည် စတူဒီယိုက အများပြည်သူ စာရင်း မထုတ်မချင်း ယာယီဖြစ်သည်။ အင်တာဗျူး တောင်းဆိုမှုများကို မီဒီယာအီးမေးလ်သို့ ပို့ပါ။',
    ),
    interviewCta: bi('Request an interview', 'အင်တာဗျူး တောင်းဆိုရန်'),
    contact: bi('Media Contact', 'မီဒီယာ ဆက်သွယ်ရန်'),
    contactDesc: bi(
      'For interviews, media questions, or asset requests, email our media team.',
      'အင်တာဗျူးများ၊ မီဒီယာ မေးမြန်းချက်များ သို့မဟုတ် asset တောင်းဆိုမှုများအတွက် ကျွန်ုပ်တို့၏ မီဒီယာအဖွဲ့ထံ အီးမေးလ် ပို့နိုင်ပါသည်။',
    ),
    contactHours: bi(
      'We are based in Myanmar (Yangon time). We do not publish a reply SLA.',
      'ကျွန်ုပ်တို့သည် မြန်မာနိုင်ငံ (ရန်ကုန် အချိန်) တွင် အခြေစိုက်ပါသည်။ ပြန်ကြားချိန် ကတိ မထားပါ။',
    ),
    otherInquiries: bi(
      'For reader or creator questions, use Contact or Creators — not this press inbox.',
      'စာဖတ်သူ သို့မဟုတ် ဖန်တီးသူ မေးခွန်းများအတွက် ဆက်သွယ်ရန် သို့မဟုတ် ဖန်တီးသူများ စာမျက်နှာကို သုံးပါ — ဤ press inbox မဟုတ်ပါ။',
    ),
    updated: bi('Last updated 10 September 2026', 'နောက်ဆုံး ပြင်ဆင်သည့်ရက် ၁၀ စက်တင်ဘာ ၂၀၂၆'),
  },
  zipUrl: '/press-kit/softgate-comic-press-kit.zip',
  contactEmail: 'press@softgatecomic.com',
  facts: {
    legalName: { label: bi('Legal name', 'တရားဝင်အမည်'), value: bi('SoftGate', 'SoftGate') },
    product: {
      label: bi('Product', 'ထုတ်ကုန်'),
      value: bi('Webtoon reading portal (web)', 'ဝဘ်တွန်း ဖတ်ရှုရေး portal (web)'),
    },
    stage: {
      label: bi('Stage', 'အဆင့်'),
      value: bi('Demo portal — in development', 'Demo portal — ဖွံ့ဖြိုးဆဲ'),
    },
    market: { label: bi('Focus market', 'ဦးတည်ဈေးကွက်'), value: bi('Myanmar', 'မြန်မာ') },
    hq: {
      label: bi('Headquarters', 'ရုံးချုပ်'),
      value: bi('Insein, Yangon', 'အင်းစိန်၊ ရန်ကုန်မြို့'),
    },
    founded: { label: bi('Founded', 'တည်ထောင်သည့်နှစ်'), value: bi('2026', '2026') },
    platforms: { label: bi('Platforms', 'ပလက်ဖောင်းများ'), value: bi('Web', 'Web') },
    languages: {
      label: bi('Languages', 'ဘာသာစကားများ'),
      value: bi('English & Myanmar', 'အင်္ဂလိပ်နှင့် မြန်မာ'),
    },
    website: {
      label: bi('Website', 'ဝဘ်ဆိုက်'),
      value: bi('https://softgatecomic.com', 'https://softgatecomic.com'),
      href: 'https://softgatecomic.com',
    },
  },
  palette: [
    { hex: '#0e9494', label: bi('CTA / theme', 'CTA / theme') },
    { hex: '#69c9ca', label: bi('Letter fill', 'စာလုံး ဖြည့်အရောင်') },
    { hex: '#ee3968', label: bi('Burst', 'Burst') },
    { hex: '#ef4124', label: bi('Tip / flame', 'ထိပ် / မီးလျှံ') },
    { hex: '#010101', label: bi('Ink', 'မင်') },
  ],
  assets: [
    {
      name: bi('Primary logo (vector)', 'အဓိက logo (vector)'),
      url: '/logo/logo.svg',
      format: 'SVG',
    },
    { name: bi('Primary logo', 'အဓိက logo'), url: '/logo/logo.png', format: 'PNG' },
    { name: bi('Icon (square)', 'Icon (စတုရန်း)'), url: '/favicon/icon-512.png', format: 'PNG' },
  ],
};

export const DEFAULT_PRESS_SNAPSHOT: PressSnapshot = {
  meta: DEFAULT_PRESS_META,
  news: [],
  stills: [],
};

function bilingual(row: BilingualText): BilingualText {
  return { en: row.en, mm: row.mm };
}

export function persistedMeta(row: PressMeta): PressMeta {
  const copy = {} as PressCopy;
  for (const key of PRESS_COPY_KEYS) copy[key] = bilingual(row.copy[key]);
  const facts = {} as Record<PressFactKey, PressFact>;
  for (const key of PRESS_FACT_KEYS) {
    const fact: PressFact = {
      label: bilingual(row.facts[key].label),
      value: bilingual(row.facts[key].value),
    };
    if (row.facts[key].href) fact.href = row.facts[key].href;
    facts[key] = fact;
  }
  const next: PressMeta = {
    copy,
    zipUrl: row.zipUrl,
    contactEmail: row.contactEmail,
    facts,
    palette: row.palette.map((item) => ({ hex: item.hex, label: bilingual(item.label) })),
    assets: row.assets.map((item) => ({
      name: bilingual(item.name),
      url: item.url,
      format: item.format,
    })),
  };
  if (row.spokespersonMemberId) next.spokespersonMemberId = row.spokespersonMemberId;
  return next;
}

export function persistedNews(row: PressNews): PressNews {
  const next: PressNews = {
    id: row.id,
    title: bilingual(row.title),
    body: bilingual(row.body),
    sortOrder: row.sortOrder,
    published: row.published,
    demoBadge: row.demoBadge,
  };
  if (row.href) next.href = row.href;
  return next;
}

export function persistedStill(row: PressStill): PressStill {
  return {
    id: row.id,
    title: bilingual(row.title),
    imageUrl: row.imageUrl,
    sortOrder: row.sortOrder,
    published: row.published,
    demoBadge: row.demoBadge,
  };
}

export function comparePressRow(
  a: { sortOrder: number; id: string },
  b: { sortOrder: number; id: string },
) {
  if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
  return a.id.localeCompare(b.id);
}

export function sortNews(rows: PressNews[]): PressNews[] {
  return rows.slice().sort(comparePressRow);
}

export function sortStills(rows: PressStill[]): PressStill[] {
  return rows.slice().sort(comparePressRow);
}

function nextPrefixedId(prefix: string, rows: Array<{ id: string }>): string {
  let max = 0;
  for (const row of rows) {
    const match = new RegExp(`^${prefix}(\\d+)$`).exec(row.id);
    const n = match ? Number(match[1]) : /^\d+$/.test(row.id) ? Number(row.id) : null;
    if (n != null && n > max) max = n;
  }
  return `${prefix}${max + 1}`;
}

export function nextPressNewsId(rows: PressNews[]): string {
  return nextPrefixedId('n', rows);
}

export function nextPressStillId(rows: PressStill[]): string {
  return nextPrefixedId('s', rows);
}

export function loadPress(): PressSnapshot {
  const raw = localStorage.getItem(PRESS_STORAGE_KEY);
  if (!raw) return { meta: persistedMeta(DEFAULT_PRESS_META), news: [], stills: [] };
  try {
    const parsed = JSON.parse(raw) as {
      schemaVersion?: number;
      meta?: PressMeta;
      news?: PressNews[];
      stills?: PressStill[];
    };
    if (
      parsed.schemaVersion !== PRESS_SCHEMA_VERSION ||
      !parsed.meta ||
      !Array.isArray(parsed.news)
    ) {
      return { meta: persistedMeta(DEFAULT_PRESS_META), news: [], stills: [] };
    }
    return {
      meta: persistedMeta(parsed.meta),
      news: parsed.news.map(persistedNews),
      stills: Array.isArray(parsed.stills) ? parsed.stills.map(persistedStill) : [],
    };
  } catch {
    return { meta: persistedMeta(DEFAULT_PRESS_META), news: [], stills: [] };
  }
}

export function savePress(snapshot: PressSnapshot): void {
  localStorage.setItem(
    PRESS_STORAGE_KEY,
    JSON.stringify({
      schemaVersion: PRESS_SCHEMA_VERSION,
      meta: persistedMeta(snapshot.meta),
      news: snapshot.news.map(persistedNews),
      stills: snapshot.stills.map(persistedStill),
    }),
  );
}
