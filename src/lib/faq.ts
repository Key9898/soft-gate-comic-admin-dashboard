export type BilingualText = { en: string; mm: string };

export const FAQ_META_ID = 'faq';

export const FAQ_CATEGORIES = ['general', 'account', 'payments', 'content'] as const;
export type FaqCategory = (typeof FAQ_CATEGORIES)[number];

export const FAQ_RELATED_PATHS = [
  '/',
  '/profile',
  '/coins',
  '/contact',
  '/creators',
  '/library',
  '/notifications',
] as const;
export type FaqRelatedPath = (typeof FAQ_RELATED_PATHS)[number];

export type FaqMetaRecord = {
  nextItemNumber: number;
};

export type FaqItemRecord = {
  id: string;
  category: FaqCategory;
  question: BilingualText;
  answer: BilingualText;
  relatedTo?: FaqRelatedPath;
  relatedLabel?: BilingualText;
  sortOrder: number;
  published: boolean;
};

export type FaqItemWrite = Omit<FaqItemRecord, 'id'>;
export type FaqItemPatch = Partial<FaqItemWrite>;

export type FaqStore = {
  ensureSeeded: () => Promise<void>;
  getMeta: () => Promise<FaqMetaRecord>;
  listItems: () => Promise<FaqItemRecord[]>;
  findItemById: (id: string) => Promise<FaqItemRecord | null>;
  createItem: (input: FaqItemWrite) => Promise<FaqItemRecord>;
  updateItem: (id: string, patch: FaqItemPatch) => Promise<FaqItemRecord | null>;
  deleteItem: (id: string) => Promise<boolean>;
};

const bi = (en: string, mm: string): BilingualText => ({ en, mm });

export const DEFAULT_FAQ_META: FaqMetaRecord = { nextItemNumber: 21 };

