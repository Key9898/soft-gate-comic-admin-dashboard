export type BilingualText = { en: string; mm: string };

export type AuthorStatus = 'active' | 'inactive';
export type WebtoonStatus = 'ongoing' | 'completed' | 'hiatus' | 'draft';
export type EpisodeStatus = 'published' | 'draft' | 'scheduled';

export type ImageSize = { width: number; height: number } | null;

export interface AuthorRecord {
  id: string;
  name: BilingualText;
  bio?: BilingualText;
  avatar?: string;
  followerCount: number;
  status: AuthorStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface GenreRecord {
  id: string;
  name: BilingualText;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WebtoonRecord {
  id: string;
  title: BilingualText;
  description: BilingualText;
  coverImage?: string;
  coverColor: string;
  authorId: string;
  genreIds: string[];
  tags: string[];
  status: WebtoonStatus;
  isPremium: boolean;
  viewCount: number;
  likeCount: number;
  rating: number;
  contentRating: string;
  spotlight: boolean;
  spotlightOrder?: number;
  weeklyViewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface EpisodeRecord {
  id: string;
  webtoonId: string;
  title: BilingualText;
  description?: BilingualText;
  images: string[];
  imageSizes?: ImageSize[];
  isPremium: boolean;
  coinPrice: number;
  viewCount: number;
  likeCount: number;
  episodeNumber: number;
  status: EpisodeStatus;
  freeAt?: Date;
  scheduledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type AuthorPatch = Partial<Pick<AuthorRecord, 'name' | 'bio' | 'avatar' | 'status'>>;

export type WebtoonPatch = Partial<
  Pick<
    WebtoonRecord,
    | 'title'
    | 'description'
    | 'coverImage'
    | 'coverColor'
    | 'authorId'
    | 'genreIds'
    | 'tags'
    | 'status'
    | 'isPremium'
    | 'contentRating'
    | 'spotlight'
    | 'spotlightOrder'
    | 'weeklyViewCount'
  >
>;

export type EpisodePatch = Partial<
  Pick<
    EpisodeRecord,
    | 'title'
    | 'description'
    | 'images'
    | 'imageSizes'
    | 'isPremium'
    | 'coinPrice'
    | 'episodeNumber'
    | 'status'
    | 'freeAt'
    | 'scheduledAt'
  >
>;

export interface CatalogStore {
  listAuthors(): Promise<AuthorRecord[]>;
  findAuthorById(id: string): Promise<AuthorRecord | null>;
  createAuthor(input: Omit<AuthorRecord, 'createdAt' | 'updatedAt'>): Promise<AuthorRecord>;
  updateAuthor(id: string, patch: AuthorPatch): Promise<AuthorRecord | null>;
  deleteAuthor(id: string): Promise<boolean>;

  listGenres(): Promise<GenreRecord[]>;
  findGenreById(id: string): Promise<GenreRecord | null>;
  findGenreBySlug(slug: string): Promise<GenreRecord | null>;
  createGenre(input: Omit<GenreRecord, 'createdAt' | 'updatedAt'>): Promise<GenreRecord>;
  updateGenre(id: string, patch: Pick<GenreRecord, 'name'>): Promise<GenreRecord | null>;
  deleteGenre(id: string): Promise<boolean>;

  listWebtoons(): Promise<WebtoonRecord[]>;
  findWebtoonById(id: string): Promise<WebtoonRecord | null>;
  createWebtoon(input: Omit<WebtoonRecord, 'createdAt' | 'updatedAt'>): Promise<WebtoonRecord>;
  updateWebtoon(id: string, patch: WebtoonPatch): Promise<WebtoonRecord | null>;
  deleteWebtoon(id: string): Promise<boolean>;

  listEpisodes(webtoonId?: string): Promise<EpisodeRecord[]>;
  findEpisodeById(id: string): Promise<EpisodeRecord | null>;
  createEpisode(input: Omit<EpisodeRecord, 'createdAt' | 'updatedAt'>): Promise<EpisodeRecord>;
  updateEpisode(id: string, patch: EpisodePatch): Promise<EpisodeRecord | null>;
  deleteEpisode(id: string): Promise<boolean>;
  maxEpisodeNumber(webtoonId: string): Promise<number>;
}

export class CatalogConflictError extends Error {
  constructor(message = 'Conflict') {
    super(message);
    this.name = 'CatalogConflictError';
  }
}
