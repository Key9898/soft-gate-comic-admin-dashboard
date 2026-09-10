import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Image as ImageIcon, X } from 'lucide-react';
import { Button, Card, Input, PageSEO } from '../../components';
import MediaPicker from '../../components/MediaPicker/MediaPicker';
import type { MediaFile } from '../../components/MediaPicker/MediaPicker';
import { useAuth } from '@/features/auth/useAuth';
import { useStaffAccess } from '@/lib/auth/staffAccess';
import { appendActivityLog } from '@/lib/activityLog';
import { useData } from '@/lib/DataContext';
import type { ContentRating, Webtoon } from '../../types';
import WebtoonsPageSkeleton from './components/WebtoonsPageSkeleton';
import { nowIso, stampIso } from '@/lib/yangonDate';
import {
  SPOTLIGHT_CAP,
  SPOTLIGHT_ORDERS,
  canFlagSpotlight,
  flaggedSpotlightCount,
  isSpotlightOrderTaken,
} from '@/lib/spotlight';
import { authorsForPicker, syncAuthorWebtoonCounts } from '@/lib/authors';
import { canonicalizeWebtoonGenres, genresForPicker, syncGenreWebtoonCounts } from '@/lib/genres';
import { apiMessage, isMockApi } from '@/lib/api/http';
import { createWebtoon, updateWebtoon } from '@/lib/api/catalog';

const popularTags = [
  'action',
  'romance',
  'comedy',
  'drama',
  'fantasy',
  'horror',
  'thriller',
  'slice-of-life',
  'supernatural',
  'mystery',
  'sci-fi',
  'school-life',
  'webtoon',
  'manhwa',
  'completed',
  'new',
  'trending',
  'recommended',
];

const emptyForm = {
  titleEn: '',
  titleMm: '',
  descriptionEn: '',
  descriptionMm: '',
  author: '',
  genres: [] as string[],
  tags: [] as string[],
  coverImage: '',
  status: 'draft' as Webtoon['status'],
  isPremium: false,
  contentRating: 'all' as ContentRating,
  weeklyViewCount: 0,
  spotlight: false,
  spotlightOrder: 1,
};

const isDurableCoverUrl = (url: string): boolean => !url.startsWith('blob:');

