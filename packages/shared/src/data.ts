import type {
  DashboardStats,
  RevenueData,
  UserGrowthData,
  User,
  Webtoon,
  Episode,
  Author,
  Genre,
  Comment,
  PopularWebtoon,
  MediaFile,
  ActivityLog,
  Report,
  Transaction,
  ScheduledEpisode,
  SharedData,
} from './types';

export const mockDashboardStats: DashboardStats = {
  totalUsers: 125430,
  totalWebtoons: 892,
  totalEpisodes: 15678,
  totalViews: 4567890,
  totalRevenue: 125680,
  newUsersToday: 234,
  activeUsersToday: 8934,
  newEpisodesToday: 12,
};

export const mockRevenueData: RevenueData[] = [
  { date: '2026-04-01', revenue: 4200, coins: 42000 },
  { date: '2026-04-02', revenue: 3800, coins: 38000 },
  { date: '2026-04-03', revenue: 5100, coins: 51000 },
  { date: '2026-04-04', revenue: 4600, coins: 46000 },
  { date: '2026-04-05', revenue: 3900, coins: 39000 },
  { date: '2026-04-06', revenue: 5400, coins: 54000 },
  { date: '2026-04-07', revenue: 6200, coins: 62000 },
  { date: '2026-04-08', revenue: 5800, coins: 58000 },
  { date: '2026-04-09', revenue: 4900, coins: 49000 },
  { date: '2026-04-10', revenue: 5500, coins: 55000 },
  { date: '2026-04-11', revenue: 6100, coins: 61000 },
  { date: '2026-04-12', revenue: 7200, coins: 72000 },
  { date: '2026-04-13', revenue: 6800, coins: 68000 },
  { date: '2026-04-14', revenue: 5900, coins: 59000 },
];

export const mockUserGrowthData: UserGrowthData[] = [
  { date: '2026-03-27', users: 120000, activeUsers: 7500 },
  { date: '2026-04-03', users: 121500, activeUsers: 8100 },
  { date: '2026-04-10', users: 123200, activeUsers: 8400 },
  { date: '2026-04-17', users: 124500, activeUsers: 8700 },
  { date: '2026-04-24', users: 125430, activeUsers: 8934 },
];

export const mockPopularWebtoons: PopularWebtoon[] = [
  {
    id: '1',
    title: { mm: 'နောက်ဆုံးမြောက်တိမ်တိုက်', en: 'The Last Cloud' },
    views: 2500000,
    likes: 125000,
    revenue: 12500,
  },
  {
    id: '3',
    title: { mm: 'အမှောင်သူရဲကောင်း', en: 'Dark Hero' },
    views: 3200000,
    likes: 156000,
    revenue: 15600,
  },
  {
    id: '2',
    title: { mm: 'ရန်ကုန်မြို့မှာ ချစ်ခြင်းတရား', en: 'Love in Yangon' },
    views: 1800000,
    likes: 98000,
    revenue: 9800,
  },
  {
    id: '7',
    title: { mm: 'သွေးနက်လ', en: 'Blood Moon' },
    views: 1100000,
    likes: 78000,
    revenue: 7800,
  },
  {
    id: '8',
    title: { mm: 'ဆိုက်ဘာအိပ်မက်', en: 'Cyber Dream' },
    views: 980000,
    likes: 72000,
    revenue: 7200,
  },
];

