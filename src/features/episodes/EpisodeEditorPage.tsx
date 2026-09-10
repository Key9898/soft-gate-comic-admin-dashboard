import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Image as ImageIcon, Upload, X } from 'lucide-react';
import { Button, Card, Input, PageSEO } from '../../components';
import MediaPicker from '../../components/MediaPicker/MediaPicker';
import type { MediaFile } from '../../components/MediaPicker/MediaPicker';
import { useAuth } from '@/features/auth/useAuth';
import { useStaffAccess } from '@/lib/auth/staffAccess';
import { appendActivityLog } from '@/lib/activityLog';
import { useData } from '@/lib/DataContext';
import type { Episode } from '../../types';
import EpisodesPageSkeleton from './components/EpisodesPageSkeleton';
import { measureImageSize, toImageSizes } from '@/lib/episodeImages';
import {
  isoToYangonDateTimeLocal,
  nowIso,
  stampIso,
  yangonDateTimeLocalToIso,
} from '@/lib/yangonDate';
import { apiMessage, isMockApi } from '@/lib/api/http';
import { createEpisode, updateEpisode } from '@/lib/api/catalog';
import { MediaUploadError } from '@/lib/mediaUpload';
import { isDurableEpisodeImageUrl, persistEpisodePageFile } from '@/lib/episodePageUpload';

type EpisodeImage = {
  id: string;
  url: string;
  order: number;
  width?: number;
  height?: number;
};

type PendingUpload = {
  id: string;
  name: string;
  previewUrl: string;
};

const emptyForm = {
  titleEn: '',
  titleMm: '',
  descriptionEn: '',
  descriptionMm: '',
  webtoonId: '',
  isPremium: false,
  coinPrice: 0,
  status: 'draft' as Episode['status'],
  images: [] as EpisodeImage[],
  scheduledAt: '',
  freeAt: '',
};

const imagesFromEpisode = (episode: Episode): EpisodeImage[] =>
  episode.images.map((url, index) => {
    const size = episode.imageSizes?.[index];
    return {
      id: `${episode.id}-${index}`,
      url,
      order: index + 1,
      ...(size ? { width: size.width, height: size.height } : {}),
    };
  });