const WebtoonEditorPage = () => {
  const { webtoonId } = useParams<{ webtoonId: string }>();
  const isEdit = Boolean(webtoonId);
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { canWriteCatalog } = useStaffAccess();
  const {
    webtoons,
    setWebtoons,
    authors,
    setAuthors,
    genres,
    setGenres,
    setActivityLogs,
    isLoading,
    reloadCatalog,
  } = useData();

  const [formData, setFormData] = useState(emptyForm);
  const [tagInput, setTagInput] = useState('');
  const [formError, setFormError] = useState('');
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [hydratedId, setHydratedId] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!canWriteCatalog) {
      navigate('/webtoons', { replace: true });
    }
  }, [authLoading, canWriteCatalog, navigate]);

  const selectedWebtoon = useMemo(
    () => (webtoonId ? (webtoons.find((webtoon) => webtoon.id === webtoonId) ?? null) : null),
    [webtoonId, webtoons],
  );
  const spotlightExcludeId = isEdit ? webtoonId : undefined;

  useEffect(() => {
    if (!isEdit || !selectedWebtoon || hydratedId === selectedWebtoon.id) return;
    setFormData({
      titleEn: selectedWebtoon.title.en,
      titleMm: selectedWebtoon.title.mm,
      descriptionEn: selectedWebtoon.description.en,
      descriptionMm: selectedWebtoon.description.mm,
      author: selectedWebtoon.author.id,
      genres: canonicalizeWebtoonGenres(selectedWebtoon.genres, genres),
      tags: selectedWebtoon.tags || [],
      coverImage: selectedWebtoon.coverImage || '',
      status: selectedWebtoon.status,
      isPremium: selectedWebtoon.isPremium,
      contentRating: selectedWebtoon.contentRating ?? 'all',
      weeklyViewCount: selectedWebtoon.weeklyViewCount ?? 0,
      spotlight: Boolean(selectedWebtoon.spotlight),
      spotlightOrder: selectedWebtoon.spotlightOrder ?? 1,
    });
    setHydratedId(selectedWebtoon.id);
    setFormError('');
  }, [genres, hydratedId, isEdit, selectedWebtoon]);

  const handleCoverSelect = (files: MediaFile[]) => {
    if (files.length > 0) {
      setFormData((prev) => ({ ...prev, coverImage: files[0].url }));
    }
    setIsMediaPickerOpen(false);
  };

  const addTag = (tag: string) => {
    const normalizedTag = tag.toLowerCase().trim();
    if (normalizedTag && !formData.tags.includes(normalizedTag)) {
      setFormData({ ...formData, tags: [...formData.tags, normalizedTag] });
    }
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter((item) => item !== tag) });
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(tagInput);
    }
  };

  const toggleGenre = (genre: string) => {
    setFormData((prev) => ({
      ...prev,
      genres: prev.genres.includes(genre)
        ? prev.genres.filter((item) => item !== genre)
        : [...prev.genres, genre],
    }));
  };

  const webtoonWriteBody = () => ({
    title: { en: formData.titleEn, mm: formData.titleMm },
    description: { en: formData.descriptionEn, mm: formData.descriptionMm },
    authorId: formData.author,
    genres: canonicalizeWebtoonGenres(formData.genres, genres),
    tags: formData.tags,
    coverImage: formData.coverImage || undefined,
    coverColor: formData.coverImage ? '' : 'bg-gradient-to-br from-gray-400 to-gray-600',
    status: formData.status,
    isPremium: formData.isPremium,
    contentRating: formData.contentRating,
    weeklyViewCount: formData.weeklyViewCount,
    spotlight: formData.spotlight,
    spotlightOrder: formData.spotlight ? formData.spotlightOrder : undefined,
  });

  const handleSave = async () => {
    if (!canWriteCatalog) return;
    if (formData.coverImage && !isDurableCoverUrl(formData.coverImage)) {
      setFormError('Replace the blob cover with a Media Library image before saving.');
      return;
    }
    if (formData.spotlight) {
      if (!canFlagSpotlight(webtoons, spotlightExcludeId, formData.status)) {
        setFormError(`Spotlight is limited to ${SPOTLIGHT_CAP} non-draft titles.`);
        return;
      }
      if (isSpotlightOrderTaken(webtoons, formData.spotlightOrder, spotlightExcludeId)) {
        setFormError(`Spotlight order ${formData.spotlightOrder} is already in use.`);
        return;
      }
    }

    if (!isMockApi()) {
      try {
        if (isEdit && webtoonId) {
          await updateWebtoon(webtoonId, webtoonWriteBody());
          await reloadCatalog();
          appendActivityLog(setActivityLogs, {
            action: 'update',
            targetType: 'webtoon',
            targetId: webtoonId,
            targetName: { en: formData.titleEn, mm: formData.titleMm },
            admin: user,
          });
        } else {
          const { webtoon } = await createWebtoon(webtoonWriteBody());
          await reloadCatalog();
          appendActivityLog(setActivityLogs, {
            action: 'create',
            targetType: 'webtoon',
            targetId: webtoon.id,
            targetName: webtoon.title,
            admin: user,
          });
        }
        navigate('/webtoons');
      } catch (err) {
        setFormError(apiMessage(err, 'Could not save webtoon'));
      }
      return;
    }

    if (isEdit && selectedWebtoon) {
      const nextWebtoons = webtoons.map((item) =>
        item.id === selectedWebtoon.id
          ? {
              ...item,
              title: { en: formData.titleEn, mm: formData.titleMm },
              description: { en: formData.descriptionEn, mm: formData.descriptionMm },
              coverImage: formData.coverImage || undefined,
              coverColor: formData.coverImage ? '' : item.coverColor,
              author: authors.find((author) => author.id === formData.author) || item.author,
              genres: canonicalizeWebtoonGenres(formData.genres, genres),
              tags: formData.tags,
              status: formData.status,
              isPremium: formData.isPremium,
              contentRating: formData.contentRating,
              weeklyViewCount: formData.weeklyViewCount,
              spotlight: formData.spotlight,
              spotlightOrder: formData.spotlight ? formData.spotlightOrder : undefined,
              updatedAt: nowIso(),
            }
          : item,
      );
      setWebtoons(nextWebtoons);
      setAuthors(syncAuthorWebtoonCounts(authors, nextWebtoons));
      setGenres(syncGenreWebtoonCounts(genres, nextWebtoons));
      appendActivityLog(setActivityLogs, {
        action: 'update',
        targetType: 'webtoon',
        targetId: selectedWebtoon.id,
        targetName: { en: formData.titleEn, mm: formData.titleMm },
        admin: user,
      });
      navigate('/webtoons');
      return;
    }

    const now = nowIso();
    const newWebtoon: Webtoon = {
      id: `${Date.now()}`,
      title: { en: formData.titleEn, mm: formData.titleMm },
      description: { en: formData.descriptionEn, mm: formData.descriptionMm },
      coverImage: formData.coverImage || undefined,
      coverColor: formData.coverImage ? '' : 'bg-gradient-to-br from-gray-400 to-gray-600',
      author: authors.find((author) => author.id === formData.author) || authors[0],
      genres: canonicalizeWebtoonGenres(formData.genres, genres),
      tags: formData.tags,
      status: formData.status,
      isPremium: formData.isPremium,
      viewCount: 0,
      likeCount: 0,
      episodeCount: 0,
      rating: 0,
      contentRating: formData.contentRating,
      weeklyViewCount: formData.weeklyViewCount,
      spotlight: formData.spotlight,
      spotlightOrder: formData.spotlight ? formData.spotlightOrder : undefined,
      createdAt: stampIso(),
      updatedAt: now,
    };
    const nextWebtoons = [newWebtoon, ...webtoons];
    setWebtoons(nextWebtoons);
    setAuthors(syncAuthorWebtoonCounts(authors, nextWebtoons));
    setGenres(syncGenreWebtoonCounts(genres, nextWebtoons));
    appendActivityLog(setActivityLogs, {
      action: 'create',
      targetType: 'webtoon',
      targetId: newWebtoon.id,
      targetName: newWebtoon.title,
      admin: user,
    });
    navigate('/webtoons');
  };

  if (authLoading || isLoading) {
    return (
      <>
        <PageSEO.Webtoons />
        <WebtoonsPageSkeleton />
      </>
    );
  }

  if (!canWriteCatalog) return null;

  if (isEdit && !selectedWebtoon) {
    return (
      <>
        <PageSEO.Webtoons />
        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-fg">Webtoon not found</h1>
          <p className="text-fg-muted">That series is not on this desk.</p>
          <Link to="/webtoons" className="text-sm font-medium text-primary-600 hover:underline">
            Back to Webtoons
          </Link>
        </div>
      </>
    );
  }

  const fieldPrefix = isEdit ? 'edit' : 'add';

  return (
    <>
      <PageSEO.Webtoons />
      <div className="space-y-6">
        <div>
          <Link to="/webtoons" className="text-sm font-medium text-primary-600 hover:underline">
            Back to Webtoons
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-fg">
            {isEdit ? 'Edit Webtoon' : 'Add Webtoon'}
          </h1>
          <p className="mt-1 text-fg-muted">Cover comes from Media. Choose from Media.</p>
        </div>

        <Card>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void handleSave();
            }}
            className="space-y-4"
          >
            <div>
              <label className="mb-1.5 block text-sm font-medium text-fg-secondary">
                Cover Image
              </label>
              <div className="flex items-start gap-4">
                <div
                  className="flex h-32 w-24 cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-line-strong bg-gray-50 transition-colors hover:border-primary-400"
                  onClick={() => setIsMediaPickerOpen(true)}
                >
                  {formData.coverImage ? (
                    <img
                      src={formData.coverImage}
                      alt="Cover"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="p-2 text-center">
                      <ImageIcon className="mx-auto h-8 w-8 text-fg-muted" />
                      <p className="mt-1 text-xs text-fg-muted">Choose from Media</p>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="mb-2 text-sm text-fg-secondary">Recommended: 400x600px, JPG/PNG</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsMediaPickerOpen(true)}
                  >
                    Choose from Media
                  </Button>
                  {formData.coverImage ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="ml-2"
                      onClick={() => setFormData({ ...formData, coverImage: '' })}
                    >
                      Remove
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>

            <Input
              label="Title (EN)"
              value={formData.titleEn}
              onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
              required
            />
            <Input
              label="Title (MM)"
              value={formData.titleMm}
              onChange={(e) => setFormData({ ...formData, titleMm: e.target.value })}
            />
            <div>
              <label
                htmlFor={`${fieldPrefix}-description-en`}
                className="mb-1.5 block text-sm font-medium text-fg-secondary"
              >
                Description (EN)
              </label>
              <textarea
                id={`${fieldPrefix}-description-en`}
                value={formData.descriptionEn}
                onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                rows={3}
                className="input-base"
                required
              />
            </div>
            <div>
              <label
                htmlFor={`${fieldPrefix}-description-mm`}
                className="mb-1.5 block text-sm font-medium text-fg-secondary"
              >
                Description (MM)
              </label>
              <textarea
                id={`${fieldPrefix}-description-mm`}
                value={formData.descriptionMm}
                onChange={(e) => setFormData({ ...formData, descriptionMm: e.target.value })}
                rows={3}
                className="input-base"
              />
            </div>
            <div>
              <label
                htmlFor={`${fieldPrefix}-author`}
                className="mb-1.5 block text-sm font-medium text-fg-secondary"
              >
                Author
              </label>
              <select
                id={`${fieldPrefix}-author`}
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                className="input-base"
                required
              >
                <option value="">Select author</option>
                {authorsForPicker(authors, isEdit ? selectedWebtoon?.author.id : undefined).map(
                  (author) => (
                    <option key={author.id} value={author.id}>
                      {author.name.en}
                    </option>
                  ),
                )}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-fg-secondary">Genres</label>
              <div className="flex flex-wrap gap-2">
                {genresForPicker(genres).map((genre) => (
                  <button
                    key={genre.id}
                    type="button"
                    onClick={() => toggleGenre(genre.slug)}
                    className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                      formData.genres.includes(genre.slug)
                        ? 'bg-primary-100 text-primary-700'
                        : 'bg-gray-100 text-fg-secondary hover:bg-gray-200'
                    }`}
                  >
                    {genre.name.en}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-fg-secondary">Tags</label>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2 py-1 text-sm text-fg-secondary"
                    >
                      #{tag}
                      <button
                        type="button"
                        title={`Remove tag: ${tag}`}
                        onClick={() => removeTag(tag)}
                        className="hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    placeholder="Type tag and press Enter..."
                    className="flex-1 rounded-lg border border-line-strong px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div className="flex flex-wrap gap-1">
                  <span className="mr-2 text-xs text-fg-muted">Popular:</span>
                  {popularTags
                    .filter((tag) => !formData.tags.includes(tag))
                    .slice(0, 8)
                    .map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => addTag(tag)}
                        className="rounded bg-gray-50 px-2 py-0.5 text-xs text-fg-secondary hover:bg-gray-100"
                      >
                        #{tag}
                      </button>
                    ))}
                </div>
              </div>
            </div>
            <div>
              <label
                htmlFor={`${fieldPrefix}-status`}
                className="mb-1.5 block text-sm font-medium text-fg-secondary"
              >
                Status
              </label>
              <select
                id={`${fieldPrefix}-status`}
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as Webtoon['status'] })
                }
                className="input-base"
              >
                <option value="draft">Draft</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="hiatus">Hiatus</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id={`${fieldPrefix}IsPremium`}
                checked={formData.isPremium}
                onChange={(e) => setFormData({ ...formData, isPremium: e.target.checked })}
                className="h-4 w-4 rounded border-line-strong text-primary-600 focus:ring-primary-500"
              />
              <label htmlFor={`${fieldPrefix}IsPremium`} className="text-sm text-fg-secondary">
                Premium Content
              </label>
            </div>
            <div>
              <label
                htmlFor={`${fieldPrefix}-content-rating`}
                className="mb-1.5 block text-sm font-medium text-fg-secondary"
              >
                Content rating
              </label>
              <select
                id={`${fieldPrefix}-content-rating`}
                value={formData.contentRating}
                onChange={(e) =>
                  setFormData({ ...formData, contentRating: e.target.value as ContentRating })
                }
                className="input-base"
                required
              >
                <option value="all">All ages</option>
                <option value="13">13+</option>
                <option value="16">16+</option>
                <option value="18">18+</option>
              </select>
            </div>
            <Input
              label="Weekly view count"
              type="number"
              min={0}
              value={formData.weeklyViewCount}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  weeklyViewCount: Math.max(0, parseInt(e.target.value, 10) || 0),
                })
              }
            />
            <div className="space-y-3 rounded-lg border border-line p-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={`${fieldPrefix}Spotlight`}
                  checked={formData.spotlight}
                  disabled={
                    !formData.spotlight &&
                    !canFlagSpotlight(webtoons, spotlightExcludeId, formData.status)
                  }
                  onChange={(e) => {
                    const next = e.target.checked;
                    if (next && !canFlagSpotlight(webtoons, spotlightExcludeId, formData.status)) {
                      setFormError(`Spotlight is limited to ${SPOTLIGHT_CAP} non-draft titles.`);
                      return;
                    }
                    setFormError('');
                    setFormData({ ...formData, spotlight: next });
                  }}
                  className="h-4 w-4 rounded border-line-strong text-primary-600 focus:ring-primary-500"
                />
                <label htmlFor={`${fieldPrefix}Spotlight`} className="text-sm text-fg-secondary">
                  Spotlight (Hero, max {SPOTLIGHT_CAP})
                </label>
              </div>
              {flaggedSpotlightCount(webtoons, spotlightExcludeId) >= SPOTLIGHT_CAP &&
              !formData.spotlight ? (
                <p className="text-xs text-fg-muted">
                  {SPOTLIGHT_CAP} non-draft titles are already flagged. Turn one off before adding
                  another.
                </p>
              ) : null}
              {formData.spotlight ? (
                <div>
                  <label
                    htmlFor={`${fieldPrefix}-spotlight-order`}
                    className="mb-1.5 block text-sm font-medium text-fg-secondary"
                  >
                    Spotlight order
                  </label>
                  <select
                    id={`${fieldPrefix}-spotlight-order`}
                    value={formData.spotlightOrder}
                    onChange={(e) =>
                      setFormData({ ...formData, spotlightOrder: Number(e.target.value) })
                    }
                    className="input-base"
                  >
                    {SPOTLIGHT_ORDERS.map((order) => {
                      const taken = isSpotlightOrderTaken(webtoons, order, spotlightExcludeId);
                      return (
                        <option key={order} value={order} disabled={taken}>
                          {order}
                          {taken ? ' (taken)' : ''}
                        </option>
                      );
                    })}
                  </select>
                </div>
              ) : null}
            </div>
            {formError ? <p className="text-sm text-red-600">{formError}</p> : null}
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="secondary" onClick={() => navigate('/webtoons')}>
                Cancel
              </Button>
              <Button type="submit" disabled={!formData.titleEn || !formData.author}>
                {isEdit ? 'Save Changes' : 'Add Webtoon'}
              </Button>
            </div>
          </form>
        </Card>
      </div>

      <MediaPicker
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={handleCoverSelect}
        accept="image"
      />
    </>
  );
};

export default WebtoonEditorPage;
