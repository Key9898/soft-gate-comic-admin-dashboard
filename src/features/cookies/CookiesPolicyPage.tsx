import { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, Cookie, Trash2, Edit } from 'lucide-react';
import { Card, Button, Input, Modal, PageSEO, EmptyState, LaneStatus } from '../../components';
import { useStaffAccess } from '@/lib/auth/staffAccess';
import { apiMessage, isMockApi } from '@/lib/api/http';
import {
  createCookieRow,
  deleteCookieRow,
  getCookiesPolicy,
  updateCookieRow,
  updateCookiesMeta,
} from '@/lib/api/cookies';
import {
  COOKIE_COPY_KEYS,
  COOKIE_COPY_LABELS,
  COOKIE_COPY_TEXTAREA,
  COOKIE_ROW_ID_BY_KEY,
  COOKIE_STORAGE_KEYS,
  DEFAULT_COOKIE_META,
  isCookieStorageKey,
  loadCookiesPolicy,
  persistedCookieMeta,
  persistedCookieRow,
  saveCookiesPolicy,
  sortCookieRows,
  type CookieCopyKey,
  type CookieMeta,
  type CookieRow,
} from '@/lib/cookiesPolicy';
import CookiesPolicyPageSkeleton from './components/CookiesPolicyPageSkeleton';

type RowFormState = {
  storageKey: string;
  labelEn: string;
  labelMm: string;
  descriptionEn: string;
  descriptionMm: string;
  sortOrder: string;
};

const emptyRowForm = (): RowFormState => ({
  storageKey: '',
  labelEn: '',
  labelMm: '',
  descriptionEn: '',
  descriptionMm: '',
  sortOrder: '0',
});

