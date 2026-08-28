import type { AuthorRecord, EpisodeRecord, GenreRecord, WebtoonRecord } from './catalogStore.js';
import { derivedWebtoonCountForAuthor, derivedWebtoonCountForGenre } from './rules.js';

export function publicAuthor(author: AuthorRecord, webtoonCount: number) {
  return {
    id: author.id,
    name: author.name,
    ...(author.avatar ? { avatar: author.avatar } : {}),
    ...(author.bio ? { bio: author.bio } : {}),
    followerCount: author.followerCount,
    webtoonCount,
    status: author.status,
  };
}

export function publicGenre(genre: GenreRecord, webtoonCount: number) {
  return {
    id: genre.id,
    name: genre.name,
    slug: genre.slug,
    webtoonCount,
  };
}

export function publicWebtoon(
  webtoon: WebtoonRecord,
  author: AuthorRecord,
  genres: GenreRecord[],
  episodeCount: number,
  allWebtoons: WebtoonRecord[],
) {
  const slugs = webtoon.genreIds
    .map((id) => genres.find((genre) => genre.id === id)?.slug)
    .filter((slug): slug is string => Boolean(slug));
  return {
    id: webtoon.id,
    title: webtoon.title,
    description: webtoon.description,
    ...(webtoon.coverImage ? { coverImage: webtoon.coverImage } : {}),
    coverColor: webtoon.coverColor,
    author: publicAuthor(author, derivedWebtoonCountForAuthor(allWebtoons, author.id)),
    genres: slugs,
    tags: webtoon.tags,
    status: webtoon.status,
    isPremium: webtoon.isPremium,
    viewCount: webtoon.viewCount,
    likeCount: webtoon.likeCount,
    episodeCount,
    rating: webtoon.rating,
    contentRating: webtoon.contentRating,
    createdAt: webtoon.createdAt.toISOString(),
    updatedAt: webtoon.updatedAt.toISOString(),
    spotlight: webtoon.spotlight,
    ...(webtoon.spotlightOrder != null ? { spotlightOrder: webtoon.spotlightOrder } : {}),
    weeklyViewCount: webtoon.weeklyViewCount,
  };
}

export function publicEpisode(episode: EpisodeRecord, webtoonTitle: { en: string; mm: string }) {
  return {
    id: episode.id,
    webtoonId: episode.webtoonId,
    webtoonTitle,
    title: episode.title,
    ...(episode.description ? { description: episode.description } : {}),
    images: episode.images,
    ...(episode.imageSizes ? { imageSizes: episode.imageSizes } : {}),
    isPremium: episode.isPremium,
    coinPrice: episode.coinPrice,
    viewCount: episode.viewCount,
    likeCount: episode.likeCount,
    episodeNumber: episode.episodeNumber,
    status: episode.status,
    createdAt: episode.createdAt.toISOString(),
    updatedAt: episode.updatedAt.toISOString(),
    ...(episode.freeAt ? { freeAt: episode.freeAt.toISOString() } : {}),
    ...(episode.scheduledAt ? { scheduledAt: episode.scheduledAt.toISOString() } : {}),
  };
}

export function authorPayload(author: AuthorRecord, webtoons: WebtoonRecord[]) {
  return publicAuthor(author, derivedWebtoonCountForAuthor(webtoons, author.id));
}

export function genrePayload(genre: GenreRecord, webtoons: WebtoonRecord[]) {
  return publicGenre(genre, derivedWebtoonCountForGenre(webtoons, genre));
}