export const DEFAULT_FAQ_ITEMS: FaqItemRecord[] = [
  {
    id: 'q1',
    category: 'general',
    question: bi('What is SoftGate Comic?', 'SoftGate Comic ဆိုတာ ဘာလဲ'),
    answer: bi(
      "SoftGate Comic is SoftGate's webtoon reading portal for Myanmar readers. This demo portal is in active development.",
      'SoftGate Comic သည် SoftGate ၏ မြန်မာစာဖတ်သူများအတွက် ဝဘ်တွန်း ဖတ်ရှုရေး portal ဖြစ်ပါသည်။ ဤ demo portal သည် ဖွံ့ဖြိုးဆဲ ဖြစ်ပါသည်။',
    ),
    sortOrder: 1,
    published: true,
  },
  {
    id: 'q2',
    category: 'general',
    question: bi('Is SoftGate Comic free to use?', 'SoftGate Comic ကို အခမဲ့ အသုံးပြုနိုင်ပါသလား'),
    answer: bi(
      'Yes, SoftGate Comic has many free webtoons. Only premium episodes require coins.',
      'ဟုတ်ကဲ့၊ SoftGate Comic တွင် အခမဲ့ webtoon များစွာ ရှိပါသည်။ အရစ်ကျစား အပိုင်းများအတွက်သာ ဒင်္ဂါး လိုအပ်ပါသည်။',
    ),
    sortOrder: 2,
    published: true,
  },
  {
    id: 'q3',
    category: 'general',
    question: bi('What devices can I use?', 'မည်သည့် စက်ပစ္စည်းများတွင် အသုံးပြုနိုင်ပါသလား'),
    answer: bi(
      'SoftGate Comic is a web portal. You can read in a desktop, tablet, or phone browser. Native iOS and Android apps are not listed in stores yet.',
      'SoftGate Comic သည် ဝဘ် portal ဖြစ်ပါသည်။ ကွန်ပျူတာ၊ တက်ဘလက် သို့မဟုတ် ဖုန်း browser တွင် ဖတ်နိုင်ပါသည်။ iOS နှင့် Android အက်ပ်များကို စတိုးတွင် မတင်ရသေးပါ။',
    ),
    sortOrder: 3,
    published: true,
  },
  {
    id: 'q4',
    category: 'account',
    question: bi('How do I create an account?', 'အကောင့် မည်ကဲ့သို့ ဖန်တီးမည်နည်း'),
    answer: bi(
      'You can create an account with email and password on the registration page.',
      'မှတ်ပုံတင် စာမျက်နှာတွင် အီးမေးလ်နှင့် စကားဝှက်ဖြင့် အကောင့် ဖန်တီးနိုင်ပါသည်။',
    ),
    relatedTo: '/profile',
    relatedLabel: bi('Profile', 'ပရိုဖိုင်'),
    sortOrder: 4,
    published: true,
  },
  {
    id: 'q5',
    category: 'account',
    question: bi('What if I forget my password?', 'စကားဝှက် မေ့နေပါက မည်ကဲ့သို့ လုပ်ဆောင်မည်နည်း'),
    answer: bi(
      'When mock is on (VITE_USE_MOCK_API is not false), Forgot password is an on-page email, one-time code, and new password form that does not send mail or save a password. When the portal uses the live API (VITE_USE_MOCK_API=false), a reset link is emailed if the account exists and mail is connected. The committed .env.example is false; Vite does not load the example. Local pnpm dev HTTP uses gitignored .env.development.local. Unset (including tests and Vercel without the var) stays mock. While signed in, you can still change your password from Profile → Security.',
      'Mock ဖွင့်ထားလျှင် (VITE_USE_MOCK_API က false မဟုတ်) Forgot password သည် အီးမေးလ်၊ တစ်ကြိမ်သုံးကုဒ်၊ စကားဝှက်အသစ် သုံးဆင့်ဖြစ်ပြီး မေးလ်မပို့သလို စကားဝှက်လည်း မသိမ်းပါ။ Portal က live API သုံးသောအခါ (VITE_USE_MOCK_API=false) အကောင့်ရှိပြီး mail ချိတ်ထားပါက ပြန်သတ်မှတ်လင့်ခ် ပို့ပါသည်။ Committed .env.example သည် false ဖြစ်သည်။ Vite က example ကို မဖတ်ပါ။ Local pnpm dev HTTP သည် gitignored .env.development.local ကို သုံးသည်။ Unset (test နှင့် Vercel var မရှိ) သည် mock ဖြစ်သည်။ အကောင့်ဝင်ထားစဉ် Profile → Security မှ စကားဝှက် ပြောင်းနိုင်ပါသည်။',
    ),
    relatedTo: '/profile',
    relatedLabel: bi('Profile', 'ပရိုဖိုင်'),
    sortOrder: 5,
    published: true,
  },
  {
    id: 'q6',
    category: 'account',
    question: bi('Can I delete my account?', 'အကောင့်ကို ဖျက်နိုင်ပါသလား'),
    answer: bi(
      'Signed-in readers can delete the account from Profile → Security (password confirm). In this demo, delete applies on this device and this browser. Guests have no account to delete.',
      'အကောင့်ဝင်ထားသူများသည် Profile → Security တွင် စကားဝှက် အတည်ပြုပြီး အကောင့် ဖျက်နိုင်ပါသည်။ ဤဒီမိုတွင် ဖျက်ခြင်းသည် ဤစက်နှင့် ဤ browser တွင် သက်ဆိုင်ပါသည်။ ဧည့်သည်များတွင် ဖျက်ရန် အကောင့် မရှိပါ။',
    ),
    relatedTo: '/profile',
    relatedLabel: bi('Profile', 'ပရိုဖိုင်'),
    sortOrder: 6,
    published: true,
  },
  {
    id: 'q7',
    category: 'payments',
    question: bi('How do I buy coins?', 'ဒင်္ဂါးများ မည်ကဲ့သို့ ဝယ်ယူမည်နည်း'),
    answer: bi(
      'Use demo coin top-up on the Coins page. Coins stay on this browser only — there is no live payment method yet.',
      'ဒင်္ဂါး စာမျက်နှာတွင် ဒီမို ဒင်္ဂါး ဖြည့်သွင်းပါ။ ဒင်္ဂါးများသည် ဤ browser တွင်သာ ရှိပြီး ငွေပေးချေမှု နည်းလမ်း အစစ် မရှိသေးပါ။',
    ),
    relatedTo: '/coins',
    relatedLabel: bi('Coins', 'ဒင်္ဂါး'),
    sortOrder: 7,
    published: true,
  },
  {
    id: 'q8',
    category: 'payments',
    question: bi(
      'What payment methods are accepted?',
      'မည်သည့် ငွေပေးချေမှု နည်းလမ်းများ လက်ခံပါသလား',
    ),
    answer: bi(
      'This demo portal uses a demo coin top-up only — no real payments are processed yet. Methods like MMQR and cards arrive with the production release.',
      'ဤ demo portal တွင် demo ဒင်္ဂါး ဖြည့်သွင်းမှုသာ ရှိပြီး ငွေပေးချေမှု အစစ် မလုပ်ဆောင်သေးပါ။ MMQR နှင့် ကတ်များကဲ့သို့ နည်းလမ်းများသည် production ထွက်ရှိချိန်တွင် ပါဝင်လာပါမည်။',
    ),
    relatedTo: '/coins',
    relatedLabel: bi('Coins', 'ဒင်္ဂါး'),
    sortOrder: 8,
    published: true,
  },
  {
    id: 'q9',
    category: 'payments',
    question: bi('Are coins refundable?', 'ဒင်္ဂါးများ ပြန်လည် ရယူနိုင်ပါသလား'),
    answer: bi(
      'Demo coins are not live purchases. Refunds apply when real payments ship.',
      'ဒီမို ဒင်္ဂါးများသည် ငွေပေးချေမှု အစစ် မဟုတ်ပါ။ ငွေပေးချေမှု အစစ် ရောက်မှ ပြန်အမ်းခြင်း သက်ဆိုင်ပါမည်။',
    ),
    sortOrder: 9,
    published: true,
  },
  {
    id: 'q10',
    category: 'content',
    question: bi(
      'When are new webtoons released?',
      'Webtoon အသစ်များ မည်သည့်အချိန်တွင် ထွက်ရှိပါသလား',
    ),
    answer: bi(
      'New titles appear on Home New Releases. Each series follows its own update rhythm. SoftGate does not promise a portal-wide drop day.',
      'ဇာတ်လမ်းအသစ်များကို ပင်မစာမျက်နှာ New Releases တွင် တွေ့နိုင်ပါသည်။ ဇာတ်လမ်းတစ်ခုချင်းစီတွင် ကိုယ်ပိုင် အပ်ဒိတ် အချိန်ရှိပါသည်။ SoftGate သည် portal တစ်ခုလုံးအတွက် drop day မကတိမထားပါ။',
    ),
    relatedTo: '/',
    relatedLabel: bi('Home', 'ပင်မစာမျက်နှာ'),
    sortOrder: 10,
    published: true,
  },
  {
    id: 'q11',
    category: 'content',
    question: bi('How do I request a webtoon?', 'Webtoon တစ်ခုကို မည်ကဲ့သို့ တောင်းဆိုမည်နည်း'),
    answer: bi(
      'Use Contact. Name the series and why you want it. A request is not a promise we will license or publish it.',
      'Contact ကို သုံးပါ။ ဇာတ်လမ်းအမည်နှင့် ဘာကြောင့် လိုချင်သည်ကို ရေးပါ။ တောင်းဆိုမှုသည် ကျွန်ုပ်တို့ လိုင်စင်ယူမည် သို့မဟုတ် တင်မည်ဟု ကတိ မဟုတ်ပါ။',
    ),
    relatedTo: '/contact',
    relatedLabel: bi('Contact', 'ဆက်သွယ်ရန်'),
    sortOrder: 11,
    published: true,
  },
  {
    id: 'q12',
    category: 'content',
    question: bi(
      'How do I unlock premium episodes?',
      'Premium အပိုင်းများကို မည်ကဲ့သို့ ဖွင့်မည်နည်း',
    ),
    answer: bi(
      'Premium episodes unlock with coins, or become free after a Demo wait-for-free time listed on the episode. Coins skip the wait and need a signed-in wallet. Wait-for-free is not a live publisher clock or a daily 23:59 reset.',
      'Premium အပိုင်းများကို ဒင်္ဂါးဖြင့် ဖွင့်နိုင်သည်၊ သို့မဟုတ် အပိုင်းပေါ်တွင် ဖော်ပြထားသော Demo wait-for-free အချိန်ကျော်လျှင် အခမဲ့ ဖြစ်သည်။ ဒင်္ဂါးဖြင့် စောင့်ချိန်ကျော်ရန် signed-in wallet လိုသည်။ Wait-for-free သည် live publisher နာရီ မဟုတ်၊ နေ့စဉ် 23:59 reset မဟုတ်ပါ။',
    ),
    relatedTo: '/coins',
    relatedLabel: bi('Coins', 'ဒင်္ဂါး'),
    sortOrder: 12,
    published: true,
  },
  {
    id: 'q13',
    category: 'content',
    question: bi('How does Continue Reading work?', 'Continue Reading မည်ကဲ့သို့ အလုပ်လုပ်ပါသလဲ'),
    answer: bi(
      'Your reading progress is saved on this browser. The Home page shows a Continue Reading rail so you can resume the exact episode where you left off.',
      'သင့်ဖတ်ရှုမှု မှတ်တမ်းကို ဤ browser တွင် သိမ်းဆည်းထားပါသည်။ ပင်မစာမျက်နှာရှိ Continue Reading အပိုင်းမှ ရပ်ထားခဲ့သည့် အပိုင်းကို ဆက်ဖတ်နိုင်ပါသည်။',
    ),
    relatedTo: '/',
    relatedLabel: bi('Home', 'ပင်မစာမျက်နှာ'),
    sortOrder: 13,
    published: true,
  },
  {
    id: 'q14',
    category: 'content',
    question: bi(
      'Can I publish my own webtoon on SoftGate Comic?',
      'ကိုယ်ပိုင် webtoon ကို SoftGate Comic တွင် တင်နိုင်ပါသလား',
    ),
    answer: bi(
      'Not through an in-portal upload. Format requirements and Send your pitch are on the Publish with Us page. That page opens Contact with a labeled pitch form.',
      'Portal ထဲက Upload ခလုတ် မရှိပါ။ Format လိုအပ်ချက်များနှင့် Pitch ပို့ရန် ကို ဇာတ်လမ်းတင်ရန် စာမျက်နှာမှာ ကြည့်ပါ။ အဲ့ဒီကနေ labeled pitch form ပါသော ဆက်သွယ်ရန် စာမျက်နှာကို ဖွင့်သည်။',
    ),
    relatedTo: '/creators',
    relatedLabel: bi('Publish with Us', 'ဇာတ်လမ်းတင်ရန်'),
    sortOrder: 14,
    published: true,
  },
  {
    id: 'q15',
    category: 'general',
    question: bi('Can I read without an account?', 'အကောင့်မရှိဘဲ ဖတ်နိုင်ပါသလား'),
    answer: bi(
      'Yes. Guests can browse and read free episodes, and Demo wait-for-free episodes after the listed time. Coins unlock and Library need sign-in.',
      'ဖတ်နိုင်ပါသည်။ ဧည့်သည်သည် အခမဲ့ အပိုင်းများနှင့် စာရင်းတင်ထားသော Demo wait-for-free အချိန်ကျော်ပြီးသော အပိုင်းများကို ဖတ်နိုင်သည်။ ဒင်္ဂါးဖြင့် ဖွင့်ခြင်းနှင့် Library အတွက် အကောင့်ဝင်ရန် လိုသည်။',
    ),
    relatedTo: '/profile',
    relatedLabel: bi('Profile', 'ပရိုဖိုင်'),
    sortOrder: 15,
    published: true,
  },
  {
    id: 'q16',
    category: 'content',
    question: bi('Where is Subscribe and Library?', 'စာရင်းသွင်းမှုနှင့် စာကြည့်တိုက် ဘယ်မှာလဲ'),
    answer: bi(
      'Signed-in Library holds series you subscribe to. Guests cannot persist a subscription; sign in first.',
      'အကောင့်ဝင်ထားသော စာကြည့်တိုက်တွင် သင်စာရင်းသွင်းထားသော စီးရီးများ ရှိပါသည်။ ဧည့်သည်များ စာရင်းသွင်းမှု မသိမ်းပါ — အရင်ဝင်ရောက်ပါ။',
    ),
    relatedTo: '/library',
    relatedLabel: bi('Library', 'စာကြည့်တိုက်'),
    sortOrder: 16,
    published: true,
  },
  {
    id: 'q17',
    category: 'account',
    question: bi('How do notifications work?', 'အကြောင်းကြားချက်များ မည်ကဲ့သို့ အလုပ်လုပ်ပါသလဲ'),
    answer: bi(
      'The inbox is in-app. Broadcasts, comment replies, and new-episode notices can also email or Web Push when those channels are configured.',
      'Inbox သည် app အတွင်း စာရင်း ဖြစ်သည်။ Broadcast၊ comment ပြန်ကြားချက်နှင့် အပိုင်းအသစ် အသိပေးချက်များ configured ဖြစ်လျှင် အီးမေးလ် သို့ Web Push ပို့နိုင်သည်။',
    ),
    relatedTo: '/notifications',
    relatedLabel: bi('Notifications', 'အကြောင်းကြားချက်များ'),
    sortOrder: 17,
    published: true,
  },
  {
    id: 'q18',
    category: 'content',
    question: bi(
      'How do I report a content concern?',
      'အကြောင်းအရာ စိုးရိမ်ချက်ကို မည်ကဲ့သို့ တိုင်ကြားမည်နည်း',
    ),
    answer: bi(
      'Use Contact. Include the series title and what you saw. This demo has no public report dashboard.',
      'Contact ကို သုံးပါ။ ဇာတ်လမ်းခေါင်းစဉ်နှင့် မြင်တွေ့သည့်အရာကို ထည့်ပါ။ ဤဒီမိုတွင် အများပြည်သူ တိုင်ကြားမှု ဒက်ရှ်ဘုတ် မရှိပါ။',
    ),
    relatedTo: '/contact',
    relatedLabel: bi('Contact', 'ဆက်သွယ်ရန်'),
    sortOrder: 18,
    published: true,
  },
  {
    id: 'q19',
    category: 'general',
    question: bi('How do I change language?', 'ဘာသာစကား မည်ကဲ့သို့ ပြောင်းမည်နည်း'),
    answer: bi(
      'Use the language switcher in the header. English and Myanmar are available. Your choice is saved in this browser.',
      'ခေါင်းစီးရှိ ဘာသာပြောင်းခလုတ်ကို သုံးပါ။ အင်္ဂလိပ်နှင့် မြန်မာ ရရှိပါသည်။ ရွေးချယ်မှုကို ဤ browser တွင် သိမ်းထားပါသည်။',
    ),
    sortOrder: 19,
    published: true,
  },
  {
    id: 'q20',
    category: 'account',
    question: bi(
      'Where is my data stored in this demo?',
      'ဤဒီမိုတွင် ကျွန်ုပ်၏ ဒေတာ ဘယ်မှာ သိမ်းထားပါသလဲ',
    ),
    answer: bi(
      'On this browser and this device. Clearing site data resets demo coins and library. This is not a production cloud account.',
      'ဤ browser နှင့် ဤစက်တွင် သိမ်းထားပါသည်။ ဆိုက်ဒေတာ ရှင်းလျှင် ဒီမို ဒင်္ဂါးနှင့် စာကြည့်တိုက် ပြန်လည် သတ်မှတ်ပါသည်။ production cloud အကောင့် မဟုတ်ပါ။',
    ),
    relatedTo: '/profile',
    relatedLabel: bi('Profile', 'ပရိုဖိုင်'),
    sortOrder: 20,
    published: true,
  },
];