const EpisodeEditorPage = () => {
  const { episodeId } = useParams<{ episodeId: string }>();
  const isEdit = Boolean(episodeId);
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { canWriteCatalog } = useStaffAccess();
  const {
    episodes,
    setEpisodes,
    webtoons,
    setMediaFiles,
    setActivityLogs,
    isLoading,
    reloadCatalog,
  } = useData();

  const [formData, setFormData] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [pendingUploads, setPendingUploads] = useState<PendingUpload[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [hydratedId, setHydratedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!canWriteCatalog) {
      navigate('/episodes', { replace: true });
    }
  }, [authLoading, canWriteCatalog, navigate]);

  const selectedEpisode = useMemo(
    () => (episodeId ? (episodes.find((episode) => episode.id === episodeId) ?? null) : null),
    [episodeId, episodes],
  );

  useEffect(() => {
    if (!isEdit || !selectedEpisode || hydratedId === selectedEpisode.id) return;
    setFormData({
      titleEn: selectedEpisode.title.en,
      titleMm: selectedEpisode.title.mm,
      descriptionEn: selectedEpisode.description?.en || '',
      descriptionMm: selectedEpisode.description?.mm || '',
      webtoonId: selectedEpisode.webtoonId,
      isPremium: selectedEpisode.isPremium,
      coinPrice: selectedEpisode.coinPrice,
      status: selectedEpisode.status,
      images: imagesFromEpisode(selectedEpisode),
      scheduledAt: selectedEpisode.scheduledAt
        ? isoToYangonDateTimeLocal(selectedEpisode.scheduledAt)
        : '',
      freeAt: selectedEpisode.freeAt ? isoToYangonDateTimeLocal(selectedEpisode.freeAt) : '',
    });
    setHydratedId(selectedEpisode.id);
    setFormError('');
    setUploadError('');
  }, [hydratedId, isEdit, selectedEpisode]);

  const hasBlobImages = formData.images.some((image) => !isDurableEpisodeImageUrl(image.url));
  const isUploading = pendingUploads.length > 0;

  const episodeScheduleFields = () => ({
    scheduledAt:
      formData.status === 'scheduled' && formData.scheduledAt
        ? yangonDateTimeLocalToIso(formData.scheduledAt)
        : undefined,
    freeAt:
      formData.isPremium && formData.freeAt ? yangonDateTimeLocalToIso(formData.freeAt) : undefined,
  });

  const episodeWriteBody = (includeWebtoonId: boolean) => {
    const schedule = episodeScheduleFields();
    return {
      title: { en: formData.titleEn, mm: formData.titleMm },
      description:
        formData.descriptionEn || formData.descriptionMm
          ? { en: formData.descriptionEn, mm: formData.descriptionMm }
          : undefined,
      ...(includeWebtoonId ? { webtoonId: formData.webtoonId } : {}),
      images: formData.images.map((img) => img.url),
      imageSizes: toImageSizes(formData.images),
      isPremium: formData.isPremium,
      coinPrice: formData.isPremium ? formData.coinPrice : 0,
      status: formData.status,
      ...schedule,
    };
  };

  const handleLibrarySelect = async (files: MediaFile[]) => {
    const imageFiles = files.filter((file) => file.type === 'image');
    if (!imageFiles.length) {
      setIsMediaPickerOpen(false);
      return;
    }
    const measured = await Promise.all(
      imageFiles.map(async (file) => {
        const size = await measureImageSize(file.url);
        return {
          id: file.id,
          url: file.url,
          order: 0,
          ...(size ?? {}),
        };
      }),
    );
    setFormData((prev) => ({
      ...prev,
      images: [
        ...prev.images,
        ...measured.map((img, index) => ({ ...img, order: prev.images.length + index + 1 })),
      ],
    }));
    setIsMediaPickerOpen(false);
  };

  const removeImage = (imageId: string) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images
        .filter((img) => img.id !== imageId)
        .map((img, index) => ({ ...img, order: index + 1 })),
    }));
  };

  const moveImage = (imageId: string, direction: 'up' | 'down') => {
    setFormData((prev) => {
      const currentIndex = prev.images.findIndex((img) => img.id === imageId);
      if (currentIndex < 0) return prev;
      if (
        (direction === 'up' && currentIndex === 0) ||
        (direction === 'down' && currentIndex === prev.images.length - 1)
      ) {
        return prev;
      }
      const next = [...prev.images];
      const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      [next[currentIndex], next[targetIndex]] = [next[targetIndex], next[currentIndex]];
      return { ...prev, images: next.map((img, index) => ({ ...img, order: index + 1 })) };
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files ? Array.from(e.target.files) : [];
    e.target.value = '';
    if (!picked.length || !canWriteCatalog) return;

    setUploadError('');
    const failures: string[] = [];

    for (const file of picked) {
      const pendingId =
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? crypto.randomUUID()
          : Math.random().toString(36).slice(2, 11);
      const previewUrl = URL.createObjectURL(file);
      setPendingUploads((prev) => [...prev, { id: pendingId, name: file.name, previewUrl }]);
      try {
        const media = await persistEpisodePageFile(file);
        const size = await measureImageSize(media.url);
        setMediaFiles((prev) => [media, ...prev]);
        setFormData((prev) => ({
          ...prev,
          images: [
            ...prev.images,
            {
              id: media.id,
              url: media.url,
              order: prev.images.length + 1,
              ...(size ?? {}),
            },
          ],
        }));
      } catch (err) {
        failures.push(
          `${file.name}: ${err instanceof MediaUploadError ? err.message : apiMessage(err, 'Upload failed')}`,
        );
      } finally {
        URL.revokeObjectURL(previewUrl);
        setPendingUploads((prev) => prev.filter((item) => item.id !== pendingId));
      }
    }

    if (failures.length) {
      setUploadError(failures.join(' '));
    }
  };

  const handleSave = async () => {
    if (!canWriteCatalog) return;
    if (formData.images.some((image) => !isDurableEpisodeImageUrl(image.url))) {
      setFormError('Replace blob page images before saving. Upload JPEG or PNG through Media.');
      return;
    }

    setIsSaving(true);
    setFormError('');

    if (!isMockApi()) {
      try {
        if (isEdit && selectedEpisode) {
          await updateEpisode(selectedEpisode.id, episodeWriteBody(false));
          await reloadCatalog();
          appendActivityLog(setActivityLogs, {
            action: 'update',
            targetType: 'episode',
            targetId: selectedEpisode.id,
            targetName: formData.titleEn,
            admin: user,
          });
        } else {
          const { episode } = await createEpisode(episodeWriteBody(true));
          await reloadCatalog();
          appendActivityLog(setActivityLogs, {
            action: 'create',
            targetType: 'episode',
            targetId: episode.id,
            targetName: episode.title,
            admin: user,
          });
        }
        navigate('/episodes');
      } catch (err) {
        setFormError(apiMessage(err, 'Could not save episode'));
      } finally {
        setIsSaving(false);
      }
      return;
    }

    const webtoon = webtoons.find((w) => w.id === formData.webtoonId);
    const now = nowIso();
    const imageSizes = toImageSizes(formData.images);

    if (isEdit && selectedEpisode) {
      setEpisodes((prev) =>
        prev.map((episode) => {
          if (episode.id !== selectedEpisode.id) return episode;
          const next: Episode = {
            ...episode,
            title: { en: formData.titleEn, mm: formData.titleMm },
            description:
              formData.descriptionEn || formData.descriptionMm
                ? { en: formData.descriptionEn, mm: formData.descriptionMm }
                : undefined,
            images: formData.images.map((img) => img.url),
            isPremium: formData.isPremium,
            coinPrice: formData.isPremium ? formData.coinPrice : 0,
            status: formData.status,
            updatedAt: now,
            ...episodeScheduleFields(),
          };
          if (imageSizes) next.imageSizes = imageSizes;
          else delete next.imageSizes;
          return next;
        }),
      );
      appendActivityLog(setActivityLogs, {
        action: 'update',
        targetType: 'episode',
        targetId: selectedEpisode.id,
        targetName: formData.titleEn,
        admin: user,
      });
    } else {
      const newEpisode: Episode = {
        id: `${Date.now()}`,
        webtoonId: formData.webtoonId,
        webtoonTitle: webtoon?.title || { en: '', mm: '' },
        title: { en: formData.titleEn, mm: formData.titleMm },
        description:
          formData.descriptionEn || formData.descriptionMm
            ? { en: formData.descriptionEn, mm: formData.descriptionMm }
            : undefined,
        images: formData.images.map((img) => img.url),
        ...(imageSizes ? { imageSizes } : {}),
        isPremium: formData.isPremium,
        coinPrice: formData.isPremium ? formData.coinPrice : 0,
        viewCount: 0,
        likeCount: 0,
        episodeNumber: episodes.filter((e) => e.webtoonId === formData.webtoonId).length + 1,
        status: formData.status,
        createdAt: stampIso(),
        updatedAt: now,
        ...episodeScheduleFields(),
      };
      setEpisodes((prev) => [newEpisode, ...prev]);
      appendActivityLog(setActivityLogs, {
        action: 'create',
        targetType: 'episode',
        targetId: newEpisode.id,
        targetName: newEpisode.title,
        admin: user,
      });
    }

    setIsSaving(false);
    navigate('/episodes');
  };

  if (authLoading || isLoading) {
    return (
      <>
        <PageSEO.Episodes />
        <EpisodesPageSkeleton />
      </>
    );
  }

  if (!canWriteCatalog) return null;

  if (isEdit && !selectedEpisode) {
    return (
      <>
        <PageSEO.Episodes />
        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-fg">Episode not found</h1>
          <p className="text-fg-muted">That episode is not on this desk.</p>
          <Link to="/episodes" className="text-sm font-medium text-primary-600 hover:underline">
            Back to Episodes
          </Link>
        </div>
      </>
    );
  }

  const fieldPrefix = isEdit ? 'edit' : 'add';

  return (
    <>
      <PageSEO.Episodes />
      <div className="space-y-6">
        <div>
          <Link to="/episodes" className="text-sm font-medium text-primary-600 hover:underline">
            Back to Episodes
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-fg">
            {isEdit ? 'Edit Episode' : 'Add Episode'}
          </h1>
          <p className="mt-1 text-fg-muted">
            JPEG or PNG pages go through Media. Order is the reader scroll.
          </p>
        </div>

        <Card>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void handleSave();
            }}
            className="space-y-4"
          >
            {!isEdit && (
              <div>
                <label
                  htmlFor={`${fieldPrefix}-webtoon`}
                  className="mb-1.5 block text-sm font-medium text-fg-secondary"
                >
                  Webtoon
                </label>
                <select
                  id={`${fieldPrefix}-webtoon`}
                  value={formData.webtoonId}
                  onChange={(e) => setFormData({ ...formData, webtoonId: e.target.value })}
                  className="input-base"
                  required
                >
                  <option value="">Select webtoon</option>
                  {webtoons
                    .filter((w) => w.status !== 'draft')
                    .map((webtoon) => (
                      <option key={webtoon.id} value={webtoon.id}>
                        {webtoon.title.en}
                      </option>
                    ))}
                </select>
              </div>
            )}
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
                rows={2}
                className="input-base"
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
                rows={2}
                className="input-base"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-fg-secondary">
                Episode pages
              </label>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    <Upload className="mr-1 h-4 w-4" />
                    Upload JPEG/PNG
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsMediaPickerOpen(true)}
                  >
                    <ImageIcon className="mr-1 h-4 w-4" />
                    From Media
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,.jpg,.jpeg,.png"
                    multiple
                    aria-label="Upload episode images"
                    onChange={(e) => void handleFileUpload(e)}
                    className="hidden"
                  />
                </div>
                <p className="text-xs text-fg-muted">
                  Multi-select JPEG or PNG. Each file is 2MB or smaller and saves through Media.
                </p>

                {pendingUploads.length > 0 && (
                  <p className="text-xs text-fg-muted">
                    Uploading {pendingUploads.length}{' '}
                    {pendingUploads.length === 1 ? 'file' : 'files'}…
                  </p>
                )}

                {formData.images.length > 0 && (
                  <div className="rounded-lg border border-line p-3">
                    <p className="mb-2 text-xs text-fg-muted">{formData.images.length} pages</p>
                    <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                      {formData.images.map((image, index) => (
                        <div
                          key={image.id}
                          className="group relative aspect-[3/4] overflow-hidden rounded border border-line"
                        >
                          <img
                            src={image.url}
                            alt={`Page ${index + 1}`}
                            className="h-full w-full object-cover"
                          />
                          <div className="absolute inset-0 flex items-center justify-center gap-1 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                            <button
                              type="button"
                              onClick={() => moveImage(image.id, 'up')}
                              className="rounded bg-white p-1 text-xs"
                              disabled={index === 0}
                              aria-label={`Move page ${index + 1} up`}
                            >
                              ↑
                            </button>
                            <button
                              type="button"
                              onClick={() => moveImage(image.id, 'down')}
                              className="rounded bg-white p-1 text-xs"
                              disabled={index === formData.images.length - 1}
                              aria-label={`Move page ${index + 1} down`}
                            >
                              ↓
                            </button>
                            <button
                              type="button"
                              title="Remove image"
                              aria-label={`Remove page ${index + 1}`}
                              onClick={() => removeImage(image.id)}
                              className="rounded bg-red-500 p-1 text-xs text-white"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                          <span className="absolute bottom-1 left-1 rounded bg-black/70 px-1 text-xs text-white">
                            {index + 1}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
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
                    setFormData({ ...formData, status: e.target.value as Episode['status'] })
                  }
                  className="input-base"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="scheduled">Scheduled</option>
                </select>
              </div>
              {formData.status === 'scheduled' && (
                <div>
                  <label
                    htmlFor={`${fieldPrefix}-scheduled`}
                    className="mb-1.5 block text-sm font-medium text-fg-secondary"
                  >
                    Schedule Date
                  </label>
                  <input
                    id={`${fieldPrefix}-scheduled`}
                    type="datetime-local"
                    value={formData.scheduledAt}
                    onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                    className="input-base"
                    required
                  />
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id={`${fieldPrefix}EpisodeIsPremium`}
                checked={formData.isPremium}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    isPremium: e.target.checked,
                    coinPrice: e.target.checked ? formData.coinPrice || 5 : 0,
                    freeAt: e.target.checked ? formData.freeAt : '',
                  })
                }
                className="h-4 w-4 rounded border-line-strong text-primary-600 focus:ring-primary-500"
              />
              <label
                htmlFor={`${fieldPrefix}EpisodeIsPremium`}
                className="text-sm text-fg-secondary"
              >
                Premium Content
              </label>
            </div>
            {formData.isPremium && (
              <>
                <Input
                  label="Coin Price"
                  type="number"
                  min={1}
                  value={formData.coinPrice}
                  onChange={(e) =>
                    setFormData({ ...formData, coinPrice: parseInt(e.target.value) || 0 })
                  }
                />
                <div>
                  <label
                    htmlFor={`${fieldPrefix}-free-at`}
                    className="mb-1.5 block text-sm font-medium text-fg-secondary"
                  >
                    Free at (optional, Yangon)
                  </label>
                  <input
                    id={`${fieldPrefix}-free-at`}
                    type="datetime-local"
                    value={formData.freeAt}
                    onChange={(e) => setFormData({ ...formData, freeAt: e.target.value })}
                    className="input-base"
                  />
                  <p className="mt-1 text-xs text-fg-muted">
                    After this time the episode is free. Leave blank for coins-only.
                  </p>
                </div>
              </>
            )}
            {uploadError ? <p className="text-sm text-red-600">{uploadError}</p> : null}
            {hasBlobImages ? (
              <p className="text-sm text-red-600">
                This episode still has blob page URLs. Remove or replace them before saving.
              </p>
            ) : null}
            {formError ? <p className="text-sm text-red-600">{formError}</p> : null}
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="secondary" onClick={() => navigate('/episodes')}>
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={isSaving}
                disabled={
                  isUploading ||
                  hasBlobImages ||
                  !formData.titleEn ||
                  (!isEdit && !formData.webtoonId) ||
                  (formData.status === 'scheduled' && !formData.scheduledAt)
                }
              >
                {isEdit ? 'Save Changes' : 'Add Episode'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
      <MediaPicker
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={(files) => {
          void handleLibrarySelect(files);
        }}
        accept="image"
        multiple
      />
    </>
  );
};

export default EpisodeEditorPage;
