export type BilingualText = { en: string; mm: string };

export type LegalDoc = 'privacy' | 'terms';

export type LegalSectionKind = 'body' | 'bullets' | 'privacy-rights';

export type LegalHeadingLevel = 'h2' | 'h3';

export const PRIVACY_META_ID = 'privacy';
export const TERMS_META_ID = 'terms';

export const LEGAL_EFFECTIVE_DATE = '2026-09-10';

export const RESERVED_LEGAL_SLUGS = ['glance', 'contact'] as const;

export const LEGAL_SLUG_RE = /^[a-z0-9-]{1,64}$/;

export const PRIVACY_SECTION_KINDS = ['body', 'bullets', 'privacy-rights'] as const;
export const TERMS_SECTION_KINDS = ['body', 'bullets'] as const;
export const LEGAL_HEADING_LEVELS = ['h2', 'h3'] as const;

export type LegalMetaRecord = {
  seoDesc: BilingualText;
  glance: BilingualText[];
  effectiveDate: string;
};

export type LegalSectionRecord = {
  id: string;
  slug: string;
  kind: LegalSectionKind;
  headingLevel: LegalHeadingLevel;
  title: BilingualText;
  body: BilingualText;
  bullets: BilingualText[];
  sortOrder: number;
  published: boolean;
};

export type LegalSectionWrite = Omit<LegalSectionRecord, 'id'>;

export type LegalSectionPatch = Partial<LegalSectionWrite>;

const bi = (en: string, mm: string): BilingualText => ({ en, mm });

const emptyBody = (): BilingualText => bi('', '');

export function persistedBilingual(row: BilingualText): BilingualText {
  return { en: row.en, mm: row.mm };
}

export function persistedGlance(rows: BilingualText[]): BilingualText[] {
  return rows.map(persistedBilingual);
}

export function persistedMeta(row: LegalMetaRecord): LegalMetaRecord {
  return {
    seoDesc: persistedBilingual(row.seoDesc),
    glance: persistedGlance(row.glance),
    effectiveDate: row.effectiveDate,
  };
}

export function persistedSection(row: LegalSectionRecord): LegalSectionRecord {
  return {
    id: row.id,
    slug: row.slug,
    kind: row.kind,
    headingLevel: row.headingLevel,
    title: persistedBilingual(row.title),
    body: persistedBilingual(row.body),
    bullets: row.bullets.map(persistedBilingual),
    sortOrder: row.sortOrder,
    published: row.published,
  };
}

export function compareLegalSection(
  a: { sortOrder: number; id: string },
  b: { sortOrder: number; id: string },
): number {
  if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
  return a.id.localeCompare(b.id);
}

export const DEFAULT_PRIVACY_META: LegalMetaRecord = {
  seoDesc: bi(
    "How SoftGate Comic handles your data: everything stays in your browser's local storage — nothing is sent to servers or shared with third parties.",
    'SoftGate Comic သင့်အချက်အလက်ကို ကိုင်တွယ်ပုံ — အားလုံး browser local storage ထဲတွင်သာ ရှိပြီး server သို့ မပို့၊ တတိယပါတီနှင့် မမျှဝေပါ။',
  ),
  glance: [
    bi(
      'This demo portal does not send your data to any server.',
      'ဤ demo portal သည် သင့်အချက်အလက်များကို မည်သည့် server သို့မျှ မပို့ပါ။',
    ),
    bi(
      "Your account and reading activity stay in this browser's local storage, on your device.",
      'သင့်အကောင့်နှင့် ဖတ်ရှုမှု လှုပ်ရှားမှုများသည် ဤ browser ၏ local storage ထဲ၊ သင့်စက်ပေါ်တွင်သာ ရှိပါသည်။',
    ),
    bi(
      'We do not share your data with anyone — nothing leaves your device.',
      'သင့်အချက်အလက်ကို မည်သူနှင့်မျှ မမျှဝေပါ — သင့်စက်မှ ဘာမျှ မထွက်ပါ။',
    ),
    bi(
      'Signed-in readers can delete the demo account from Profile → Security. Anyone can clear site data in the browser.',
      'ဝင်ရောက်ထားသူများသည် Profile → လုံခြုံရေး မှ demo အကောင့်ကို ဖျက်နိုင်ပါသည်။ မည်သူမဆို browser တွင် site data ရှင်းလင်းနိုင်ပါသည်။',
    ),
    bi('Guests have no account to delete.', 'ဧည့်သည်များတွင် ဖျက်ရန် အကောင့် မရှိပါ။'),
  ],
  effectiveDate: LEGAL_EFFECTIVE_DATE,
};