export function isFaqCategory(value: string): value is FaqCategory {
  return (FAQ_CATEGORIES as readonly string[]).includes(value);
}

export function isFaqRelatedPath(value: string): value is FaqRelatedPath {
  return (FAQ_RELATED_PATHS as readonly string[]).includes(value);
}

export function persistedBilingual(row: BilingualText): BilingualText {
  return { en: row.en, mm: row.mm };
}

export function persistedFaqMeta(row: FaqMetaRecord): FaqMetaRecord {
  return { nextItemNumber: row.nextItemNumber };
}

export function persistedFaqItem(row: FaqItemRecord): FaqItemRecord {
  const next: FaqItemRecord = {
    id: row.id,
    category: row.category,
    question: persistedBilingual(row.question),
    answer: persistedBilingual(row.answer),
    sortOrder: row.sortOrder,
    published: row.published,
  };
  if (row.relatedTo) next.relatedTo = row.relatedTo;
  if (row.relatedLabel) next.relatedLabel = persistedBilingual(row.relatedLabel);
  return next;
}

export function compareFaqItem(
  a: { sortOrder: number; id: string },
  b: { sortOrder: number; id: string },
): number {
  if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
  return a.id.localeCompare(b.id);
}

export const FAQ_STORAGE_KEY = 'softgate_admin_faq_v1';
export const FAQ_SCHEMA_VERSION = 1;

