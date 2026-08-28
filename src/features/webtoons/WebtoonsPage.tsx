import { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Star,
  Image as ImageIcon,
  X,
} from 'lucide-react';
import {
  Card,
  Button,
  Input,
  Modal,
  PageSEO,
  NoWebtoons,
  NoSearchResults,
  coverSheenClass,
} from '../../components';
import MediaPicker from '../../components/MediaPicker/MediaPicker';
import type { MediaFile } from '../../components/MediaPicker/MediaPicker';
import { useAuth } from '@/features/auth/useAuth';
import { useStaffAccess } from '@/lib/auth/staffAccess';
import { appendActivityLog } from '@/lib/activityLog';
import { useData } from '@/lib/DataContext';
import type { ContentRating, Webtoon } from '../../types';
import { markIdLoaded } from '@/lib/imageLoaded';
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
import {
  canonicalizeWebtoonGenres,
  genresForPicker,
  resolveGenreLabelEn,
  syncGenreWebtoonCounts,
} from '@/lib/genres';
import { apiMessage, isMockApi } from '@/lib/api/http';
import { createWebtoon, deleteWebtoon, updateWebtoon } from '@/lib/api/catalog';

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

const WebtoonsPage = () => {
  const { user } = useAuth();
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
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loadedCovers, setLoadedCovers] = useState<Set<string>>(() => new Set());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedWebtoon, setSelectedWebtoon] = useState<Webtoon | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [formError, setFormError] = useState('');
  const [deleteError, setDeleteError] = useState('');

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

  const [formData, setFormData] = useState(emptyForm);

  const filteredWebtoons = webtoons.filter((webtoon) => {
    const matchesSearch = webtoon.title.en.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || webtoon.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const getStatusBadge = (status: Webtoon['status']) => {
    const styles = {
      ongoing: 'badge-success',
      completed: 'badge-info',
      hiatus: 'badge-warning',
      draft: 'bg-gray-100 text-fg',
    };
    return styles[status];
  };

  const handleCoverSelect = (files: MediaFile[]) => {
    if (files.length > 0) {
      setFormData({ ...formData, coverImage: files[0].url });
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
    setFormData({ ...formData, tags: formData.tags.filter((t) => t !== tag) });
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(tagInput);
    }
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

  const handleAddWebtoon = async () => {
    if (!canWriteCatalog) return;
    if (formData.spotlight) {
      if (!canFlagSpotlight(webtoons, undefined, formData.status)) {
        setFormError(`Spotlight is limited to ${SPOTLIGHT_CAP} non-draft titles.`);
        return;
      }
      if (isSpotlightOrderTaken(webtoons, formData.spotlightOrder)) {
        setFormError(`Spotlight order ${formData.spotlightOrder} is already in use.`);
        return;
      }
    }
    if (!isMockApi()) {
      try {
        const { webtoon } = await createWebtoon(webtoonWriteBody());
        await reloadCatalog();
        appendActivityLog(setActivityLogs, {
          action: 'create',
          targetType: 'webtoon',
          targetId: webtoon.id,
          targetName: webtoon.title,
          admin: user,
        });
        setIsAddModalOpen(false);
        resetForm();
      } catch (err) {
        setFormError(apiMessage(err, 'Could not save webtoon'));
      }
      return;
    }
    const now = nowIso();
    const newWebtoon: Webtoon = {
      id: `${Date.now()}`,
      title: { en: formData.titleEn, mm: formData.titleMm },
      description: { en: formData.descriptionEn, mm: formData.descriptionMm },
      coverImage: formData.coverImage || undefined,
      coverColor: formData.coverImage ? '' : 'bg-gradient-to-br from-gray-400 to-gray-600',
      author: authors.find((a) => a.id === formData.author) || authors[0],
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
    setWebtoons([newWebtoon, ...webtoons]);
    setAuthors(syncAuthorWebtoonCounts(authors, [newWebtoon, ...webtoons]));
    setGenres(syncGenreWebtoonCounts(genres, [newWebtoon, ...webtoons]));
    appendActivityLog(setActivityLogs, {
      action: 'create',
      targetType: 'webtoon',
      targetId: newWebtoon.id,
      targetName: newWebtoon.title,
      admin: user,
    });
    setIsAddModalOpen(false);
    resetForm();
  };

  const handleEditWebtoon = async () => {
    if (!canWriteCatalog || !selectedWebtoon) return;
    if (formData.spotlight) {
      if (!canFlagSpotlight(webtoons, selectedWebtoon.id, formData.status)) {
        setFormError(`Spotlight is limited to ${SPOTLIGHT_CAP} non-draft titles.`);
        return;
      }
      if (isSpotlightOrderTaken(webtoons, formData.spotlightOrder, selectedWebtoon.id)) {
        setFormError(`Spotlight order ${formData.spotlightOrder} is already in use.`);
        return;
      }
    }
    if (!isMockApi()) {
      try {
        await updateWebtoon(selectedWebtoon.id, webtoonWriteBody());
        await reloadCatalog();
        appendActivityLog(setActivityLogs, {
          action: 'update',
          targetType: 'webtoon',
          targetId: selectedWebtoon.id,
          targetName: { en: formData.titleEn, mm: formData.titleMm },
          admin: user,
        });
        setIsEditModalOpen(false);
        resetForm();
      } catch (err) {
        setFormError(apiMessage(err, 'Could not save webtoon'));
      }
      return;
    }
    const nextWebtoons = webtoons.map((w) =>
      w.id === selectedWebtoon.id
        ? {
            ...w,
            title: { en: formData.titleEn, mm: formData.titleMm },
            description: { en: formData.descriptionEn, mm: formData.descriptionMm },
            coverImage: formData.coverImage || undefined,
            coverColor: formData.coverImage ? '' : w.coverColor,
            author: authors.find((a) => a.id === formData.author) || w.author,
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
        : w,
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
    setIsEditModalOpen(false);
    resetForm();
  };

  const handleDeleteWebtoon = async () => {
    if (!canWriteCatalog || !selectedWebtoon) return;
    if (!isMockApi()) {
      try {
        await deleteWebtoon(selectedWebtoon.id);
        await reloadCatalog();
        appendActivityLog(setActivityLogs, {
          action: 'delete',
          targetType: 'webtoon',
          targetId: selectedWebtoon.id,
          targetName: selectedWebtoon.title,
          admin: user,
        });
        setIsDeleteModalOpen(false);
        setSelectedWebtoon(null);
        setDeleteError('');
      } catch (err) {
        setDeleteError(apiMessage(err, 'Could not delete webtoon'));
      }
      return;
    }
    const nextWebtoons = webtoons.filter((w) => w.id !== selectedWebtoon.id);
    setWebtoons(nextWebtoons);
    setAuthors(syncAuthorWebtoonCounts(authors, nextWebtoons));
    setGenres(syncGenreWebtoonCounts(genres, nextWebtoons));
    appendActivityLog(setActivityLogs, {
      action: 'delete',
      targetType: 'webtoon',
      targetId: selectedWebtoon.id,
      targetName: selectedWebtoon.title,
      admin: user,
    });
    setIsDeleteModalOpen(false);
    setSelectedWebtoon(null);
  };

  const openEditModal = (webtoon: Webtoon) => {
    setSelectedWebtoon(webtoon);
    setFormData({
      titleEn: webtoon.title.en,
      titleMm: webtoon.title.mm,
      descriptionEn: webtoon.description.en,
      descriptionMm: webtoon.description.mm,
      author: webtoon.author.id,
      genres: canonicalizeWebtoonGenres(webtoon.genres, genres),
      tags: webtoon.tags || [],
      coverImage: webtoon.coverImage || '',
      status: webtoon.status,
      isPremium: webtoon.isPremium,
      contentRating: webtoon.contentRating ?? 'all',
      weeklyViewCount: webtoon.weeklyViewCount ?? 0,
      spotlight: Boolean(webtoon.spotlight),
      spotlightOrder: webtoon.spotlightOrder ?? 1,
    });
    setFormError('');
    setIsEditModalOpen(true);
    setOpenMenuId(null);
  };

  const openDeleteModal = (webtoon: Webtoon) => {
    setSelectedWebtoon(webtoon);
    setDeleteError('');
    setIsDeleteModalOpen(true);
    setOpenMenuId(null);
  };

  const resetForm = () => {
    setFormData({
      ...emptyForm,
      genres: [],
      tags: [],
    });
    setSelectedWebtoon(null);
    setTagInput('');
    setFormError('');
  };

  const toggleGenre = (genre: string) => {
    setFormData((prev) => ({
      ...prev,
      genres: prev.genres.includes(genre)
        ? prev.genres.filter((g) => g !== genre)
        : [...prev.genres, genre],
    }));
  };

  const WebtoonForm = ({ isEdit = false }: { isEdit?: boolean }) => (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (isEdit) {
          void handleEditWebtoon();
        } else {
          void handleAddWebtoon();
        }
      }}
      className="space-y-4"
    >
      <div>
        <label className="mb-1.5 block text-sm font-medium text-fg-secondary">Cover Image</label>
        <div className="flex items-start gap-4">
          <div
            className="flex h-32 w-24 cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-line-strong bg-gray-50 transition-colors hover:border-primary-400"
            onClick={() => setIsMediaPickerOpen(true)}
          >
            {formData.coverImage ? (
              <img src={formData.coverImage} alt="Cover" className="h-full w-full object-cover" />
            ) : (
              <div className="p-2 text-center">
                <ImageIcon className="mx-auto h-8 w-8 text-fg-muted" />
                <p className="mt-1 text-xs text-fg-muted">Click to upload</p>
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
            {formData.coverImage && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="ml-2"
                onClick={() => setFormData({ ...formData, coverImage: '' })}
              >
                Remove
              </Button>
            )}
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
          htmlFor={`${isEdit ? 'edit' : 'add'}-description-en`}
          className="mb-1.5 block text-sm font-medium text-fg-secondary"
        >
          Description (EN)
        </label>
        <textarea
          id={`${isEdit ? 'edit' : 'add'}-description-en`}
          value={formData.descriptionEn}
          onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
          rows={3}
          className="input-base"
          required
        />
      </div>
      <div>
        <label
          htmlFor={`${isEdit ? 'edit' : 'add'}-description-mm`}
          className="mb-1.5 block text-sm font-medium text-fg-secondary"
        >
          Description (MM)
        </label>
        <textarea
          id={`${isEdit ? 'edit' : 'add'}-description-mm`}
          value={formData.descriptionMm}
          onChange={(e) => setFormData({ ...formData, descriptionMm: e.target.value })}
          rows={3}
          className="input-base"
        />
      </div>
      <div>
        <label
          htmlFor={`${isEdit ? 'edit' : 'add'}-author`}
          className="mb-1.5 block text-sm font-medium text-fg-secondary"
        >
          Author
        </label>
        <select
          id={`${isEdit ? 'edit' : 'add'}-author`}
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
              .filter((t) => !formData.tags.includes(t))
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
          htmlFor={`${isEdit ? 'edit' : 'add'}-status`}
          className="mb-1.5 block text-sm font-medium text-fg-secondary"
        >
          Status
        </label>
        <select
          id={`${isEdit ? 'edit' : 'add'}-status`}
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
          id={`${isEdit ? 'edit' : 'add'}IsPremium`}
          checked={formData.isPremium}
          onChange={(e) => setFormData({ ...formData, isPremium: e.target.checked })}
          className="h-4 w-4 rounded border-line-strong text-primary-600 focus:ring-primary-500"
        />
        <label
          htmlFor={`${isEdit ? 'edit' : 'add'}IsPremium`}
          className="text-sm text-fg-secondary"
        >
          Premium Content
        </label>
      </div>
      <div>
        <label
          htmlFor={`${isEdit ? 'edit' : 'add'}-content-rating`}
          className="mb-1.5 block text-sm font-medium text-fg-secondary"
        >
          Content rating
        </label>
        <select
          id={`${isEdit ? 'edit' : 'add'}-content-rating`}
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
            id={`${isEdit ? 'edit' : 'add'}Spotlight`}
            checked={formData.spotlight}
            disabled={
              !formData.spotlight &&
              !canFlagSpotlight(webtoons, selectedWebtoon?.id, formData.status)
            }
            onChange={(e) => {
              const next = e.target.checked;
              if (next && !canFlagSpotlight(webtoons, selectedWebtoon?.id, formData.status)) {
                setFormError(`Spotlight is limited to ${SPOTLIGHT_CAP} non-draft titles.`);
                return;
              }
              setFormError('');
              setFormData({ ...formData, spotlight: next });
            }}
            className="h-4 w-4 rounded border-line-strong text-primary-600 focus:ring-primary-500"
          />
          <label
            htmlFor={`${isEdit ? 'edit' : 'add'}Spotlight`}
            className="text-sm text-fg-secondary"
          >
            Spotlight (Hero, max {SPOTLIGHT_CAP})
          </label>
        </div>
        {flaggedSpotlightCount(webtoons, selectedWebtoon?.id) >= SPOTLIGHT_CAP &&
          !formData.spotlight && (
            <p className="text-xs text-fg-muted">
              {SPOTLIGHT_CAP} non-draft titles are already flagged. Turn one off before adding
              another.
            </p>
          )}
        {formData.spotlight && (
          <div>
            <label
              htmlFor={`${isEdit ? 'edit' : 'add'}-spotlight-order`}
              className="mb-1.5 block text-sm font-medium text-fg-secondary"
            >
              Spotlight order
            </label>
            <select
              id={`${isEdit ? 'edit' : 'add'}-spotlight-order`}
              value={formData.spotlightOrder}
              onChange={(e) => setFormData({ ...formData, spotlightOrder: Number(e.target.value) })}
              className="input-base"
            >
              {SPOTLIGHT_ORDERS.map((order) => {
                const taken = isSpotlightOrderTaken(webtoons, order, selectedWebtoon?.id);
                return (
                  <option key={order} value={order} disabled={taken}>
                    {order}
                    {taken ? ' (taken)' : ''}
                  </option>
                );
              })}
            </select>
          </div>
        )}
      </div>
      {formError && <p className="text-sm text-red-600">{formError}</p>}
      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            if (isEdit) {
              setIsEditModalOpen(false);
            } else {
              setIsAddModalOpen(false);
            }
            resetForm();
          }}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={!formData.titleEn || !formData.author}>
          {isEdit ? 'Save Changes' : 'Add Webtoon'}
        </Button>
      </div>
    </form>
  );

  return (
    <>
      <PageSEO.Webtoons />
      {isLoading ? (
        <WebtoonsPageSkeleton />
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-fg">Webtoons</h1>
              <p className="mt-1 text-fg-muted">Manage your webtoon collection</p>
            </div>
            {canWriteCatalog ? (
              <Button
                leftIcon={<Plus className="h-4 w-4" />}
                onClick={() => setIsAddModalOpen(true)}
              >
                Add Webtoon
              </Button>
            ) : null}
          </div>

          <Card>
            <div className="mb-6 flex flex-col gap-4 sm:flex-row">
              <div className="flex-1">
                <Input
                  placeholder="Search webtoons..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  leftIcon={<Search className="h-5 w-5" />}
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-fg-muted" />
                <select
                  aria-label="Filter by status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-lg border border-line-strong px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">All Status</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                  <option value="hiatus">Hiatus</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-line">
                    <th className="table-header">Webtoon</th>
                    <th className="table-header">Author</th>
                    <th className="table-header">Genres</th>
                    <th className="table-header">Tags</th>
                    <th className="table-header">Status</th>
                    <th className="table-header">Views</th>
                    <th className="table-header">Rating</th>
                    <th className="table-header">Episodes</th>
                    <th className="table-header text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {filteredWebtoons.map((webtoon) => (
                    <tr key={webtoon.id} className="hover:bg-gray-50">
                      <td className="table-cell">
                        <div className="flex items-center gap-3">
                          {webtoon.coverImage ? (
                            <div className="relative h-16 w-12 flex-shrink-0">
                              <img
                                src={webtoon.coverImage}
                                alt={webtoon.title.en}
                                className="h-16 w-12 rounded-lg object-cover"
                                onLoad={() => markIdLoaded(setLoadedCovers, webtoon.id)}
                                onError={() => markIdLoaded(setLoadedCovers, webtoon.id)}
                              />
                              {!loadedCovers.has(webtoon.id) && (
                                <span className={coverSheenClass} />
                              )}
                            </div>
                          ) : (
                            <div
                              className={`h-16 w-12 rounded-lg ${webtoon.coverColor} flex-shrink-0`}
                            />
                          )}
                          <div>
                            <p className="font-medium text-fg">{webtoon.title.en}</p>
                            <p className="line-clamp-1 max-w-[200px] text-xs text-fg-muted">
                              {webtoon.description.en}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="table-cell">{webtoon.author.name.en}</td>
                      <td className="table-cell">
                        <div className="flex flex-wrap gap-1">
                          {webtoon.genres.slice(0, 2).map((token) => (
                            <span key={token} className="badge-primary">
                              {resolveGenreLabelEn(token, genres)}
                            </span>
                          ))}
                          {webtoon.genres.length > 2 && (
                            <span className="badge bg-gray-100 text-fg-secondary">
                              +{webtoon.genres.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="flex flex-wrap gap-1">
                          {(webtoon.tags || []).slice(0, 2).map((tag) => (
                            <span key={tag} className="text-xs text-fg-muted">
                              #{tag}
                            </span>
                          ))}
                          {(webtoon.tags || []).length > 2 && (
                            <span className="text-xs text-fg-muted">
                              +{(webtoon.tags || []).length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="table-cell">
                        <span className={getStatusBadge(webtoon.status)}>{webtoon.status}</span>
                      </td>
                      <td className="table-cell">{formatNumber(webtoon.viewCount)}</td>
                      <td className="table-cell">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                          {webtoon.rating.toFixed(1)}
                        </div>
                      </td>
                      <td className="table-cell">{webtoon.episodeCount}</td>
                      <td className="table-cell text-right">
                        <div className="relative inline-block">
                          <button
                            type="button"
                            title="Webtoon actions"
                            aria-label="Webtoon actions menu"
                            onClick={() =>
                              setOpenMenuId(openMenuId === webtoon.id ? null : webtoon.id)
                            }
                            className="rounded-lg p-2 text-fg-muted transition-colors hover:bg-gray-100 hover:text-fg-secondary"
                          >
                            <MoreVertical className="h-5 w-5" />
                          </button>
                          {openMenuId === webtoon.id && (
                            <div className="absolute right-0 z-10 mt-2 w-48 rounded-lg border border-line bg-white py-1 shadow-lg">
                              <button
                                type="button"
                                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-fg-secondary hover:bg-gray-50"
                              >
                                <Eye className="h-4 w-4" />
                                View Details
                              </button>
                              {canWriteCatalog ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => openEditModal(webtoon)}
                                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-fg-secondary hover:bg-gray-50"
                                  >
                                    <Edit className="h-4 w-4" />
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => openDeleteModal(webtoon)}
                                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    Delete
                                  </button>
                                </>
                              ) : null}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {webtoons.length === 0 ? (
              <NoWebtoons onAdd={canWriteCatalog ? () => setIsAddModalOpen(true) : undefined} />
            ) : filteredWebtoons.length === 0 ? (
              <NoSearchResults
                query={searchQuery}
                onClear={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                }}
              />
            ) : null}
          </Card>

          <Modal
            isOpen={isAddModalOpen}
            onClose={() => {
              setIsAddModalOpen(false);
              resetForm();
            }}
            title="Add New Webtoon"
            size="lg"
          >
            <WebtoonForm />
          </Modal>

          <Modal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              resetForm();
            }}
            title="Edit Webtoon"
            size="lg"
          >
            <WebtoonForm isEdit />
          </Modal>

          <Modal
            isOpen={isDeleteModalOpen}
            onClose={() => {
              setIsDeleteModalOpen(false);
              setSelectedWebtoon(null);
            }}
            title="Delete Webtoon"
            size="sm"
          >
            <div className="space-y-4">
              <p className="text-fg-secondary">
                Are you sure you want to delete <strong>{selectedWebtoon?.title.en}</strong>? This
                action cannot be undone.
              </p>
              {deleteError ? <p className="text-sm text-red-600">{deleteError}</p> : null}
              <div className="flex justify-end gap-3">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setSelectedWebtoon(null);
                  }}
                >
                  Cancel
                </Button>
                <Button variant="danger" onClick={() => void handleDeleteWebtoon()}>
                  Delete
                </Button>
              </div>
            </div>
          </Modal>

          <MediaPicker
            isOpen={isMediaPickerOpen}
            onClose={() => setIsMediaPickerOpen(false)}
            onSelect={handleCoverSelect}
            accept="image"
          />
        </div>
      )}
    </>
  );
};

export default WebtoonsPage;
