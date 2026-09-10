import { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, Newspaper, Image as ImageIcon, Trash2, Edit } from 'lucide-react';
import {
  Card,
  Button,
  Input,
  Modal,
  PageSEO,
  EmptyState,
  Toggle,
  LaneStatus,
} from '../../components';
import MediaPicker from '../../components/MediaPicker/MediaPicker';
import type { MediaFile } from '../../components/MediaPicker/MediaPicker';
import { useStaffAccess } from '@/lib/auth/staffAccess';
import { useData } from '@/lib/DataContext';
import { apiMessage, isMockApi } from '@/lib/api/http';
import {
  createPressNews,
  createPressStill,
  deletePressNews,
  deletePressStill,
  getPressMeta,
  listPressNews,
  listPressStills,
  updatePressMeta,
  updatePressNews,
  updatePressStill,
} from '@/lib/api/press';
import { useOpenCreateQuery } from '@/lib/commands';
import {
  DEFAULT_PRESS_META,
  PRESS_COPY_KEYS,
  PRESS_COPY_LABELS,
  PRESS_COPY_TEXTAREA,
  PRESS_FACT_KEYS,
  loadPress,
  nextPressNewsId,
  nextPressStillId,
  persistedMeta,
  persistedNews,
  persistedStill,
  savePress,
  sortNews,
  sortStills,
  type PressAsset,
  type PressCopy,
  type PressFactKey,
  type PressMeta,
  type PressNews,
  type PressPaletteSwatch,
  type PressStill,
} from '@/lib/press';
import PressPageSkeleton from './components/PressPageSkeleton';

type NewsFormState = {
  titleEn: string;
  titleMm: string;
  bodyEn: string;
  bodyMm: string;
  href: string;
  sortOrder: string;
  published: boolean;
  demoBadge: boolean;
};

const emptyNewsForm = (): NewsFormState => ({
  titleEn: '',
  titleMm: '',
  bodyEn: '',
  bodyMm: '',
  href: '',
  sortOrder: '0',
  published: true,
  demoBadge: false,
});

type StillFormState = {
  titleEn: string;
  titleMm: string;
  imageUrl: string;
  sortOrder: string;
  published: boolean;
  demoBadge: boolean;
};

const emptyStillForm = (): StillFormState => ({
  titleEn: '',
  titleMm: '',
  imageUrl: '',
  sortOrder: '0',
  published: true,
  demoBadge: false,
});

type MediaTarget = { kind: 'still' } | { kind: 'asset'; index: number };