export const mockAuthors: Author[] = [
  {
    id: '1',
    name: { mm: 'ကိုဇော်', en: 'Ko Zaw' },
    bio: { mm: 'Webtoon ပန်းချီဆရာနှင့် ဇာတ်လမ်းရေးဆရာ', en: 'Webtoon artist and storyteller' },
    followerCount: 125000,
    webtoonCount: 5,
    status: 'active',
  },
  {
    id: '2',
    name: { mm: 'မသူဇာ', en: 'Ma Thuzar' },
    bio: { mm: 'အချစ်ဇာတ်လမ်း Webtoon ဖန်တီးသူ', en: 'Romance webtoon creator' },
    followerCount: 89000,
    webtoonCount: 3,
    status: 'active',
  },
  {
    id: '3',
    name: { mm: 'ကိုထက်', en: 'Ko Htet' },
    bio: { mm: 'အက်ရှင်နှင့် စိတ်ကူးယဉ်ကားများ ဝါသနာပါသူ', en: 'Action and fantasy enthusiast' },
    followerCount: 156000,
    webtoonCount: 7,
    status: 'active',
  },
  {
    id: '4',
    name: { mm: 'မအေး', en: 'Ma Aye' },
    bio: { mm: 'အနုပညာဖြင့် ကမ္ဘာများကို ဖန်တီးသူ', en: 'Creating worlds through art' },
    followerCount: 78000,
    webtoonCount: 4,
    status: 'active',
  },
  {
    id: '5',
    name: { mm: 'ကိုမြင့်', en: 'Ko Myint' },
    bio: {
      mm: 'ကြောက်ရွံ့ဖွယ်နှင့် စိတ်လှုပ်ရှားဖွယ် ကားများ အထူးပြု',
      en: 'Horror and thriller specialist',
    },
    followerCount: 92000,
    webtoonCount: 6,
    status: 'inactive',
  },
];

export const mockGenres: Genre[] = [
  {
    id: '1',
    name: { mm: 'အားလုံး', en: 'All' },
    slug: 'all',
    description: 'All genres',
    webtoonCount: 892,
  },
  {
    id: '2',
    name: { mm: 'အက်ရှင်', en: 'Action' },
    slug: 'action',
    description: 'Action-packed stories',
    webtoonCount: 156,
  },
  {
    id: '3',
    name: { mm: 'အချစ်ဇာတ်လမ်း', en: 'Romance' },
    slug: 'romance',
    description: 'Love stories',
    webtoonCount: 234,
  },
  {
    id: '4',
    name: { mm: 'စိတ်ကူးယဉ်', en: 'Fantasy' },
    slug: 'fantasy',
    description: 'Magical worlds',
    webtoonCount: 189,
  },
  {
    id: '5',
    name: { mm: 'ဟာသ', en: 'Comedy' },
    slug: 'comedy',
    description: 'Funny stories',
    webtoonCount: 98,
  },
  {
    id: '6',
    name: { mm: 'ဒရမ်မာ', en: 'Drama' },
    slug: 'drama',
    description: 'Emotional stories',
    webtoonCount: 145,
  },
  {
    id: '7',
    name: { mm: 'ကြောက်ရွံ့ဖွယ်', en: 'Horror' },
    slug: 'horror',
    description: 'Scary stories',
    webtoonCount: 67,
  },
  {
    id: '8',
    name: { mm: 'သိပ္ပံစိတ်ကူးယဉ်', en: 'Sci-Fi' },
    slug: 'sci-fi',
    description: 'Science fiction',
    webtoonCount: 45,
  },
  {
    id: '9',
    name: { mm: 'စိတ်လှုပ်ရှားဖွယ်', en: 'Thriller' },
    slug: 'thriller',
    description: 'Suspenseful stories',
    webtoonCount: 78,
  },
  {
    id: '10',
    name: { mm: 'နေ့စဉ်ဘဝ', en: 'Slice of Life' },
    slug: 'slice-of-life',
    description: 'Daily life stories',
    webtoonCount: 56,
  },
];

