# Soft-Gate Comic Shared Package - Soft-Gate Comic Website အတွက် ညွှန်ကြားချက်များ

## အကျဉ်းချုပ်

Admin Dashboard နှင့် Soft-Gate Comic Website နှစ်ခုလုံးက တူညီသော mock data ကို အသုံးပြုနိုင်ရန် `@Soft-Gate Comic/shared` package ကို ဖန်တီးထားပါသည်။

---

## 📁 Package တည်နေရာ

```
Soft-Gate Comic-admin-dashboard/
└── packages/
    └── shared/
        ├── package.json
        ├── tsconfig.json
        └── src/
            ├── index.ts      ← Main export
            ├── types.ts      ← TypeScript types
            └── data.ts       ← Mock data + sync functions
```

---

## 🔧 Soft-Gate Comic Website မှာ လုပ်ရမည့်အရာများ

### 1. Shared Package ကို Copy လုပ်ရန်

```bash
# Soft-Gate Comic project folder ထဲသို့ သွားပါ
cd c:\Users\keych\Development\Projects\Personal\Soft-Gate Comic

# packages/shared folder ကို copy လုပ်ပါ
# Admin Dashboard မှ:
# Soft-Gate Comic-admin-dashboard/packages/shared → Soft-Gate Comic/packages/shared

# public/webtoon-covers folder ကိုလည်း copy လုပ်ပါ
# Soft-Gate Comic-admin-dashboard/public/webtoon-covers → Soft-Gate Comic/public/webtoon-covers
```

### 2. tsconfig.json တွင် Path Alias ထည့်ရန်

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@Soft-Gate Comic/shared": ["./packages/shared/src"]
    }
  },
  "include": ["src", "packages/shared/src"]
}
```

### 3. vite.config.ts တွင် Alias ထည့်ရန်

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@Soft-Gate Comic/shared': path.resolve(__dirname, './packages/shared/src'),
    },
  },
});
```

### 4. Data Import လုပ်ခြင်း

```typescript
// Types import လုပ်ရန်
import type { Webtoon, Episode, User, Author, Genre } from '@Soft-Gate Comic/shared'

// Mock data import လုပ်ရန်
import {
  mockWebtoons,
  mockEpisodes,
  mockUsers,
  mockAuthors,
  mockGenres,
  getSharedData,
  loadFromLocalStorage,
} from '@Soft-Gate Comic/shared'

// ဥပမာ - Webtoon List Page
const WebtoonListPage = () => {
  const webtoons = mockWebtoons

  return (
    <div>
      {webtoons.map((webtoon) => (
        <div key={webtoon.id}>
          <h2>{webtoon.title}</h2>
          <p>{webtoon.description}</p>
        </div>
      ))}
    </div>
  )
}
```

---

## 🔄 Data Sync လုပ်ခြင်း

### LocalStorage ဖြင့် Sync လုပ်ခြင်း

Admin Dashboard နှင့် Website နှစ်ခုလုံး `localhost` တွင် run နေပါက LocalStorage ကို အသုံးပြု၍ data sync လုပ်နိုင်ပါသည်။

#### Admin Dashboard တွင် Data သိမ်းခြင်း

```typescript
import { saveToLocalStorage, getSharedData } from '@Soft-Gate Comic/shared';

// Data ပြောင်းလဲပြီးတိုင်း save လုပ်ရန်
const handleSaveWebtoon = (webtoon: Webtoon) => {
  // ... webtoon save logic
  const data = getSharedData();
  data.webtoons = updatedWebtoons;
  saveToLocalStorage(data);
};
```

#### Website တွင် Data ဖတ်ခြင်း

```typescript
import { loadFromLocalStorage, mockWebtoons } from '@Soft-Gate Comic/shared'

const WebtoonListPage = () => {
  // LocalStorage မှ data ဖတ်ရန် (Admin က save လုပ်ထားတာ)
  const storedData = loadFromLocalStorage()

  // LocalStorage မှာ data ရှိရင် အဲဒါကို သုံး၊ မရှိရင် mock data ကို သုံး
  const webtoons = storedData?.webtoons || mockWebtoons

  return (
    // ... render webtoons
  )
}
```