export const DEFAULT_TERMS_META: LegalMetaRecord = {
  seoDesc: bi(
    'Terms of use for SoftGate Comic: eligibility, content license, Coins and virtual items, comments, and account rules.',
    'SoftGate Comic အသုံးပြုမှု စည်းကမ်းချက်များ — အသုံးပြုခွင့် အရွယ်၊ content လိုင်စင်၊ Coin နှင့် virtual ပစ္စည်းများ၊ comment များနှင့် အကောင့် စည်းကမ်းများ။',
  ),
  glance: [
    bi(
      'You must be at least 13 years old to use SoftGate Comic.',
      'SoftGate Comic ကို အသုံးပြုရန် အနည်းဆုံး အသက် ၁၃ နှစ် ပြည့်ရပါမည်။',
    ),
    bi(
      'Guests may browse. A demo account on this device is needed for Library, Coins, and comments.',
      'ဧည့်သည်များ ကြည့်ရှုနိုင်ပါသည်။ Library၊ Coin နှင့် comment များအတွက် ဤစက်ပေါ်ရှိ demo အကောင့် လိုအပ်ပါသည်။',
    ),
    bi(
      'Coins are a demo license with no real-world value and no real payment.',
      'Coin များသည် demo အသုံးပြုခွင့်သာ ဖြစ်ပြီး လက်တွေ့ တန်ဖိုး မရှိ၊ ငွေ တကယ် မပေးချေရပါ။',
    ),
    bi(
      'When these terms change, the last-updated date on this page changes. Continued use means you accept.',
      'ဤစည်းကမ်းချက်များ ပြောင်းလဲပါက ဤစာမျက်နှာရှိ နောက်ဆုံးအပ်ဒိတ် ရက်စွဲ ပြောင်းပါသည်။ ဆက်လက် အသုံးပြုခြင်းသည် လက်ခံသည်ဟု ဆိုလိုပါသည်။',
    ),
    bi(
      'These terms are governed by Myanmar law.',
      'ဤစည်းကမ်းချက်များသည် မြန်မာနိုင်ငံ ဥပဒေအရ ထိန်းချုပ်ထားပါသည်။',
    ),
  ],
  effectiveDate: LEGAL_EFFECTIVE_DATE,
};

function section(
  slug: string,
  kind: LegalSectionKind,
  headingLevel: LegalHeadingLevel,
  title: BilingualText,
  body: BilingualText,
  bullets: BilingualText[],
  sortOrder: number,
): LegalSectionWrite {
  return { slug, kind, headingLevel, title, body, bullets, sortOrder, published: true };
}