export const mockWebtoons: Webtoon[] = [
  {
    id: '1',
    title: { mm: 'နောက်ဆုံးမြောက်တိမ်တိုက်', en: 'The Last Cloud' },
    description: {
      mm: 'မှော်နှင့် နည်းပညာတို့ တိုက်ခိုက်ရသော ကမ္ဘာတစ်ခုတွင် သူရဲကောင်းတစ်ဦးသည် လူသားမျိုးနွယ်ကို ပျက်စီးခြင်းမှ ကယ်တင်ရန် ထွန်းလင်းတောက်ပရမည်။',
      en: 'In a world where magic and technology clash, a hero must rise to save humanity from destruction.',
    },
    coverImage: '/webtoon-covers/the-last-horizon.png',
    coverColor: 'bg-gradient-to-br from-primary-400 to-primary-600',
    author: mockAuthors[0],
    genres: ['အက်ရှင်', 'စိတ်ကူးယဉ်'],
    tags: ['မှော်', 'နည်းပညာ', 'စွန့်စားမှု'],
    status: 'ongoing',
    isPremium: false,
    viewCount: 2500000,
    likeCount: 125000,
    episodeCount: 85,
    rating: 4.9,
    createdAt: '2024-01-15',
    updatedAt: '2026-04-20',
  },
  {
    id: '2',
    title: { mm: 'ရန်ကုန်မြို့မှာ ချစ်ခြင်းတရား', en: 'Love in Yangon' },
    description: {
      mm: 'ရန်ကုန်မြို့၏ လူစည်ကားသော လမ်းမကြီးများတွင် ဖြစ်ပွားသော နွေးထွေးလှသည့် အချစ်ဇာတ်လမ်းတစ်ပုဒ်။',
      en: 'A heartwarming love story set in the bustling streets of Yangon.',
    },
    coverImage: '/webtoon-covers/love-in-seoul.png',
    coverColor: 'bg-gradient-to-br from-pink-400 to-rose-600',
    author: mockAuthors[1],
    genres: ['အချစ်ဇာတ်လမ်း', 'ဒရမ်မာ'],
    tags: ['အချစ်', 'ရန်ကုန်', 'နေ့စဉ်ဘဝ'],
    status: 'ongoing',
    isPremium: false,
    viewCount: 1800000,
    likeCount: 98000,
    episodeCount: 62,
    rating: 4.7,
    createdAt: '2024-03-20',
    updatedAt: '2026-04-22',
  },
  {
    id: '3',
    title: { mm: 'အမှောင်သူရဲကောင်း', en: 'Dark Hero' },
    description: {
      mm: 'နိုင်ငံတော်ကို ကာကွယ်ရန် အမှောင်ထဲမှ ထွက်ပေါ်လာသော ထူးချွန်သည့် စစ်သည်တော်တစ်ဦး။',
      en: 'An elite soldier emerges from the shadows to protect the nation.',
    },
    coverImage: '/webtoon-covers/shadow-knight.png',
    coverColor: 'bg-gradient-to-br from-slate-600 to-gray-900',
    author: mockAuthors[2],
    genres: ['အက်ရှင်', 'စိတ်ကူးယဉ်'],
    tags: ['စစ်သည်', 'နိုင်ငံတော်', 'စွန့်စားမှု'],
    status: 'ongoing',
    isPremium: true,
    viewCount: 3200000,
    likeCount: 156000,
    episodeCount: 120,
    rating: 4.8,
    createdAt: '2023-06-10',
    updatedAt: '2026-04-25',
  },
  {
    id: '4',
    title: { mm: 'ပင်လယ်ပြင်၏အိပ်မက်များ', en: 'Dreams of the Sea' },
    description: {
      mm: 'ပင်လယ်ခုနစ်စင်းကို ဖြတ်ကျော်သော စွန့်စားမှုဇာတ်လမ်း။',
      en: 'An adventure story crossing the seven seas.',
    },
    coverImage: '/webtoon-covers/ocean-dreams.png',
    coverColor: 'bg-gradient-to-br from-cyan-400 to-blue-600',
    author: mockAuthors[3],
    genres: ['စွန့်စားမှု', 'စိတ်ကူးယဉ်'],
    tags: ['ပင်လယ်', 'စွန့်စားမှု', 'ပင်လယ်ဓားပြ'],
    status: 'ongoing',
    isPremium: false,
    viewCount: 890000,
    likeCount: 67000,
    episodeCount: 45,
    rating: 4.6,
    createdAt: '2024-08-05',
    updatedAt: '2026-04-18',
  },
  {
    id: '5',
    title: { mm: 'ရွှေခေတ်', en: 'Golden Era' },
    description: {
      mm: 'ရှေးခေတ်တွင် ဖြစ်ပွားသော သမိုင်းဝင် ဇာတ်လမ်းကြီးတစ်ပုဒ်။',
      en: 'An epic historical saga set in ancient times.',
    },
    coverImage: '/webtoon-covers/golden-age.png',
    coverColor: 'bg-gradient-to-br from-amber-400 to-orange-600',
    author: mockAuthors[4],
    genres: ['သမိုင်း', 'ဒရမ်မာ'],
    tags: ['သမိုင်း', 'ရှေးခေတ်', 'ဇာတ်လမ်းကြီး'],
    status: 'completed',
    isPremium: false,
    viewCount: 1500000,
    likeCount: 89000,
    episodeCount: 100,
    rating: 4.8,
    createdAt: '2023-01-15',
    updatedAt: '2025-12-20',
  },
  {
    id: '6',
    title: { mm: 'တောင်တန်းစောင့်နတ်', en: 'Mountain Spirit' },
    description: {
      mm: 'စုန်းအင်းတောများကို ဖြတ်ကျော်သော မှော်ဆန်သည့် ခရီးစဉ်။',
      en: 'A magical journey through enchanted forests.',
    },
    coverImage: '/webtoon-covers/forest-spirit.png',
    coverColor: 'bg-gradient-to-br from-emerald-400 to-teal-600',
    author: mockAuthors[0],
    genres: ['စိတ်ကူးယဉ်', 'စွန့်စားမှု'],
    tags: ['မှော်', 'တော', 'နတ်များ'],
    status: 'ongoing',
    isPremium: false,
    viewCount: 720000,
    likeCount: 54000,
    episodeCount: 38,
    rating: 4.5,
    createdAt: '2024-11-10',
    updatedAt: '2026-04-24',
  },
  {
    id: '7',
    title: { mm: 'သွေးနက်လ', en: 'Blood Moon' },
    description: {
      mm: 'သင့်ကို ခုံရင်ခွဲစေမည့် ကြောက်ရွံ့ဖွယ် ဇာတ်လမ်း။',
      en: 'A terrifying horror story that will keep you on the edge.',
    },
    coverImage: '/webtoon-covers/blood-moon.png',
    coverColor: 'bg-gradient-to-br from-red-500 to-rose-700',
    author: mockAuthors[4],
    genres: ['ကြောက်ရွံ့ဖွယ်', 'စိတ်လှုပ်ရှားဖွယ်'],
    tags: ['ကြောက်ရွံ့ဖွယ်', 'ထူးဆန်း', 'လျှို့ဝှက်ချက်'],
    status: 'ongoing',
    isPremium: true,
    viewCount: 1100000,
    likeCount: 78000,
    episodeCount: 55,
    rating: 4.7,
    createdAt: '2024-05-20',
    updatedAt: '2026-04-23',
  },
  {
    id: '8',
    title: { mm: 'ဆိုက်ဘာအိပ်မက်', en: 'Cyber Dream' },
    description: {
      mm: 'ဆိုက်ဘာပန့်ကမ္ဘာတွင် သိပ္ပံစိတ်ကူးယဉ် စွန့်စားမှု။',
      en: 'A sci-fi adventure in a cyberpunk world.',
    },
    coverImage: '/webtoon-covers/cyber-dreams.png',
    coverColor: 'bg-gradient-to-br from-violet-500 to-purple-700',
    author: mockAuthors[2],
    genres: ['သိပ္ပံစိတ်ကူးယဉ်', 'အက်ရှင်'],
    tags: ['ဆိုက်ဘာပန့်', 'အနာဂတ်', 'နည်းပညာ'],
    status: 'ongoing',
    isPremium: false,
    viewCount: 980000,
    likeCount: 72000,
    episodeCount: 42,
    rating: 4.6,
    createdAt: '2024-07-15',
    updatedAt: '2026-04-21',
  },
  {
    id: '9',
    title: { mm: 'တက္ကသိုလ်ဘဝ', en: 'Campus Life' },
    description: {
      mm: 'တက္ကသိုလ်ကျောင်းသားများ၏ နေ့စဉ်ဘဝ ဇာတ်လမ်း။',
      en: 'Daily life stories of university students.',
    },
    coverImage: '/webtoon-covers/campus-life.png',
    coverColor: 'bg-gradient-to-br from-sky-400 to-indigo-500',
    author: mockAuthors[1],
    genres: ['နေ့စဉ်ဘဝ', 'ဟာသ'],
    tags: ['တက္ကသိုလ်', 'ဟာသ', 'အချစ်'],
    status: 'ongoing',
    isPremium: false,
    viewCount: 650000,
    likeCount: 48000,
    episodeCount: 30,
    rating: 4.4,
    createdAt: '2024-09-01',
    updatedAt: '2026-04-19',
  },
];