const CookiesPolicyPage = () => {
  const { canWriteSettings } = useStaffAccess();
  const [meta, setMeta] = useState<CookieMeta>(() => persistedCookieMeta(DEFAULT_COOKIE_META));
  const [rows, setRows] = useState<CookieRow[]>([]);
  const [loading, setLoading] = useState(() => !isMockApi());
  const [error, setError] = useState<Error | null>(null);
  const [loaded, setLoaded] = useState(() => isMockApi());
  const [metaError, setMetaError] = useState('');
  const [savingMeta, setSavingMeta] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<CookieRow | null>(null);
  const [rowForm, setRowForm] = useState<RowFormState>(emptyRowForm);
  const [formError, setFormError] = useState('');

  const persistMock = useCallback((nextMeta: CookieMeta, nextRows: CookieRow[]) => {
    if (!isMockApi()) return;
    saveCookiesPolicy({ meta: nextMeta, rows: nextRows });
  }, []);

  const load = useCallback(async () => {
    if (isMockApi()) {
      const snapshot = loadCookiesPolicy();
      setMeta(snapshot.meta);
      setRows(sortCookieRows(snapshot.rows));
      setError(null);
      setLoaded(true);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await getCookiesPolicy();
      setMeta(persistedCookieMeta(res.meta));
      setRows(sortCookieRows(res.rows.map(persistedCookieRow)));
      setError(null);
      setLoaded(true);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Cookie policy request failed.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const showEmpty = loaded && !error;
  const usedKeys = useMemo(() => new Set(rows.map((row) => row.storageKey)), [rows]);
  const unusedKeys = COOKIE_STORAGE_KEYS.filter((key) => !usedKeys.has(key));

  const handleSaveMeta = async () => {
    if (!canWriteSettings) return;
    setSavingMeta(true);
    setMetaError('');
    try {
      if (isMockApi()) {
        persistMock(meta, rows);
      } else {
        const saved = await updateCookiesMeta(meta);
        setMeta(persistedCookieMeta(saved.meta));
      }
    } catch (err) {
      setMetaError(apiMessage(err, 'Could not save cookies'));
    } finally {
      setSavingMeta(false);
    }
  };

  const parseRow = (): CookieRow | null => {
    const sortOrder = Number(rowForm.sortOrder);
    if (!Number.isInteger(sortOrder) || sortOrder < 0) {
      setFormError('sortOrder must be a non-negative integer');
      return null;
    }
    if (!isCookieStorageKey(rowForm.storageKey)) {
      setFormError('storageKey must be on the allowlist');
      return null;
    }
    if (
      !rowForm.labelEn.trim() ||
      !rowForm.labelMm.trim() ||
      !rowForm.descriptionEn.trim() ||
      !rowForm.descriptionMm.trim()
    ) {
      setFormError('label and description must include en and mm');
      return null;
    }
    return {
      id: selected?.id ?? COOKIE_ROW_ID_BY_KEY[rowForm.storageKey],
      storageKey: rowForm.storageKey,
      label: { en: rowForm.labelEn.trim(), mm: rowForm.labelMm.trim() },
      description: { en: rowForm.descriptionEn.trim(), mm: rowForm.descriptionMm.trim() },
      sortOrder,
    };
  };

  const handleAdd = async () => {
    const parsed = parseRow();
    if (!parsed) return;
    if (usedKeys.has(parsed.storageKey)) {
      setFormError('storageKey already in use');
      return;
    }
    try {
      if (isMockApi()) {
        const nextRows = sortCookieRows([...rows, parsed]);
        setRows(nextRows);
        persistMock(meta, nextRows);
      } else {
        const created = await createCookieRow({
          storageKey: parsed.storageKey,
          label: parsed.label,
          description: parsed.description,
          sortOrder: parsed.sortOrder,
        });
        setRows(sortCookieRows([...rows, persistedCookieRow(created.item)]));
      }
      setIsAddOpen(false);
      setRowForm(emptyRowForm());
      setFormError('');
    } catch (err) {
      setFormError(apiMessage(err, 'Could not save storage row'));
    }
  };

  const handleEdit = async () => {
    if (!selected) return;
    const parsed = parseRow();
    if (!parsed) return;
    try {
      if (isMockApi()) {
        const nextRows = sortCookieRows(
          rows.map((row) =>
            row.id === selected.id ? { ...parsed, storageKey: row.storageKey } : row,
          ),
        );
        setRows(nextRows);
        persistMock(meta, nextRows);
      } else {
        const updated = await updateCookieRow(selected.id, {
          label: parsed.label,
          description: parsed.description,
          sortOrder: parsed.sortOrder,
        });
        setRows(
          sortCookieRows(
            rows.map((row) => (row.id === selected.id ? persistedCookieRow(updated.item) : row)),
          ),
        );
      }
      setIsEditOpen(false);
      setSelected(null);
      setFormError('');
    } catch (err) {
      setFormError(apiMessage(err, 'Could not save storage row'));
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    try {
      if (isMockApi()) {
        const nextRows = rows.filter((row) => row.id !== selected.id);
        setRows(nextRows);
        persistMock(meta, nextRows);
      } else {
        await deleteCookieRow(selected.id);
        setRows(rows.filter((row) => row.id !== selected.id));
      }
      setIsDeleteOpen(false);
      setSelected(null);
    } catch (err) {
      setFormError(apiMessage(err, 'Could not delete storage row'));
    }
  };

  const setCopyField = (key: CookieCopyKey, lang: 'en' | 'mm', value: string) => {
    setMeta((current) => ({
      ...current,
      copy: { ...current.copy, [key]: { ...current.copy[key], [lang]: value } },
    }));
  };

  const rowFields = (includeKey: boolean) => (
    <div className="space-y-4">
      {includeKey ? (
        <>
          <label className="block text-sm font-medium text-fg-secondary" htmlFor="cookie-key">
            Storage key
          </label>
          <select
            id="cookie-key"
            className="input-base"
            value={rowForm.storageKey}
            disabled={!canWriteSettings}
            onChange={(e) => setRowForm({ ...rowForm, storageKey: e.target.value })}
          >
            <option value="">Select a key</option>
            {unusedKeys.map((key) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </select>
        </>
      ) : (
        <p className="text-sm text-fg-secondary">{rowForm.storageKey}</p>
      )}
      <Input
        label="Label (EN)"
        value={rowForm.labelEn}
        onChange={(e) => setRowForm({ ...rowForm, labelEn: e.target.value })}
        disabled={!canWriteSettings}
      />
      <Input
        label="Label (MM)"
        value={rowForm.labelMm}
        onChange={(e) => setRowForm({ ...rowForm, labelMm: e.target.value })}
        disabled={!canWriteSettings}
      />
      <label className="block text-sm font-medium text-fg-secondary" htmlFor="cookie-desc-en">
        Description (EN)
      </label>
      <textarea
        id="cookie-desc-en"
        className="input-base min-h-24"
        value={rowForm.descriptionEn}
        disabled={!canWriteSettings}
        onChange={(e) => setRowForm({ ...rowForm, descriptionEn: e.target.value })}
      />
      <label className="block text-sm font-medium text-fg-secondary" htmlFor="cookie-desc-mm">
        Description (MM)
      </label>
      <textarea
        id="cookie-desc-mm"
        className="input-base min-h-24"
        value={rowForm.descriptionMm}
        disabled={!canWriteSettings}
        onChange={(e) => setRowForm({ ...rowForm, descriptionMm: e.target.value })}
      />
      <Input
        label="Sort order"
        value={rowForm.sortOrder}
        onChange={(e) => setRowForm({ ...rowForm, sortOrder: e.target.value })}
        disabled={!canWriteSettings}
      />
      {formError ? <p className="text-sm text-red-600">{formError}</p> : null}
    </div>
  );

  if (loading) return <CookiesPolicyPageSkeleton />;

  return (
    <>
      <PageSEO.Cookies />
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-fg">Cookies</h1>
            <p className="mt-1 text-sm text-fg-secondary">
              Copy for reader /cookies. Saves can reach reader /cookies when the portal persist is
              on.
            </p>
          </div>
          {canWriteSettings ? (
            <Button type="button" onClick={() => void handleSaveMeta()} disabled={savingMeta}>
              Save cookies
            </Button>
          ) : null}
        </div>

        {error ? (
          <LaneStatus message="Cookie policy request failed." onRetry={() => void load()} />
        ) : null}
        {metaError ? <p className="text-sm text-red-600">{metaError}</p> : null}

        <Card>
          <h2 className="text-lg font-semibold text-fg">Effective date</h2>
          <div className="mt-4">
            <Input
              label="YYYY-MM-DD"
              value={meta.effectiveDate}
              onChange={(e) => setMeta({ ...meta, effectiveDate: e.target.value })}
              disabled={!canWriteSettings}
            />
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-fg">Glance</h2>
          <div className="mt-4 space-y-4">
            {meta.glance.map((item, index) => (
              <div key={index} className="grid gap-4 sm:grid-cols-2">
                <Input
                  label={`Glance ${index + 1} (EN)`}
                  value={item.en}
                  disabled={!canWriteSettings}
                  onChange={(e) => {
                    const glance = meta.glance.map((row, i) =>
                      i === index ? { ...row, en: e.target.value } : row,
                    );
                    setMeta({ ...meta, glance });
                  }}
                />
                <Input
                  label={`Glance ${index + 1} (MM)`}
                  value={item.mm}
                  disabled={!canWriteSettings}
                  onChange={(e) => {
                    const glance = meta.glance.map((row, i) =>
                      i === index ? { ...row, mm: e.target.value } : row,
                    );
                    setMeta({ ...meta, glance });
                  }}
                />
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-fg">Copy</h2>
          <div className="mt-4 space-y-4">
            {COOKIE_COPY_KEYS.map((key) =>
              COOKIE_COPY_TEXTAREA.has(key) ? (
                <div key={key} className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-fg-secondary">
                      {COOKIE_COPY_LABELS[key]} (EN)
                    </label>
                    <textarea
                      className="input-base min-h-24"
                      value={meta.copy[key].en}
                      disabled={!canWriteSettings}
                      onChange={(e) => setCopyField(key, 'en', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-fg-secondary">
                      {COOKIE_COPY_LABELS[key]} (MM)
                    </label>
                    <textarea
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
                    label={`${COOKIE_COPY_LABELS[key]} (EN)`}
                    value={meta.copy[key].en}
                    disabled={!canWriteSettings}
                    onChange={(e) => setCopyField(key, 'en', e.target.value)}
                  />
                  <Input
                    label={`${COOKIE_COPY_LABELS[key]} (MM)`}
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
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-fg">Storage</h2>
            {canWriteSettings ? (
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  setSelected(null);
                  setRowForm(emptyRowForm());
                  setFormError('');
                  setIsAddOpen(true);
                }}
              >
                <Plus className="mr-1 h-4 w-4" />
                Add row
              </Button>
            ) : null}
          </div>
          {showEmpty && rows.length === 0 ? (
            <EmptyState
              icon={<Cookie className="h-8 w-8 text-fg-muted" />}
              title="No storage rows"
              description="Empty storage is honest. Add an allowlisted key when one exists."
            />
          ) : showEmpty ? (
            <ul className="divide-y divide-line">
              {rows.map((row) => (
                <li key={row.id} className="flex items-start justify-between gap-3 py-3">
                  <div>
                    <p className="font-medium text-fg">{row.label.en}</p>
                    <p className="text-sm text-fg-secondary">{row.storageKey}</p>
                  </div>
                  {canWriteSettings ? (
                    <div className="flex gap-1">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        aria-label={`Edit ${row.label.en}`}
                        onClick={() => {
                          setSelected(row);
                          setRowForm({
                            storageKey: row.storageKey,
                            labelEn: row.label.en,
                            labelMm: row.label.mm,
                            descriptionEn: row.description.en,
                            descriptionMm: row.description.mm,
                            sortOrder: String(row.sortOrder),
                          });
                          setFormError('');
                          setIsEditOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        aria-label={`Delete ${row.label.en}`}
                        onClick={() => {
                          setSelected(row);
                          setIsDeleteOpen(true);
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
      </div>

      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add storage row"
        size="lg"
      >
        {rowFields(true)}
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={() => setIsAddOpen(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={() => void handleAdd()}>
            Save
          </Button>
        </div>
      </Modal>
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit storage row"
        size="lg"
      >
        {rowFields(false)}
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={() => setIsEditOpen(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={() => void handleEdit()}>
            Save
          </Button>
        </div>
      </Modal>
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Delete storage row"
      >
        <p className="text-sm text-fg-secondary">Delete {selected?.label.en}?</p>
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={() => setIsDeleteOpen(false)}>
            Cancel
          </Button>
          <Button type="button" variant="danger" onClick={() => void handleDelete()}>
            Delete
          </Button>
        </div>
      </Modal>
    </>
  );
};

export default CookiesPolicyPage;