const PressPage = () => {
  const { canWriteSettings } = useStaffAccess();
  const { aboutTeamMembers } = useData();
  const [meta, setMeta] = useState<PressMeta>(() => persistedMeta(DEFAULT_PRESS_META));
  const [news, setNews] = useState<PressNews[]>([]);
  const [stills, setStills] = useState<PressStill[]>([]);
  const [loading, setLoading] = useState(() => !isMockApi());
  const [error, setError] = useState<Error | null>(null);
  const [loaded, setLoaded] = useState(() => isMockApi());
  const [metaError, setMetaError] = useState('');
  const [savingMeta, setSavingMeta] = useState(false);
  const [isAddNewsOpen, setIsAddNewsOpen] = useState(false);
  const [isEditNewsOpen, setIsEditNewsOpen] = useState(false);
  const [isDeleteNewsOpen, setIsDeleteNewsOpen] = useState(false);
  const [isAddStillOpen, setIsAddStillOpen] = useState(false);
  const [isEditStillOpen, setIsEditStillOpen] = useState(false);
  const [isDeleteStillOpen, setIsDeleteStillOpen] = useState(false);
  const [selectedNews, setSelectedNews] = useState<PressNews | null>(null);
  const [selectedStill, setSelectedStill] = useState<PressStill | null>(null);
  const [newsForm, setNewsForm] = useState<NewsFormState>(emptyNewsForm);
  const [stillForm, setStillForm] = useState<StillFormState>(emptyStillForm);
  const [formError, setFormError] = useState('');
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [mediaTarget, setMediaTarget] = useState<MediaTarget>({ kind: 'still' });

  const persistMock = useCallback(
    (nextMeta: PressMeta, nextNews: PressNews[], nextStills: PressStill[]) => {
      if (!isMockApi()) return;
      savePress({ meta: nextMeta, news: nextNews, stills: nextStills });
    },
    [],
  );

  const load = useCallback(async () => {
    if (isMockApi()) {
      const snapshot = loadPress();
      setMeta(snapshot.meta);
      setNews(sortNews(snapshot.news));
      setStills(sortStills(snapshot.stills));
      setError(null);
      setLoaded(true);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [metaRes, newsRes, stillsRes] = await Promise.all([
        getPressMeta(),
        listPressNews(),
        listPressStills(),
      ]);
      setMeta(persistedMeta(metaRes.meta));
      setNews(sortNews(newsRes.news.map(persistedNews)));
      setStills(sortStills(stillsRes.stills.map(persistedStill)));
      setError(null);
      setLoaded(true);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Press request failed.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useOpenCreateQuery(() => setIsAddNewsOpen(true), canWriteSettings && !loading);

  const showEmpty = loaded && !error;

  const members = useMemo(
    () =>
      aboutTeamMembers
        .slice()
        .sort((a, b) => a.sortOrder - b.sortOrder || a.id.localeCompare(b.id)),
    [aboutTeamMembers],
  );

  const setCopyField = (key: keyof PressCopy, lang: 'en' | 'mm', value: string) => {
    setMeta((current) => ({
      ...current,
      copy: { ...current.copy, [key]: { ...current.copy[key], [lang]: value } },
    }));
  };

  const setFactField = (
    key: PressFactKey,
    field: 'labelEn' | 'labelMm' | 'valueEn' | 'valueMm' | 'href',
    value: string,
  ) => {
    setMeta((current) => {
      const fact = current.facts[key];
      const nextFact =
        field === 'href'
          ? { ...fact, href: value || undefined }
          : field === 'labelEn'
            ? { ...fact, label: { ...fact.label, en: value } }
            : field === 'labelMm'
              ? { ...fact, label: { ...fact.label, mm: value } }
              : field === 'valueEn'
                ? { ...fact, value: { ...fact.value, en: value } }
                : { ...fact, value: { ...fact.value, mm: value } };
      return { ...current, facts: { ...current.facts, [key]: nextFact } };
    });
  };

  const setPalette = (
    index: number,
    patch: Partial<PressPaletteSwatch> & { labelEn?: string; labelMm?: string },
  ) => {
    setMeta((current) => ({
      ...current,
      palette: current.palette.map((item, i) => {
        if (i !== index) return item;
        return {
          hex: patch.hex ?? item.hex,
          label: {
            en: patch.labelEn ?? item.label.en,
            mm: patch.labelMm ?? item.label.mm,
          },
        };
      }),
    }));
  };

  const setAsset = (
    index: number,
    patch: Partial<PressAsset> & { nameEn?: string; nameMm?: string },
  ) => {
    setMeta((current) => ({
      ...current,
      assets: current.assets.map((item, i) => {
        if (i !== index) return item;
        return {
          name: {
            en: patch.nameEn ?? item.name.en,
            mm: patch.nameMm ?? item.name.mm,
          },
          url: patch.url ?? item.url,
          format: patch.format ?? item.format,
        };
      }),
    }));
  };

  const handleSaveMeta = async () => {
    if (!canWriteSettings) return;
    setSavingMeta(true);
    setMetaError('');
    const stored = persistedMeta(meta);
    if (isMockApi()) {
      persistMock(stored, news, stills);
      setMeta(stored);
      setSavingMeta(false);
      return;
    }
    try {
      const { meta: saved } = await updatePressMeta(stored);
      setMeta(persistedMeta(saved));
    } catch (err) {
      setMetaError(apiMessage(err, 'Could not save Press'));
    } finally {
      setSavingMeta(false);
    }
  };

  const readNews = (id: string): PressNews | null => {
    if (
      !newsForm.titleEn.trim() ||
      !newsForm.titleMm.trim() ||
      !newsForm.bodyEn.trim() ||
      !newsForm.bodyMm.trim()
    ) {
      setFormError('title and body must include en and mm');
      return null;
    }
    const sortOrder = Number.parseInt(newsForm.sortOrder, 10);
    if (!Number.isInteger(sortOrder) || sortOrder < 0) {
      setFormError('sortOrder must be an integer of 0 or more');
      return null;
    }
    if (newsForm.href.startsWith('blob:')) {
      setFormError('href cannot be a blob URL');
      return null;
    }
    return persistedNews({
      id,
      title: { en: newsForm.titleEn.trim(), mm: newsForm.titleMm.trim() },
      body: { en: newsForm.bodyEn.trim(), mm: newsForm.bodyMm.trim() },
      href: newsForm.href.trim() || undefined,
      sortOrder,
      published: newsForm.published,
      demoBadge: newsForm.demoBadge,
    });
  };

  const readStill = (id: string): PressStill | null => {
    if (!stillForm.titleEn.trim() || !stillForm.titleMm.trim() || !stillForm.imageUrl.trim()) {
      setFormError('title and imageUrl are required');
      return null;
    }
    if (stillForm.imageUrl.startsWith('blob:')) {
      setFormError('imageUrl cannot be a blob URL');
      return null;
    }
    const sortOrder = Number.parseInt(stillForm.sortOrder, 10);
    if (!Number.isInteger(sortOrder) || sortOrder < 0) {
      setFormError('sortOrder must be an integer of 0 or more');
      return null;
    }
    return persistedStill({
      id,
      title: { en: stillForm.titleEn.trim(), mm: stillForm.titleMm.trim() },
      imageUrl: stillForm.imageUrl.trim(),
      sortOrder,
      published: stillForm.published,
      demoBadge: stillForm.demoBadge,
    });
  };

  const handleAddNews = async () => {
    if (!canWriteSettings) return;
    const created = readNews(isMockApi() ? nextPressNewsId(news) : 'draft');
    if (!created) return;
    if (isMockApi()) {
      const next = sortNews([...news, created]);
      setNews(next);
      persistMock(meta, next, stills);
      setIsAddNewsOpen(false);
      setNewsForm(emptyNewsForm());
      setFormError('');
      return;
    }
    try {
      const { item } = await createPressNews({
        title: created.title,
        body: created.body,
        href: created.href,
        sortOrder: created.sortOrder,
        published: created.published,
        demoBadge: created.demoBadge,
      });
      setNews((current) => sortNews([...current, persistedNews(item)]));
      setIsAddNewsOpen(false);
      setNewsForm(emptyNewsForm());
      setFormError('');
    } catch (err) {
      setFormError(apiMessage(err, 'Could not save news'));
    }
  };

  const handleEditNews = async () => {
    if (!canWriteSettings || !selectedNews) return;
    const updated = readNews(selectedNews.id);
    if (!updated) return;
    if (isMockApi()) {
      const next = sortNews(news.map((row) => (row.id === updated.id ? updated : row)));
      setNews(next);
      persistMock(meta, next, stills);
      setIsEditNewsOpen(false);
      setSelectedNews(null);
      setFormError('');
      return;
    }
    try {
      const { item } = await updatePressNews(selectedNews.id, {
        title: updated.title,
        body: updated.body,
        href: updated.href ?? '',
        sortOrder: updated.sortOrder,
        published: updated.published,
        demoBadge: updated.demoBadge,
      });
      setNews((current) =>
        sortNews(current.map((row) => (row.id === item.id ? persistedNews(item) : row))),
      );
      setIsEditNewsOpen(false);
      setSelectedNews(null);
      setFormError('');
    } catch (err) {
      setFormError(apiMessage(err, 'Could not save news'));
    }
  };

  const handleDeleteNews = async () => {
    if (!canWriteSettings || !selectedNews) return;
    if (isMockApi()) {
      const next = news.filter((row) => row.id !== selectedNews.id);
      setNews(next);
      persistMock(meta, next, stills);
      setIsDeleteNewsOpen(false);
      setSelectedNews(null);
      return;
    }
    try {
      await deletePressNews(selectedNews.id);
      setNews((current) => current.filter((row) => row.id !== selectedNews.id));
      setIsDeleteNewsOpen(false);
      setSelectedNews(null);
    } catch (err) {
      setFormError(apiMessage(err, 'Could not delete news'));
    }
  };

  const handleAddStill = async () => {
    if (!canWriteSettings) return;
    const created = readStill(isMockApi() ? nextPressStillId(stills) : 'draft');
    if (!created) return;
    if (isMockApi()) {
      const next = sortStills([...stills, created]);
      setStills(next);
      persistMock(meta, news, next);
      setIsAddStillOpen(false);
      setStillForm(emptyStillForm());
      setFormError('');
      return;
    }
    try {
      const { item } = await createPressStill({
        title: created.title,
        imageUrl: created.imageUrl,
        sortOrder: created.sortOrder,
        published: created.published,
        demoBadge: created.demoBadge,
      });
      setStills((current) => sortStills([...current, persistedStill(item)]));
      setIsAddStillOpen(false);
      setStillForm(emptyStillForm());
      setFormError('');
    } catch (err) {
      setFormError(apiMessage(err, 'Could not save still'));
    }
  };

  const handleEditStill = async () => {
    if (!canWriteSettings || !selectedStill) return;
    const updated = readStill(selectedStill.id);
    if (!updated) return;
    if (isMockApi()) {
      const next = sortStills(stills.map((row) => (row.id === updated.id ? updated : row)));
      setStills(next);
      persistMock(meta, news, next);
      setIsEditStillOpen(false);
      setSelectedStill(null);
      setFormError('');
      return;
    }
    try {
      const { item } = await updatePressStill(selectedStill.id, {
        title: updated.title,
        imageUrl: updated.imageUrl,
        sortOrder: updated.sortOrder,
        published: updated.published,
        demoBadge: updated.demoBadge,
      });
      setStills((current) =>
        sortStills(current.map((row) => (row.id === item.id ? persistedStill(item) : row))),
      );
      setIsEditStillOpen(false);
      setSelectedStill(null);
      setFormError('');
    } catch (err) {
      setFormError(apiMessage(err, 'Could not save still'));
    }
  };

  const handleDeleteStill = async () => {
    if (!canWriteSettings || !selectedStill) return;
    if (isMockApi()) {
      const next = stills.filter((row) => row.id !== selectedStill.id);
      setStills(next);
      persistMock(meta, news, next);
      setIsDeleteStillOpen(false);
      setSelectedStill(null);
      return;
    }
    try {
      await deletePressStill(selectedStill.id);
      setStills((current) => current.filter((row) => row.id !== selectedStill.id));
      setIsDeleteStillOpen(false);
      setSelectedStill(null);
    } catch (err) {
      setFormError(apiMessage(err, 'Could not delete still'));
    }
  };

  const handleMediaSelect = (files: MediaFile[]) => {
    const url = files[0]?.url?.trim() ?? '';
    if (!url || url.startsWith('blob:')) return;
    if (mediaTarget.kind === 'still') {
      setStillForm((current) => ({ ...current, imageUrl: url }));
    } else {
      setAsset(mediaTarget.index, { url });
    }
    setIsMediaPickerOpen(false);
  };

  const newsFields = (
    <div className="space-y-4">
      <Input
        label="Title (EN)"
        value={newsForm.titleEn}
        onChange={(e) => setNewsForm({ ...newsForm, titleEn: e.target.value })}
        required
      />
      <Input
        label="Title (MM)"
        value={newsForm.titleMm}
        onChange={(e) => setNewsForm({ ...newsForm, titleMm: e.target.value })}
        required
      />
      <div>
        <label
          htmlFor="press-news-body-en"
          className="mb-1.5 block text-sm font-medium text-fg-secondary"
        >
          Body (EN)
        </label>
        <textarea
          id="press-news-body-en"
          value={newsForm.bodyEn}
          onChange={(e) => setNewsForm({ ...newsForm, bodyEn: e.target.value })}
          className="input-base min-h-24"
          required
        />
      </div>
      <div>
        <label
          htmlFor="press-news-body-mm"
          className="mb-1.5 block text-sm font-medium text-fg-secondary"
        >
          Body (MM)
        </label>
        <textarea
          id="press-news-body-mm"
          value={newsForm.bodyMm}
          onChange={(e) => setNewsForm({ ...newsForm, bodyMm: e.target.value })}
          className="input-base min-h-24"
          required
        />
      </div>
      <Input
        label="Link (optional)"
        value={newsForm.href}
        onChange={(e) => setNewsForm({ ...newsForm, href: e.target.value })}
      />
      <Input
        label="Sort order"
        type="number"
        min={0}
        value={newsForm.sortOrder}
        onChange={(e) => setNewsForm({ ...newsForm, sortOrder: e.target.value })}
      />
      <Toggle
        label="Published"
        checked={newsForm.published}
        onChange={(published) => setNewsForm({ ...newsForm, published })}
      />
      <Toggle
        label="Demo badge"
        checked={newsForm.demoBadge}
        onChange={(demoBadge) => setNewsForm({ ...newsForm, demoBadge })}
      />
      {formError ? <p className="text-sm text-red-600">{formError}</p> : null}
    </div>
  );

  const stillFields = (
    <div className="space-y-4">
      <Input
        label="Title (EN)"
        value={stillForm.titleEn}
        onChange={(e) => setStillForm({ ...stillForm, titleEn: e.target.value })}
        required
      />
      <Input
        label="Title (MM)"
        value={stillForm.titleMm}
        onChange={(e) => setStillForm({ ...stillForm, titleMm: e.target.value })}
        required
      />
      <div>
        <p className="mb-1.5 text-sm font-medium text-fg-secondary">Image</p>
        <div className="flex items-start gap-4">
          <button
            type="button"
            className="flex h-20 w-28 items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-line-strong bg-gray-50"
            onClick={() => {
              setMediaTarget({ kind: 'still' });
              setIsMediaPickerOpen(true);
            }}
            aria-label="Choose still from Media"
          >
            {stillForm.imageUrl ? (
              <img src={stillForm.imageUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <ImageIcon className="h-8 w-8 text-fg-muted" />
            )}
          </button>
          <div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setMediaTarget({ kind: 'still' });
                setIsMediaPickerOpen(true);
              }}
            >
              Choose from Media
            </Button>
            {stillForm.imageUrl ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="ml-2"
                onClick={() => setStillForm({ ...stillForm, imageUrl: '' })}
              >
                Remove
              </Button>
            ) : null}
          </div>
        </div>
      </div>
      <Input
        label="Sort order"
        type="number"
        min={0}
        value={stillForm.sortOrder}
        onChange={(e) => setStillForm({ ...stillForm, sortOrder: e.target.value })}
      />
      <Toggle
        label="Published"
        checked={stillForm.published}
        onChange={(published) => setStillForm({ ...stillForm, published })}
      />
      <Toggle
        label="Demo badge"
        checked={stillForm.demoBadge}
        onChange={(demoBadge) => setStillForm({ ...stillForm, demoBadge })}
      />
      {formError ? <p className="text-sm text-red-600">{formError}</p> : null}
    </div>
  );

  if (loading) return <PressPageSkeleton />;

  return (
    <>
      <PageSEO.Press />
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-fg">Press</h1>
            <p className="mt-1 text-sm text-fg-secondary">
              Content and file URLs for reader /press. Palette on this page does not change site
              theme tokens.
            </p>
          </div>
          {canWriteSettings ? (
            <Button type="button" onClick={() => void handleSaveMeta()} disabled={savingMeta}>
              Save Press
            </Button>
          ) : null}
        </div>

        {error ? <LaneStatus message="Press request failed." onRetry={() => void load()} /> : null}
        {metaError ? <p className="text-sm text-red-600">{metaError}</p> : null}

        <Card>
          <h2 className="text-lg font-semibold text-fg">Desk</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Input
              label="ZIP URL"
              value={meta.zipUrl}
              onChange={(e) => setMeta({ ...meta, zipUrl: e.target.value })}
              disabled={!canWriteSettings}
            />
            <Input
              label="Contact email"
              value={meta.contactEmail}
              onChange={(e) => setMeta({ ...meta, contactEmail: e.target.value })}
              disabled={!canWriteSettings}
            />
            <div className="sm:col-span-2">
              <label
                htmlFor="press-spokesperson"
                className="mb-1.5 block text-sm font-medium text-fg-secondary"
              >
                Spokesperson
              </label>
              <select
                id="press-spokesperson"
                className="input-base"
                value={meta.spokespersonMemberId ?? ''}
                disabled={!canWriteSettings}
                onChange={(e) =>
                  setMeta({
                    ...meta,
                    spokespersonMemberId: e.target.value || undefined,
                  })
                }
              >
                <option value="">None</option>
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name.en} — {member.role.en}
                    {member.published ? '' : ' (unpublished)'}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-fg">Copy</h2>
          <div className="mt-4 space-y-4">
            {PRESS_COPY_KEYS.map((key) =>
              PRESS_COPY_TEXTAREA.has(key) ? (
                <div key={key} className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor={`press-copy-${key}-en`}
                      className="mb-1.5 block text-sm font-medium text-fg-secondary"
                    >
                      {PRESS_COPY_LABELS[key]} (EN)
                    </label>
                    <textarea
                      id={`press-copy-${key}-en`}
                      className="input-base min-h-24"
                      value={meta.copy[key].en}
                      disabled={!canWriteSettings}
                      onChange={(e) => setCopyField(key, 'en', e.target.value)}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor={`press-copy-${key}-mm`}
                      className="mb-1.5 block text-sm font-medium text-fg-secondary"
                    >
                      {PRESS_COPY_LABELS[key]} (MM)
                    </label>
                    <textarea
                      id={`press-copy-${key}-mm`}
                      className="input-base min-h-24"
                      value={meta.copy[key].mm}
                      disabled={!canWriteSettings}
                      onChange={(e) => setCopyField(key, 'mm', e.target.value)}
                    />
                  </div>
                </div>
              ) : (
                <div key={key} className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label={`${PRESS_COPY_LABELS[key]} (EN)`}
                    value={meta.copy[key].en}
                    disabled={!canWriteSettings}
                    onChange={(e) => setCopyField(key, 'en', e.target.value)}
                  />
                  <Input
                    label={`${PRESS_COPY_LABELS[key]} (MM)`}
                    value={meta.copy[key].mm}
                    disabled={!canWriteSettings}
                    onChange={(e) => setCopyField(key, 'mm', e.target.value)}
                  />
                </div>
              ),
            )}
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-fg">Facts</h2>
          <div className="mt-4 space-y-6">
            {PRESS_FACT_KEYS.map((key) => (
              <div key={key} className="grid gap-4 sm:grid-cols-2">
                <Input
                  label={`${key} label (EN)`}
                  value={meta.facts[key].label.en}
                  disabled={!canWriteSettings}
                  onChange={(e) => setFactField(key, 'labelEn', e.target.value)}
                />
                <Input
                  label={`${key} label (MM)`}
                  value={meta.facts[key].label.mm}
                  disabled={!canWriteSettings}
                  onChange={(e) => setFactField(key, 'labelMm', e.target.value)}
                />
                <Input
                  label={`${key} value (EN)`}
                  value={meta.facts[key].value.en}
                  disabled={!canWriteSettings}
                  onChange={(e) => setFactField(key, 'valueEn', e.target.value)}
                />
                <Input
                  label={`${key} value (MM)`}
                  value={meta.facts[key].value.mm}
                  disabled={!canWriteSettings}
                  onChange={(e) => setFactField(key, 'valueMm', e.target.value)}
                />
                <Input
                  label={`${key} href (optional)`}
                  value={meta.facts[key].href ?? ''}
                  disabled={!canWriteSettings}
                  onChange={(e) => setFactField(key, 'href', e.target.value)}
                />
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-fg">Palette</h2>
          <p className="mt-1 text-sm text-fg-secondary">
            Edits stay on this Press kit page. They do not write Tailwind or global.css.
          </p>
          <div className="mt-4 space-y-4">
            {meta.palette.map((swatch, index) => (
              <div key={`${swatch.hex}-${index}`} className="grid gap-4 sm:grid-cols-4">
                <Input
                  label="Hex"
                  value={swatch.hex}
                  disabled={!canWriteSettings}
                  onChange={(e) => setPalette(index, { hex: e.target.value })}
                />
                <Input
                  label="Label (EN)"
                  value={swatch.label.en}
                  disabled={!canWriteSettings}
                  onChange={(e) => setPalette(index, { labelEn: e.target.value })}
                />
                <Input
                  label="Label (MM)"
                  value={swatch.label.mm}
                  disabled={!canWriteSettings}
                  onChange={(e) => setPalette(index, { labelMm: e.target.value })}
                />
                <div className="flex items-end">
                  <div
                    className="mb-2 h-10 w-full rounded-lg border border-line"
                    style={{ backgroundColor: swatch.hex }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-fg">Assets</h2>
          <div className="mt-4 space-y-6">
            {meta.assets.map((asset, index) => (
              <div key={`${asset.url}-${index}`} className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Name (EN)"
                  value={asset.name.en}
                  disabled={!canWriteSettings}
                  onChange={(e) => setAsset(index, { nameEn: e.target.value })}
                />
                <Input
                  label="Name (MM)"
                  value={asset.name.mm}
                  disabled={!canWriteSettings}
                  onChange={(e) => setAsset(index, { nameMm: e.target.value })}
                />
                <Input
                  label="Format"
                  value={asset.format}
                  disabled={!canWriteSettings}
                  onChange={(e) => setAsset(index, { format: e.target.value })}
                />
                <div>
                  <Input label="URL" value={asset.url} disabled readOnly />
                  {canWriteSettings ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => {
                        setMediaTarget({ kind: 'asset', index });
                        setIsMediaPickerOpen(true);
                      }}
                    >
                      Choose from Media
                    </Button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-fg">News</h2>
            {canWriteSettings ? (
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  setNewsForm(emptyNewsForm());
                  setFormError('');
                  setIsAddNewsOpen(true);
                }}
              >
                <Plus className="mr-1 h-4 w-4" />
                Add news
              </Button>
            ) : null}
          </div>
          {showEmpty && news.length === 0 ? (
            <EmptyState
              icon={<Newspaper className="h-8 w-8 text-fg-muted" />}
              title="No press news"
              description="Empty news is honest. Add a public release when one exists."
            />
          ) : showEmpty ? (
            <ul className="divide-y divide-line">
              {news.map((row) => (
                <li key={row.id} className="flex items-start justify-between gap-3 py-3">
                  <div>
                    <p className="font-medium text-fg">{row.title.en}</p>
                    <p className="text-sm text-fg-secondary">{row.body.en}</p>
                  </div>
                  {canWriteSettings ? (
                    <div className="flex gap-1">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        aria-label={`Edit ${row.title.en}`}
                        onClick={() => {
                          setSelectedNews(row);
                          setNewsForm({
                            titleEn: row.title.en,
                            titleMm: row.title.mm,
                            bodyEn: row.body.en,
                            bodyMm: row.body.mm,
                            href: row.href ?? '',
                            sortOrder: String(row.sortOrder),
                            published: row.published,
                            demoBadge: row.demoBadge,
                          });
                          setFormError('');
                          setIsEditNewsOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        aria-label={`Delete ${row.title.en}`}
                        onClick={() => {
                          setSelectedNews(row);
                          setIsDeleteNewsOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : null}
        </Card>

        <Card>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-fg">Stills</h2>
            {canWriteSettings ? (
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  setStillForm(emptyStillForm());
                  setFormError('');
                  setIsAddStillOpen(true);
                }}
              >
                <Plus className="mr-1 h-4 w-4" />
                Add still
              </Button>
            ) : null}
          </div>
          {showEmpty && stills.length === 0 ? (
            <EmptyState
              icon={<ImageIcon className="h-8 w-8 text-fg-muted" />}
              title="No press stills"
              description="Empty stills stay empty until you add a Media URL."
            />
          ) : showEmpty ? (
            <ul className="grid gap-4 sm:grid-cols-3">
              {stills.map((row) => (
                <li key={row.id} className="overflow-hidden rounded-lg border border-line">
                  <img src={row.imageUrl} alt="" className="aspect-[16/10] w-full object-cover" />
                  <div className="flex items-center justify-between gap-2 p-3">
                    <p className="text-sm font-medium text-fg">{row.title.en}</p>
                    {canWriteSettings ? (
                      <div className="flex gap-1">
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          aria-label={`Edit ${row.title.en}`}
                          onClick={() => {
                            setSelectedStill(row);
                            setStillForm({
                              titleEn: row.title.en,
                              titleMm: row.title.mm,
                              imageUrl: row.imageUrl,
                              sortOrder: String(row.sortOrder),
                              published: row.published,
                              demoBadge: row.demoBadge,
                            });
                            setFormError('');
                            setIsEditStillOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          aria-label={`Delete ${row.title.en}`}
                          onClick={() => {
                            setSelectedStill(row);
                            setIsDeleteStillOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          ) : null}
        </Card>
      </div>

      <Modal
        isOpen={isAddNewsOpen}
        onClose={() => setIsAddNewsOpen(false)}
        title="Add news"
        size="lg"
      >
        {newsFields}
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={() => setIsAddNewsOpen(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={() => void handleAddNews()}>
            Save
          </Button>
        </div>
      </Modal>
      <Modal
        isOpen={isEditNewsOpen}
        onClose={() => setIsEditNewsOpen(false)}
        title="Edit news"
        size="lg"
      >
        {newsFields}
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={() => setIsEditNewsOpen(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={() => void handleEditNews()}>
            Save
          </Button>
        </div>
      </Modal>
      <Modal
        isOpen={isDeleteNewsOpen}
        onClose={() => setIsDeleteNewsOpen(false)}
        title="Delete news"
      >
        <p className="text-sm text-fg-secondary">Delete {selectedNews?.title.en}?</p>
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={() => setIsDeleteNewsOpen(false)}>
            Cancel
          </Button>
          <Button type="button" variant="danger" onClick={() => void handleDeleteNews()}>
            Delete
          </Button>
        </div>
      </Modal>
      <Modal
        isOpen={isAddStillOpen}
        onClose={() => setIsAddStillOpen(false)}
        title="Add still"
        size="lg"
      >
        {stillFields}
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={() => setIsAddStillOpen(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={() => void handleAddStill()}>
            Save
          </Button>
        </div>
      </Modal>
      <Modal
        isOpen={isEditStillOpen}
        onClose={() => setIsEditStillOpen(false)}
        title="Edit still"
        size="lg"
      >
        {stillFields}
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={() => setIsEditStillOpen(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={() => void handleEditStill()}>
            Save
          </Button>
        </div>
      </Modal>
      <Modal
        isOpen={isDeleteStillOpen}
        onClose={() => setIsDeleteStillOpen(false)}
        title="Delete still"
      >
        <p className="text-sm text-fg-secondary">Delete {selectedStill?.title.en}?</p>
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={() => setIsDeleteStillOpen(false)}>
            Cancel
          </Button>
          <Button type="button" variant="danger" onClick={() => void handleDeleteStill()}>
            Delete
          </Button>
        </div>
      </Modal>
      <MediaPicker
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={handleMediaSelect}
      />
    </>
  );
};

export default PressPage;
