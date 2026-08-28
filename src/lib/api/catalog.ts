import type { Author, Episode, Genre, Webtoon } from '@softgate/shared';
import { apiRequest } from './http';

export type WebtoonWriteBody = {
  title: Webtoon['title'];
  description: Webtoon['description'];
  authorId: string;
  genres: string[];
  tags: string[];
  coverImage?: string;
  coverColor?: string;
  status: Webtoon['status'];
  isPremium: boolean;
  contentRating: Webtoon['contentRating'];
  weeklyViewCount: number;
  spotlight: boolean;
  spotlightOrder?: number;
};

export type AuthorWriteBody = {
  name: Author['name'];
  bio?: Author['bio'];
  avatar?: string;
  status: Author['status'];
};

export type GenreWriteBody = {
  name: Genre['name'];
  slug?: string;
};

export type EpisodeWriteBody = {
  title: Episode['title'];
  description?: Episode['description'];
  webtoonId?: string;
  images: string[];
  imageSizes?: Episode['imageSizes'];
  isPremium: boolean;
  coinPrice: number;
  status: Episode['status'];
  scheduledAt?: string;
  freeAt?: string;
};

export function listAuthors() {
  return apiRequest<{ authors: Author[] }>('/api/authors');
}

export function createAuthor(body: AuthorWriteBody) {
  return apiRequest<{ author: Author }>('/api/authors', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function updateAuthor(id: string, body: AuthorWriteBody) {
  return apiRequest<{ author: Author }>(`/api/authors/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export function deleteAuthor(id: string) {
  return apiRequest<{ ok: true }>(`/api/authors/${id}`, { method: 'DELETE' });
}

export function listGenres() {
  return apiRequest<{ genres: Genre[] }>('/api/genres');
}

export function createGenre(body: GenreWriteBody) {
  return apiRequest<{ genre: Genre }>('/api/genres', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function updateGenre(id: string, body: Pick<GenreWriteBody, 'name'>) {
  return apiRequest<{ genre: Genre }>(`/api/genres/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export function deleteGenre(id: string) {
  return apiRequest<{ ok: true }>(`/api/genres/${id}`, { method: 'DELETE' });
}

export function listWebtoons() {
  return apiRequest<{ webtoons: Webtoon[] }>('/api/webtoons');
}

export function createWebtoon(body: WebtoonWriteBody) {
  return apiRequest<{ webtoon: Webtoon }>('/api/webtoons', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function updateWebtoon(id: string, body: WebtoonWriteBody) {
  return apiRequest<{ webtoon: Webtoon }>(`/api/webtoons/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export function deleteWebtoon(id: string) {
  return apiRequest<{ ok: true }>(`/api/webtoons/${id}`, { method: 'DELETE' });
}

export function listEpisodes() {
  return apiRequest<{ episodes: Episode[] }>('/api/episodes');
}

export function createEpisode(body: EpisodeWriteBody) {
  return apiRequest<{ episode: Episode }>('/api/episodes', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function updateEpisode(id: string, body: Omit<EpisodeWriteBody, 'webtoonId'>) {
  return apiRequest<{ episode: Episode }>(`/api/episodes/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export function deleteEpisode(id: string) {
  return apiRequest<{ ok: true }>(`/api/episodes/${id}`, { method: 'DELETE' });
}

export async function loadCatalog() {
  const [authors, genres, webtoons, episodes] = await Promise.all([
    listAuthors(),
    listGenres(),
    listWebtoons(),
    listEpisodes(),
  ]);
  return {
    authors: authors.authors,
    genres: genres.genres,
    webtoons: webtoons.webtoons,
    episodes: episodes.episodes,
  };
}