export const DEFAULT_PRIVACY_SECTIONS: LegalSectionWrite[] = [
  section(
    'collect',
    'body',
    'h2',
    bi('Information We Collect', 'ကျွန်ုပ်တို့ သိမ်းဆည်းသည့် အချက်အလက်များ'),
    bi(
      "We keep only what the portal needs to work: the account details you enter and your reading activity. All of it stays in your browser's local storage and is never transmitted to us.",
      'Portal လည်ပတ်ရန် လိုအပ်သည်များကိုသာ သိမ်းဆည်းပါသည် — သင်ဖြည့်သွင်းသော အကောင့်အချက်အလက်နှင့် သင့်ဖတ်ရှုမှု လှုပ်ရှားမှုများ။ အားလုံး browser local storage ထဲတွင်သာ ရှိပြီး ကျွန်ုပ်တို့ထံ မပို့ပါ။',
    ),
    [],
    0,
  ),
  section(
    'personal',
    'body',
    'h3',
    bi('Personal Information', 'ကိုယ်ရေးကိုယ်တာ အချက်အလက်'),
    bi(
      'The name, email, and username you enter when creating your demo account. These stay on your device.',
      'Demo အကောင့် ဖန်တီးစဉ် သင်ဖြည့်သွင်းသော အမည်၊ အီးမေးလ်နှင့် အသုံးပြုသူအမည်။ ၎င်းတို့သည် သင့်စက်ပေါ်တွင်သာ ရှိပါသည်။',
    ),
    [],
    1,
  ),
  section(
    'usage',
    'body',
    'h3',
    bi('Usage Data', 'အသုံးပြုမှု အချက်အလက်'),
    bi(
      'Settings such as your language choice and reading preferences. We do not run analytics or tracking of any kind.',
      'ဘာသာစကား ရွေးချယ်မှုနှင့် ဖတ်ရှုမှု ဆက်တင်များကဲ့သို့ အချက်အလက်များ။ Analytics သို့မဟုတ် tracking တစ်မျိုးမျှ မလုပ်ပါ။',
    ),
    [],
    2,
  ),
  section(
    'reading',
    'body',
    'h3',
    bi('Reading Activity', 'ဖတ်ရှုမှု လှုပ်ရှားမှု'),
    bi(
      'Your reading history, episode scroll position, Library subscriptions, author follows, likes, and series ratings are saved so Continue Reading, Library, Follow, and ratings work. This activity stays on your device and is never uploaded or shared.',
      'Continue Reading၊ Library၊ Follow နှင့် အဆင့်သတ်မှတ်ချက်များ အလုပ်လုပ်စေရန် သင့်ဖတ်ရှုမှု မှတ်တမ်း၊ အပိုင်း scroll နေရာ၊ Library စာရင်းသွင်းမှုများ၊ စာရေးဆရာ Follow များ၊ like များနှင့် series rating များကို သိမ်းဆည်းပါသည်။ ဤအချက်အလက်များသည် သင့်စက်ပေါ်တွင်သာ ရှိပြီး ဘယ်တော့မှ upload မလုပ်၊ မမျှဝေပါ။',
    ),
    [],
    3,
  ),
  section(
    'use',
    'bullets',
    'h2',
    bi('How We Use Your Information', 'ကျွန်ုပ်တို့ အသုံးပြုပုံ'),
    bi(
      'Your information is used on your device for the following purposes:',
      'သင့်အချက်အလက်များကို သင့်စက်ပေါ်တွင် အောက်ပါ ရည်ရွယ်ချက်များအတွက် အသုံးပြုပါသည်။',
    ),
    [
      bi(
        'To provide portal features such as sign-in, Library, and Continue Reading',
        'Sign-in၊ Library နှင့် Continue Reading ကဲ့သို့ လုပ်ဆောင်ချက်များ ပေးရန်',
      ),
      bi(
        'To remember your preferences between visits',
        'လာရောက်မှုတိုင်းတွင် သင့်ရွေးချယ်မှုများ မှတ်ထားရန်',
      ),
      bi('To show your in-app notifications', 'App တွင်း notification များ ပြသရန်'),
      bi(
        'To keep your demo session secure on this device',
        'ဤစက်ပေါ်ရှိ demo session လုံခြုံစေရန်',
      ),
    ],
    4,
  ),
  section(
    'sharing',
    'body',
    'h2',
    bi('Data Sharing', 'အချက်အလက် မျှဝေမှု'),
    bi(
      'We do not share your data with anyone. On this demo portal your data never leaves your device, so there is nothing to sell, transfer, or disclose to third parties.',
      'သင့်အချက်အလက်ကို မည်သူနှင့်မျှ မမျှဝေပါ။ ဤ demo portal တွင် သင့်အချက်အလက်သည် သင့်စက်မှ ဘယ်တော့မှ မထွက်သောကြောင့် တတိယပါတီသို့ ရောင်းချရန်၊ လွှဲပြောင်းရန် သို့မဟုတ် ထုတ်ဖော်ရန် မရှိပါ။',
    ),
    [],
    5,
  ),
  section(
    'security',
    'body',
    'h2',
    bi('Data Security', 'အချက်အလက် လုံခြုံရေး'),
    bi(
      "Your data lives in your browser's local storage and is protected by your device. No copies exist on our servers because nothing is transmitted.",
      'သင့်အချက်အလက်သည် browser local storage ထဲတွင် ရှိပြီး သင့်စက်၏ လုံခြုံရေးဖြင့် ကာကွယ်ထားပါသည်။ မည်သည့်အရာမျှ မပို့သောကြောင့် server ပေါ်တွင် မိတ္တူ မရှိပါ။',
    ),
    [],
    6,
  ),
  section(
    'rights',
    'privacy-rights',
    'h2',
    bi('Your Rights', 'သင့်အခွင့်အရေးများ'),
    bi(
      'You are in full control of what this demo portal stores on this device.',
      'ဤ demo portal က ဤစက်ပေါ်တွင် သိမ်းဆည်းသည်များကို အပြည့်အဝ ထိန်းချုပ်ခွင့် သင့်ထံမှာ ရှိပါသည်။',
    ),
    [
      bi('Profile → Security', 'Profile → လုံခြုံရေး'),
      bi(
        'Signed-in readers can delete the demo account on this device and this browser.',
        'ဝင်ရောက်ထားသူများသည် ဤစက်နှင့် ဤ browser ပေါ်ရှိ demo အကောင့်ကို ဖျက်နိုင်ပါသည်။',
      ),
      bi(
        "Anyone can remove everything SoftGate Comic stored by using the browser's Clear site data control.",
        'မည်သူမဆို browser ၏ Clear site data ဖြင့် SoftGate Comic သိမ်းဆည်းထားသမျှ ဖယ်ရှားနိုင်ပါသည်။',
      ),
      bi(
        'Guests have no account to delete. Clearing site data removes local reading activity.',
        'ဧည့်သည်များတွင် ဖျက်ရန် အကောင့် မရှိပါ။ Site data ရှင်းလင်းခြင်းဖြင့် ဒေသတွင်း ဖတ်ရှုမှု လှုပ်ရှားမှု ပျက်ပါသည်။',
      ),
      bi('Contact page', 'ဆက်သွယ်ရန် စာမျက်နှာ'),
    ],
    7,
  ),
  section(
    'children',
    'body',
    'h2',
    bi("Children's Privacy", 'ကလေးများ၏ ကိုယ်ရေးအချက်အလက်'),
    bi(
      "SoftGate Comic is intended for users aged 13 and above. We do not knowingly collect personal information from children under 13. If a child has entered information, clearing the browser's site data removes it completely.",
      'SoftGate Comic သည် အသက် ၁၃ နှစ်နှင့်အထက် အသုံးပြုသူများအတွက် ရည်ရွယ်ပါသည်။ ၁၃ နှစ်အောက် ကလေးများ၏ ကိုယ်ရေးအချက်အလက်ကို တမင် မသိမ်းဆည်းပါ။ ကလေးတစ်ဦး အချက်အလက် ဖြည့်သွင်းမိပါက browser ၏ site data ရှင်းလင်းခြင်းဖြင့် အပြည့်အဝ ဖယ်ရှားနိုင်ပါသည်။',
    ),
    [],
    8,
  ),
];