export const mockEpisodes: Episode[] = [
  {
    id: '1',
    webtoonId: '1',
    webtoonTitle: { mm: 'နောက်ဆုံးမြောက်တိမ်တိုက်', en: 'The Last Cloud' },
    title: { mm: 'အစပြုခြင်း', en: 'The Beginning' },
    description: { mm: 'ခရီးစဉ် ဤနေရာမှ စတင်သည်...', en: 'The journey starts here...' },
    images: [],
    isPremium: false,
    coinPrice: 0,
    viewCount: 125000,
    likeCount: 8500,
    episodeNumber: 1,
    status: 'published',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15',
  },
  {
    id: '2',
    webtoonId: '1',
    webtoonTitle: { mm: 'နောက်ဆုံးမြောက်တိမ်တိုက်', en: 'The Last Cloud' },
    title: { mm: 'နိုးထခြင်း', en: 'Awakening' },
    description: { mm: 'စွမ်းအားများ စတင်ထွက်ပေါ်လာသည်...', en: 'Powers begin to emerge...' },
    images: [],
    isPremium: false,
    coinPrice: 0,
    viewCount: 102000,
    likeCount: 7200,
    episodeNumber: 2,
    status: 'published',
    createdAt: '2024-01-22',
    updatedAt: '2024-01-22',
  },
  {
    id: '3',
    webtoonId: '1',
    webtoonTitle: { mm: 'နောက်ဆုံးမြောက်တိမ်တိုက်', en: 'The Last Cloud' },
    title: { mm: 'ပထမဆုံးတိုက်ပွဲ', en: 'First Battle' },
    description: { mm: 'ပထမဆုံး စိန်ခေါ်မှု ပေါ်လာသည်...', en: 'The first challenge appears...' },
    images: [],
    isPremium: false,
    coinPrice: 0,
    viewCount: 87000,
    likeCount: 6100,
    episodeNumber: 3,
    status: 'published',
    createdAt: '2024-01-29',
    updatedAt: '2024-01-29',
  },
  {
    id: '4',
    webtoonId: '1',
    webtoonTitle: { mm: 'နောက်ဆုံးမြောက်တိမ်တိုက်', en: 'The Last Cloud' },
    title: { mm: 'လေ့ကျင့်ခန်း', en: 'Training' },
    description: {
      mm: 'စွမ်းအားကို ထိန်းချုပ်တတ်အောင် သင်ယူခြင်း...',
      en: 'Learning to control the power...',
    },
    images: [],
    isPremium: true,
    coinPrice: 5,
    viewCount: 71000,
    likeCount: 5300,
    episodeNumber: 4,
    status: 'published',
    createdAt: '2024-02-05',
    updatedAt: '2024-02-05',
  },
  {
    id: '5',
    webtoonId: '1',
    webtoonTitle: { mm: 'နောက်ဆုံးမြောက်တိမ်တိုက်', en: 'The Last Cloud' },
    title: { mm: 'အမှောင်လျှို့ဝှက်ချက်များ', en: 'Dark Secrets' },
    description: {
      mm: 'ဖုံးကွယ်ထားသော အမှန်တရားများ ထွက်ပေါ်လာသည်...',
      en: 'Hidden truths begin to surface...',
    },
    images: [],
    isPremium: true,
    coinPrice: 5,
    viewCount: 65000,
    likeCount: 4800,
    episodeNumber: 5,
    status: 'published',
    createdAt: '2024-02-12',
    updatedAt: '2024-02-12',
  },
];