---

## 📦 Export လုပ်ထားသော Types

```typescript
// Types
export type {
  AdminUser,
  User,
  Webtoon,
  Episode,
  Author,
  Genre,
  Comment,
  DashboardStats,
  RevenueData,
  UserGrowthData,
  PopularWebtoon,
  Notification,
  MediaFile,
  ActivityLog,
  Report,
  Transaction,
  ScheduledEpisode,
  SharedData,
};
```

---

## 📦 Export လုပ်ထားသော Data

```typescript
// Mock Data
export {
  mockDashboardStats,
  mockRevenueData,
  mockUserGrowthData,
  mockPopularWebtoons,
  mockAuthors,
  mockGenres,
  mockWebtoons,
  mockEpisodes,
  mockUsers,
  mockComments,
  mockMediaFiles,
  mockActivityLogs,
  mockReports,
  mockTransactions,
  mockScheduledEpisodes,
};

// Sync Functions
export {
  getSharedData, // မြင်နေရသမျှ data အားလုံးကို object အဖြစ် return
  exportToJSON, // Data ကို JSON string အဖြစ် return
  importFromJSON, // JSON string ကနေ data ပြန်ပြောင်း
  downloadJSON, // Data ကို JSON file အဖြစ် download
  saveToLocalStorage, // Data ကို localStorage မှာ သိမ်း
  loadFromLocalStorage, // localStorage မှ data ဖတ်
};
```

---

## 🎯 အသုံးပြုပုံ ဥပမာများ

### Webtoon Detail Page

```typescript
import { mockWebtoons, mockEpisodes } from '@Soft-Gate Comic/shared'
import type { Webtoon, Episode } from '@Soft-Gate Comic/shared'

const WebtoonDetailPage = ({ webtoonId }: { webtoonId: string }) => {
  const webtoon = mockWebtoons.find((w) => w.id === webtoonId)
  const episodes = mockEpisodes.filter((e) => e.webtoonId === webtoonId)

  if (!webtoon) return <div>Webtoon not found</div>

  return (
    <div>
      <h1>{webtoon.title}</h1>
      <p>{webtoon.description}</p>
      <div>
        {episodes.map((episode) => (
          <div key={episode.id}>
            <h3>Episode {episode.episodeNumber}: {episode.title}</h3>
          </div>
        ))}
      </div>
    </div>
  )
}
```

### Episode Reader Page

```typescript
import { mockEpisodes } from '@Soft-Gate Comic/shared'

const EpisodeReaderPage = ({ episodeId }: { episodeId: string }) => {
  const episode = mockEpisodes.find((e) => e.id === episodeId)

  if (!episode) return <div>Episode not found</div>

  return (
    <div>
      <h1>{episode.title}</h1>
      <div>
        {episode.images.map((image, index) => (
          <img key={index} src={image} alt={`Page ${index + 1}`} />
        ))}
      </div>
    </div>
  )
}
```

---

## ⚠️ သတိပေးချက်များ

1. **Data Structure တူညီရမည်** - Admin နှင့် Website နှစ်ခုလုံး same types ကို အသုံးပြုရမည်
2. **LocalStorage သည် Same Origin တွင်သာ အလုပ်လုပ်သည်** - နှစ် project လုံး localhost တွင် run နေရမည်
3. **Production အတွက် မသင့်တော်ပါ** - ဤနည်းလမ်းသည် development/demo အတွက်သာ ဖြစ်သည်

---

## 🚀 နောက်ထပ်အဆင့်

Production အတွက် Backend API တည်ဆောက်ပြီး အမှန်တကယ် data sync လုပ်ရမည်။

```
Admin Dashboard → Backend API → Database
                    ↓
Soft-Gate Comic Website ← Backend API ← Database
```