export const DEFAULT_TERMS_SECTIONS: LegalSectionWrite[] = [
  section(
    'acceptance',
    'body',
    'h2',
    bi('Acceptance of Terms', 'စည်းကမ်းချက်များကို လက်ခံခြင်း'),
    bi(
      'By using SoftGate Comic — as a guest or with a demo account — you agree to these terms. The last-updated date is shown at the top of this page.',
      'ဧည့်သည်အဖြစ်ဖြစ်စေ demo အကောင့်ဖြင့်ဖြစ်စေ SoftGate Comic ကို အသုံးပြုခြင်းဖြင့် ဤစည်းကမ်းချက်များကို လက်ခံသည်ဟု ယူဆပါသည်။ နောက်ဆုံးအပ်ဒိတ် ရက်စွဲကို ဤစာမျက်နှာ ထိပ်တွင် ပြသထားပါသည်။',
    ),
    [],
    0,
  ),
  section(
    'eligibility',
    'body',
    'h2',
    bi('Eligibility & Age', 'အသုံးပြုခွင့်နှင့် အသက်အရွယ်'),
    bi(
      'You must be at least 13 years old to use SoftGate Comic. If you are between 13 and 18, you may only use the service under the supervision of a parent or legal guardian who agrees to these terms. Series rated 18+ require an in-app self-confirm before reading. That confirm is a demo check on this device or account — it is not government ID verification.',
      'SoftGate Comic ကို အသုံးပြုရန် အနည်းဆုံး အသက် ၁၃ နှစ် ပြည့်ရပါမည်။ အသက် ၁၃ နှစ်မှ ၁၈ နှစ်ကြား ဖြစ်ပါက ဤစည်းကမ်းချက်များကို သဘောတူသော မိဘ သို့မဟုတ် တရားဝင် အုပ်ထိန်းသူ၏ ကြီးကြပ်မှုဖြင့်သာ အသုံးပြုနိုင်ပါသည်။ ၁၈ နှစ်နှင့်အထက် စီးရီးများကို ဖတ်ရန် အက်ပ်အတွင်း ကိုယ်တိုင် အတည်ပြုရပါသည်။ ထိုအတည်ပြုချက်သည် ဤစက် သို့မဟုတ် အကောင့်ပေါ်ရှိ demo စစ်ဆေးချက်သာ ဖြစ်ပြီး အစိုးရမှတ်ပုံတင် စစ်ဆေးခြင်း မဟုတ်ပါ။',
    ),
    [],
    1,
  ),
  section(
    'license',
    'body',
    'h2',
    bi('Use License', 'အသုံးပြုခွင့်'),
    bi(
      'SoftGate Comic contains proprietary and licensed content. You receive a personal, non-transferable license to read it within the service — ownership is never transferred to you.',
      'SoftGate Comic တွင် ကိုယ်ပိုင်နှင့် လိုင်စင်ရ အကြောင်းအရာများ ပါဝင်ပါသည်။ ဝန်ဆောင်မှုအတွင်း ဖတ်ရှုရန် ကိုယ်ပိုင်၊ လွှဲပြောင်း၍မရသော အသုံးပြုခွင့်သာ ရရှိပြီး ပိုင်ဆိုင်မှု လွှဲပြောင်းခြင်း မဟုတ်ပါ။',
    ),
    [],
    2,
  ),
  section(
    'permitted',
    'bullets',
    'h3',
    bi('Permitted Uses', 'ခွင့်ပြုထားသည်များ'),
    emptyBody(),
    [
      bi('Access and use the service', 'ဝန်ဆောင်မှုကို ကြည့်ရှုအသုံးပြုခြင်း'),
      bi(
        'Download content for personal use',
        'ကိုယ်ပိုင် အသုံးပြုခြင်းအတွက် အကြောင်းအရာများ ဒေါင်းလုဒ်လုပ်ခြင်း',
      ),
      bi('Print permitted content', 'ခွင့်ပြုထားသော အကြောင်းအရာများ ပုံနှိုပ်ခြင်း'),
    ],
    3,
  ),
  section(
    'prohibited',
    'bullets',
    'h3',
    bi('Prohibited Uses', 'တားမြစ်ထားသည်များ'),
    emptyBody(),
    [
      bi('Modify content', 'အကြောင်းအရာများကို ပြင်ဆင်ခြင်း'),
      bi('Use for commercial purposes', 'စီးပွားဖြစ် အသုံးပြုခြင်း'),
      bi('Reverse engineer', 'Reverse engineering လုပ်ခြင်း'),
      bi('Transfer your account', 'အကောင့်ကို လွှဲပြောင်းခြင်း'),
      bi(
        'Scrape, bulk-download, or re-upload webtoon episodes to other sites or apps',
        'Webtoon အပိုင်းများကို scrape လုပ်ခြင်း၊ အစုလိုက် ဒေါင်းလုဒ်လုပ်ခြင်း သို့မဟုတ် အခြား site/app များသို့ ပြန်တင်ခြင်း',
      ),
    ],
    4,
  ),
  section(
    'accounts',
    'body',
    'h2',
    bi('User Accounts', 'အသုံးပြုသူ အကောင့်များ'),
    bi(
      'Guests may browse without an account. A demo account on this device is needed for Library, Coins, comments, and similar signed-in features. You are responsible for the password you choose; it is stored only in this browser. Signed-in readers can delete the account from Profile → Security.',
      'ဧည့်သည်များ အကောင့်မရှိဘဲ ကြည့်ရှုနိုင်ပါသည်။ Library၊ Coin၊ comment နှင့် အလားတူ ဝင်ရောက်မှု လုပ်ဆောင်ချက်များအတွက် ဤစက်ပေါ်ရှိ demo အကောင့် လိုအပ်ပါသည်။ သင်ရွေးသော စကားဝှက်အတွက် သင်တာဝန်ရှိပြီး ဤ browser ထဲတွင်သာ သိမ်းဆည်းပါသည်။ ဝင်ရောက်ထားသူများသည် Profile → လုံခြုံရေး မှ အကောင့်ကို ဖျက်နိုင်ပါသည်။',
    ),
    [],
    5,
  ),
  section(
    'user-content',
    'body',
    'h2',
    bi('Your Comments', 'သင့် comment များ'),
    bi(
      'Comments you post remain yours. By posting, you allow SoftGate Comic to display them within the service, and we may remove comments that are abusive, unlawful, or spam. On this demo portal, comments are stored only in your browser.',
      'သင်ရေးသားသော comment များသည် သင့်ပိုင် ဆက်ဖြစ်ပါသည်။ ရေးသားတင်ခြင်းဖြင့် ၎င်းတို့ကို ဝန်ဆောင်မှုအတွင်း ပြသရန် SoftGate Comic အား ခွင့်ပြုပြီး စော်ကားမှု၊ ဥပဒေချိုးဖောက်မှု သို့မဟုတ် spam ဖြစ်သော comment များကို ဖယ်ရှားနိုင်ပါသည်။ ဤ demo portal တွင် comment များကို သင့် browser ထဲတွင်သာ သိမ်းဆည်းပါသည်။',
    ),
    [],
    6,
  ),
  section(
    'intellectual',
    'body',
    'h2',
    bi('Intellectual Property', 'ဉာဏ်စွမ်းဥစ္စာ'),
    bi(
      'Webtoon series, episode art, branding, and other materials on this service are owned by SoftGate Comic or its licensors. Your license is to read them here. It does not transfer ownership or let you republish the work.',
      'ဤဝန်ဆောင်မှုရှိ webtoon ဇာတ်လမ်းများ၊ အပိုင်းပုံများ၊ တံဆိပ်နှင့် အခြား အကြောင်းအရာများကို SoftGate Comic သို့မဟုတ် လိုင်စင်ထုတ်ပေးသူများက ပိုင်ဆိုင်ပါသည်။ ဤနေရာတွင် ဖတ်ရှုရန် အသုံးပြုခွင့်သာ ရရှိပြီး ပိုင်ဆိုင်မှု လွှဲပြောင်းခြင်း သို့မဟုတ် ပြန်လည် ဖြန့်ချိခွင့် မဟုတ်ပါ။',
    ),
    [],
    7,
  ),
  section(
    'premium',
    'body',
    'h2',
    bi('Premium Content', 'Premium အကြောင်းအရာ'),
    bi(
      'Premium episodes unlock with Coins, or become free after a Demo wait-for-free time when that time is listed. Wait-for-free is not a live publisher clock or a daily 23:59 reset. Coin unlocks stay readable on this device.',
      'Premium အပိုင်းများကို Coins ဖြင့် ဖွင့်နိုင်သည်၊ သို့မဟုတ် စာရင်းတင်ထားသော Demo wait-for-free အချိန်ကျော်လျှင် အခမဲ့ ဖြစ်သည်။ Wait-for-free သည် live publisher နာရီ မဟုတ်၊ နေ့စဉ် 23:59 reset မဟုတ်ပါ။ Coin ဖြင့် ဖွင့်ပြီးသော အပိုင်းသည် ဤစက်ပေါ်တွင် ဆက်ဖတ်နိုင်သည်။',
    ),
    [],
    8,
  ),
  section(
    'coins',
    'bullets',
    'h2',
    bi('Coins & Virtual Items', 'Coin များနှင့် Virtual ပစ္စည်းများ'),
    bi(
      'Coins are a virtual currency used to unlock premium episodes. Coins are licensed to you, not sold:',
      'Coin များသည် premium အပိုင်းများ ဖွင့်ရန် အသုံးပြုသော virtual ငွေကြေး ဖြစ်ပါသည်။ Coin များကို ရောင်းချခြင်း မဟုတ်ဘဲ အသုံးပြုခွင့်သာ ပေးခြင်း ဖြစ်ပါသည် —',
    ),
    [
      bi(
        'You do not own Coins — they are a limited, non-transferable license tied to your account',
        'Coin များကို သင် မပိုင်ဆိုင်ပါ — သင့်အကောင့်နှင့် ချိတ်ဆက်ထားသော ကန့်သတ်၊ လွှဲပြောင်း၍မရသော အသုံးပြုခွင့်သာ ဖြစ်ပါသည်',
      ),
      bi(
        'Coins have no real-world monetary value and cannot be redeemed for cash',
        'Coin များတွင် လက်တွေ့ ငွေကြေးတန်ဖိုး မရှိပါ၊ ငွေသားအဖြစ် ပြန်လဲ၍ မရပါ',
      ),
      bi(
        'Coins cannot be sold, gifted, or transferred to another account or person',
        'Coin များကို ရောင်းချခြင်း၊ လက်ဆောင်ပေးခြင်း သို့မဟုတ် အခြားအကောင့်/လူတစ်ဦးသို့ လွှဲပြောင်းခြင်း မပြုနိုင်ပါ',
      ),
      bi(
        'On this demo portal, Coin top-ups are simulated — no real payment is taken and no refunds apply',
        'ဤ demo portal တွင် Coin ဖြည့်သွင်းမှုသည် စမ်းသပ်မှုသာ ဖြစ်ပြီး ငွေ တကယ် မပေးချေရပါ၊ ပြန်အမ်းငွေလည်း မရှိပါ',
      ),
    ],
    9,
  ),
  section(
    'termination',
    'body',
    'h2',
    bi('Termination', 'ပိတ်သိမ်းခြင်း'),
    bi(
      'We may stop a demo account on this device if these terms are violated — for example scraping, re-upload, or abuse. You may delete your demo account from Profile → Security. Clearing site data also removes the local account.',
      'ဤစည်းကမ်းချက်များကို ချိုးဖောက်ပါက — ဥပမာ scrape လုပ်ခြင်း၊ ပြန်တင်ခြင်း သို့မဟုတ် စော်ကားမှု — ဤစက်ပေါ်ရှိ demo အကောင့်ကို ရပ်နားနိုင်ပါသည်။ Demo အကောင့်ကို Profile → လုံခြုံရေး မှ ဖျက်နိုင်ပါသည်။ Site data ရှင်းလင်းခြင်းဖြင့် ဒေသတွင်း အကောင့်လည်း ပျက်ပါသည်။',
    ),
    [],
    10,
  ),
  section(
    'limitation',
    'body',
    'h2',
    bi('Limitation of Liability', 'ကန့်သတ်ချက်'),
    bi(
      'This is a demo portal running in your browser. SoftGate Comic is not liable for lost local data, lost demo Coins, or interruption of the service. Clearing site data or using another browser removes what was stored here.',
      'ဤသည်မှာ သင့် browser ထဲတွင် လည်ပတ်သော demo portal ဖြစ်ပါသည်။ ဒေသတွင်း အချက်အလက် ပျောက်ဆုံးခြင်း၊ demo Coin ပျောက်ဆုံးခြင်း သို့မဟုတ် ဝန်ဆောင်မှု ရပ်တန့်ခြင်းအတွက် SoftGate Comic တာဝန်မရှိပါ။ Site data ရှင်းလင်းခြင်း သို့မဟုတ် အခြား browser သုံးခြင်းဖြင့် ဤနေရာတွင် သိမ်းထားသည်များ ပျက်ပါသည်။',
    ),
    [],
    11,
  ),
  section(
    'changes',
    'body',
    'h2',
    bi('Changes to These Terms', 'ဤစည်းကမ်းချက်များ ပြောင်းလဲခြင်း'),
    bi(
      'We may update these terms as the demo portal evolves. Material changes appear on this page with a new last-updated date. Continued use after that date means you accept the updated terms. We do not email notices — this portal has no server.',
      'Demo portal ပြောင်းလဲလာသည်နှင့်အမျှ ဤစည်းကမ်းချက်များကို ပြင်ဆင်နိုင်ပါသည်။ အရေးကြီး ပြောင်းလဲမှုများကို နောက်ဆုံးအပ်ဒိတ် ရက်စွဲအသစ်ဖြင့် ဤစာမျက်နှာတွင် ဖော်ပြပါမည်။ ထိုရက်စွဲနောက် ဆက်လက် အသုံးပြုခြင်းသည် ပြင်ဆင်ထားသော စည်းကမ်းချက်များကို လက်ခံသည်ဟု ဆိုလိုပါသည်။ အီးမေးလ် အကြောင်းကြားချက် မပို့ပါ — ဤ portal တွင် server မရှိပါ။',
    ),
    [],
    12,
  ),
  section(
    'governing',
    'body',
    'h2',
    bi('Governing Law', 'ဥပဒေ'),
    bi(
      'These terms are governed by Myanmar law.',
      'ဤစည်းကမ်းချက်များသည် မြန်မာနိုင်ငံ ဥပဒေအရ ထိန်းချုပ်ထားပါသည်။',
    ),
    [],
    13,
  ),
];