export type FaqItem = FaqItemRecord;
export type FaqMeta = FaqMetaRecord;
export type FaqSnapshot = { meta: FaqMeta; items: FaqItem[] };

export const FAQ_CATEGORY_LABELS: Record<FaqCategory, string> = {
  general: 'General',
  account: 'Account',
  payments: 'Payments',
  content: 'Content',
};

export function sortFaqItems(rows: FaqItem[]): FaqItem[] {
  return rows.slice().sort(compareFaqItem);
}

export function loadFaq(): FaqSnapshot {
  const raw = localStorage.getItem(FAQ_STORAGE_KEY);
  const seed = (): FaqSnapshot => ({
    meta: persistedFaqMeta(DEFAULT_FAQ_META),
    items: DEFAULT_FAQ_ITEMS.map(persistedFaqItem),
  });
  if (!raw) return seed();
  try {
    const parsed = JSON.parse(raw) as {
      schemaVersion?: number;
      meta?: FaqMeta;
      items?: FaqItem[];
    };
    if (
      parsed.schemaVersion !== FAQ_SCHEMA_VERSION ||
      !parsed.meta ||
      !Array.isArray(parsed.items)
    ) {
      return seed();
    }
    return {
      meta: persistedFaqMeta(parsed.meta),
      items: parsed.items.map(persistedFaqItem),
    };
  } catch {
    return seed();
  }
}

export function saveFaq(snapshot: FaqSnapshot): void {
  localStorage.setItem(
    FAQ_STORAGE_KEY,
    JSON.stringify({
      schemaVersion: FAQ_SCHEMA_VERSION,
      meta: persistedFaqMeta(snapshot.meta),
      items: snapshot.items.map(persistedFaqItem),
    }),
  );
}