export const mockUsers: User[] = [
  {
    id: '1',
    email: 'john.doe@example.com',
    username: 'johndoe',
    displayName: 'John Doe',
    bio: 'Webtoon enthusiast',
    coinBalance: 150,
    status: 'active',
    createdAt: '2024-01-15',
    lastLoginAt: '2026-04-27',
  },
  {
    id: '2',
    email: 'jane.smith@example.com',
    username: 'janesmith',
    displayName: 'Jane Smith',
    bio: 'Romance lover',
    coinBalance: 320,
    status: 'active',
    createdAt: '2024-02-20',
    lastLoginAt: '2026-04-26',
  },
  {
    id: '3',
    email: 'mike.wilson@example.com',
    username: 'mikewilson',
    displayName: 'Mike Wilson',
    bio: 'Action fan',
    coinBalance: 0,
    status: 'active',
    createdAt: '2024-03-10',
    lastLoginAt: '2026-04-25',
  },
  {
    id: '4',
    email: 'sarah.jones@example.com',
    username: 'sarahjones',
    displayName: 'Sarah Jones',
    bio: 'Fantasy reader',
    coinBalance: 500,
    status: 'active',
    createdAt: '2024-04-05',
    lastLoginAt: '2026-04-27',
  },
  {
    id: '5',
    email: 'david.brown@example.com',
    username: 'davidbrown',
    displayName: 'David Brown',
    bio: 'Horror fan',
    coinBalance: 75,
    status: 'banned',
    createdAt: '2024-05-15',
    lastLoginAt: '2026-04-20',
  },
];