export function defaultMetaFor(doc: LegalDoc): LegalMetaRecord {
  return persistedMeta(doc === 'privacy' ? DEFAULT_PRIVACY_META : DEFAULT_TERMS_META);
}

export function defaultSectionsFor(doc: LegalDoc): LegalSectionWrite[] {
  const rows = doc === 'privacy' ? DEFAULT_PRIVACY_SECTIONS : DEFAULT_TERMS_SECTIONS;
  return rows.map((row) => ({
    ...row,
    title: persistedBilingual(row.title),
    body: persistedBilingual(row.body),
    bullets: row.bullets.map(persistedBilingual),
  }));
}

export function seedSectionsFor(doc: LegalDoc): LegalSectionRecord[] {
  return defaultSectionsFor(doc).map((row) =>
    persistedSection({ id: `${doc}-${row.slug}`, ...row }),
  );
}

export function allowedKindsFor(doc: LegalDoc): readonly LegalSectionKind[] {
  return doc === 'privacy' ? PRIVACY_SECTION_KINDS : TERMS_SECTION_KINDS;
}

export const LEGAL_STORAGE_KEY = 'softgate_admin_legal_v1';
export const LEGAL_SCHEMA_VERSION = 1;

export type LegalDocSnapshot = {
  meta: LegalMetaRecord;
  sections: LegalSectionRecord[];
};

export type LegalSnapshot = {
  privacy: LegalDocSnapshot;
  terms: LegalDocSnapshot;
};

export function sortSections(rows: LegalSectionRecord[]): LegalSectionRecord[] {
  return rows.slice().sort(compareLegalSection);
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

export function nextLegalSectionId(doc: LegalDoc, rows: LegalSectionRecord[]): string {
  return nextPrefixedId(doc === 'privacy' ? 'p' : 't', rows);
}

export function emptyLegalSnapshot(): LegalSnapshot {
  return {
    privacy: {
      meta: persistedMeta(DEFAULT_PRIVACY_META),
      sections: seedSectionsFor('privacy'),
    },
    terms: {
      meta: persistedMeta(DEFAULT_TERMS_META),
      sections: seedSectionsFor('terms'),
    },
  };
}

function readDoc(value: unknown, doc: LegalDoc): LegalDocSnapshot {
  const fallback = emptyLegalSnapshot()[doc];
  if (!value || typeof value !== 'object' || Array.isArray(value)) return fallback;
  const row = value as { meta?: LegalMetaRecord; sections?: LegalSectionRecord[] };
  if (!row.meta || !Array.isArray(row.sections)) return fallback;
  return {
    meta: persistedMeta(row.meta),
    sections: sortSections(row.sections.map(persistedSection)),
  };
}

export function loadLegal(): LegalSnapshot {
  const raw = localStorage.getItem(LEGAL_STORAGE_KEY);
  if (!raw) return emptyLegalSnapshot();
  try {
    const parsed = JSON.parse(raw) as {
      schemaVersion?: number;
      privacy?: unknown;
      terms?: unknown;
    };
    if (parsed.schemaVersion !== LEGAL_SCHEMA_VERSION) return emptyLegalSnapshot();
    return {
      privacy: readDoc(parsed.privacy, 'privacy'),
      terms: readDoc(parsed.terms, 'terms'),
    };
  } catch {
    return emptyLegalSnapshot();
  }
}

export function saveLegal(snapshot: LegalSnapshot): void {
  localStorage.setItem(
    LEGAL_STORAGE_KEY,
    JSON.stringify({
      schemaVersion: LEGAL_SCHEMA_VERSION,
      privacy: {
        meta: persistedMeta(snapshot.privacy.meta),
        sections: snapshot.privacy.sections.map(persistedSection),
      },
      terms: {
        meta: persistedMeta(snapshot.terms.meta),
        sections: snapshot.terms.sections.map(persistedSection),
      },
    }),
  );
}