export const mockComments: Comment[] = [
  {
    id: '1',
    userId: '1',
    user: mockUsers[0],
    webtoonId: '1',
    episodeId: '1',
    content: {
      mm: 'အရမ်းကောင်းတယ်! ဇာတ်လမ်းကို အရမ်းနှစ်သက်တယ်။',
      en: 'Amazing! I really love this story.',
    },
    likeCount: 24,
    status: 'visible',
    createdAt: '2026-04-25T10:30:00Z',
  },
  {
    id: '2',
    userId: '2',
    user: mockUsers[1],
    webtoonId: '1',
    episodeId: '1',
    content: { mm: 'ပန်းချီပုံစံက အရမ်းလှတယ်!', en: 'The art style is beautiful!' },
    likeCount: 18,
    status: 'visible',
    createdAt: '2026-04-25T11:45:00Z',
  },
];

export const mockMediaFiles: MediaFile[] = [
  {
    id: 'm1',
    name: 'cover-1.jpg',
    type: 'image',
    url: 'https://picsum.photos/seed/webtoon1/400/600',
    size: 125000,
    uploadedAt: '2026-04-20',
    category: 'covers',
  },
  {
    id: 'm2',
    name: 'cover-2.jpg',
    type: 'image',
    url: 'https://picsum.photos/seed/webtoon2/400/600',
    size: 98000,
    uploadedAt: '2026-04-21',
    category: 'covers',
  },
];

export const mockActivityLogs: ActivityLog[] = [
  {
    id: 'a1',
    adminId: 'admin1',
    adminName: 'Admin User',
    action: 'create',
    targetType: 'webtoon',
    targetId: '1',
    targetName: { mm: 'နောက်ဆုံးမြောက်တိမ်တိုက်', en: 'The Last Cloud' },
    details: { mm: 'ဝက်ဘ်တွန်းအသစ် ဖန်တီးခဲ့သည်', en: 'Created new webtoon' },
    createdAt: '2026-04-27T10:00:00Z',
  },
];

export const mockReports: Report[] = [
  {
    id: 'r1',
    type: 'comment',
    reason: 'inappropriate',
    status: 'pending',
    reporterId: 'u1',
    reporterName: 'john_doe',
    targetId: 'c1',
    targetName: { mm: 'အပိုင်း ၅ မှ မှတ်ချက်', en: 'Comment on Episode 5' },
    description: {
      mm: 'ဤမှတ်ချက်တွင် မသင့်လျော်သော စကားလုံးများ ပါဝင်နေသည်။',
      en: 'This comment contains inappropriate language.',
    },
    priority: 'high',
    createdAt: '2026-04-27T12:00:00Z',
  },
];

export const mockTransactions: Transaction[] = [
  {
    id: 't1',
    type: 'purchase',
    userId: 'u1',
    userName: { mm: 'ကိုဂျွန်', en: 'john_doe' },
    amount: 9.99,
    coins: 100,
    status: 'completed',
    description: { mm: 'ဒင်္ဂါးဝယ်ယူမှု - ၁၀၀ ဒင်္ဂါး', en: 'Coin purchase - 100 coins' },
    createdAt: '2026-04-27 14:30',
    paymentMethod: 'Credit Card',
  },
];

export const mockScheduledEpisodes: ScheduledEpisode[] = [
  {
    id: 's1',
    webtoonId: '1',
    webtoonTitle: { mm: 'နောက်ဆုံးမြောက်တိမ်တိုက်', en: 'The Last Cloud' },
    episodeNumber: 86,
    title: { mm: 'နောက်ဆုံးတိုက်ပွဲ', en: 'The Final Battle' },
    scheduledAt: '2026-04-28T10:00:00',
    status: 'scheduled',
  },
];

export const getSharedData = (): SharedData => ({
  dashboardStats: mockDashboardStats,
  revenueData: mockRevenueData,
  userGrowthData: mockUserGrowthData,
  popularWebtoons: mockPopularWebtoons,
  authors: mockAuthors,
  genres: mockGenres,
  webtoons: mockWebtoons,
  episodes: mockEpisodes,
  users: mockUsers,
  comments: mockComments,
  mediaFiles: mockMediaFiles,
  activityLogs: mockActivityLogs,
  reports: mockReports,
  transactions: mockTransactions,
  scheduledEpisodes: mockScheduledEpisodes,
});

export const exportToJSON = (data: SharedData): string => {
  return JSON.stringify(data, null, 2);
};

export const importFromJSON = (jsonString: string): SharedData => {
  try {
    return JSON.parse(jsonString) as SharedData;
  } catch {
    throw new Error('Invalid JSON format');
  }
};

export const downloadJSON = (data: SharedData, filename: string = 'softgate-comic-data.json') => {
  const json = exportToJSON(data);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

export const saveToLocalStorage = (data: SharedData) => {
  localStorage.setItem('softgate-comic-shared-data', exportToJSON(data));
};

export const loadFromLocalStorage = (): SharedData | null => {
  const stored = localStorage.getItem('softgate-comic-shared-data');
  if (stored) {
    try {
      return importFromJSON(stored);
    } catch {
      return null;
    }
  }
  return null;
};
