import { useCallback, useEffect, useState } from 'react';
import { Plus, Scale, Trash2, Edit } from 'lucide-react';
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
import { useStaffAccess } from '@/lib/auth/staffAccess';
import { apiMessage, isMockApi } from '@/lib/api/http';
import {
  createLegalSection,
  deleteLegalSection,
  getLegalMeta,
  listLegalSections,
  updateLegalMeta,
  updateLegalSection,
} from '@/lib/api/legal';
import {
  LEGAL_HEADING_LEVELS,
  allowedKindsFor,
  loadLegal,
  nextLegalSectionId,
  persistedMeta,
  persistedSection,
  saveLegal,
  sortSections,
  type BilingualText,
  type LegalDoc,
  type LegalHeadingLevel,
  type LegalMetaRecord,
  type LegalSectionKind,
  type LegalSectionRecord,
  type LegalSectionWrite,
  type LegalSnapshot,
} from '@/lib/legal';
import LegalPageSkeleton from './components/LegalPageSkeleton';

type SectionFormState = {
  slug: string;
  kind: LegalSectionKind;
  headingLevel: LegalHeadingLevel;
  titleEn: string;
  titleMm: string;
  bodyEn: string;
  bodyMm: string;
  bullets: BilingualText[];
  sortOrder: string;
  published: boolean;
};

const emptySectionForm = (): SectionFormState => ({
  slug: '',
  kind: 'body',
  headingLevel: 'h2',
  titleEn: '',
  titleMm: '',
  bodyEn: '',
  bodyMm: '',
  bullets: [],
  sortOrder: '0',
  published: true,
});

const sectionToForm = (row: LegalSectionRecord): SectionFormState => ({
  slug: row.slug,
  kind: row.kind,
  headingLevel: row.headingLevel,
  titleEn: row.title.en,
  titleMm: row.title.mm,
  bodyEn: row.body.en,
  bodyMm: row.body.mm,
  bullets: row.bullets.map((item) => ({ en: item.en, mm: item.mm })),
  sortOrder: String(row.sortOrder),
  published: row.published,
});

const formToWrite = (form: SectionFormState): LegalSectionWrite => ({
  slug: form.slug.trim(),
  kind: form.kind,
  headingLevel: form.headingLevel,
  title: { en: form.titleEn.trim(), mm: form.titleMm.trim() },
  body: { en: form.bodyEn.trim(), mm: form.bodyMm.trim() },
  bullets:
    form.kind === 'body'
      ? []
      : form.bullets.map((item) => ({ en: item.en.trim(), mm: item.mm.trim() })),
  sortOrder: Number.parseInt(form.sortOrder, 10) || 0,
  published: form.published,
});

const DOC_LABEL: Record<LegalDoc, string> = {
  privacy: 'Privacy Policy',
  terms: 'Terms of Service',
};

const LegalPage = () => {
  const { canWriteSettings } = useStaffAccess();
  const [snapshot, setSnapshot] = useState<LegalSnapshot>(() => loadLegal());
  const [loading, setLoading] = useState(() => !isMockApi());
  const [error, setError] = useState<Error | null>(null);
  const [loaded, setLoaded] = useState(() => isMockApi());
  const [savingDoc, setSavingDoc] = useState<LegalDoc | null>(null);
  const [metaError, setMetaError] = useState('');
  const [formError, setFormError] = useState('');
  const [activeDoc, setActiveDoc] = useState<LegalDoc>('privacy');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<LegalSectionRecord | null>(null);
  const [form, setForm] = useState<SectionFormState>(() => emptySectionForm());

  const persistMock = useCallback((next: LegalSnapshot) => {
    if (!isMockApi()) return;
    saveLegal(next);
  }, []);

  const load = useCallback(async () => {
    if (isMockApi()) {
      setSnapshot(loadLegal());
      setError(null);
      setLoaded(true);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [privacyMeta, privacySections, termsMeta, termsSections] = await Promise.all([
        getLegalMeta('privacy'),
        listLegalSections('privacy'),
        getLegalMeta('terms'),
        listLegalSections('terms'),
      ]);
      setSnapshot({
        privacy: {
          meta: persistedMeta(privacyMeta.meta),
          sections: sortSections(privacySections.sections.map(persistedSection)),
        },
        terms: {
          meta: persistedMeta(termsMeta.meta),
          sections: sortSections(termsSections.sections.map(persistedSection)),
        },
      });
      setError(null);
      setLoaded(true);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Legal request failed.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const showEmpty = loaded && !error;

  const setDocMeta = (doc: LegalDoc, meta: LegalMetaRecord) => {
    setSnapshot((current) => ({ ...current, [doc]: { ...current[doc], meta } }));
  };

  const setDocSections = (doc: LegalDoc, sections: LegalSectionRecord[]) => {
    setSnapshot((current) => ({
      ...current,
      [doc]: { ...current[doc], sections: sortSections(sections) },
    }));
  };

  const handleSaveMeta = async (doc: LegalDoc) => {
    const meta = persistedMeta(snapshot[doc].meta);
    setMetaError('');
    setSavingDoc(doc);
    try {
      if (isMockApi()) {
        const next = {
          ...snapshot,
          [doc]: { ...snapshot[doc], meta },
        };
        persistMock(next);
        setSnapshot(next);
        return;
      }
      const res = await updateLegalMeta(doc, meta);
      setDocMeta(doc, persistedMeta(res.meta));
    } catch (err) {
      setMetaError(apiMessage(err, 'Could not save legal copy.'));
    } finally {
      setSavingDoc(null);
    }
  };

  const openAdd = (doc: LegalDoc) => {
    setActiveDoc(doc);
    setForm(emptySectionForm());
    setFormError('');
    setIsAddOpen(true);
  };

  const openEdit = (doc: LegalDoc, row: LegalSectionRecord) => {
    setActiveDoc(doc);
    setSelected(row);
    setForm(sectionToForm(row));
    setFormError('');
    setIsEditOpen(true);
  };

  const openDelete = (doc: LegalDoc, row: LegalSectionRecord) => {
    setActiveDoc(doc);
    setSelected(row);
    setIsDeleteOpen(true);
  };

  const handleCreate = async () => {
    const body = formToWrite(form);
    setFormError('');
    try {
      if (isMockApi()) {
        const row = persistedSection({
          id: nextLegalSectionId(activeDoc, snapshot[activeDoc].sections),
          ...body,
        });
        const sections = [...snapshot[activeDoc].sections, row];
        const next = {
          ...snapshot,
          [activeDoc]: { ...snapshot[activeDoc], sections: sortSections(sections) },
        };
        persistMock(next);
        setSnapshot(next);
        setIsAddOpen(false);
        return;
      }
      const res = await createLegalSection(activeDoc, body);
      setDocSections(activeDoc, [...snapshot[activeDoc].sections, persistedSection(res.item)]);
      setIsAddOpen(false);
    } catch (err) {
      setFormError(apiMessage(err, 'Could not add section.'));
    }
  };

  const handleUpdate = async () => {
    if (!selected) return;
    const body = formToWrite(form);
    setFormError('');
    try {
      if (isMockApi()) {
        const row = persistedSection({ ...body, id: selected.id });
        const sections = snapshot[activeDoc].sections.map((item) =>
          item.id === selected.id ? row : item,
        );
        const next = {
          ...snapshot,
          [activeDoc]: { ...snapshot[activeDoc], sections: sortSections(sections) },
        };
        persistMock(next);
        setSnapshot(next);
        setIsEditOpen(false);
        return;
      }
      const res = await updateLegalSection(activeDoc, selected.id, body);
      setDocSections(
        activeDoc,
        snapshot[activeDoc].sections.map((item) =>
          item.id === selected.id ? persistedSection(res.item) : item,
        ),
      );
      setIsEditOpen(false);
    } catch (err) {
      setFormError(apiMessage(err, 'Could not save section.'));
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    try {
      if (isMockApi()) {
        const sections = snapshot[activeDoc].sections.filter((item) => item.id !== selected.id);
        const next = {
          ...snapshot,
          [activeDoc]: { ...snapshot[activeDoc], sections },
        };
        persistMock(next);
        setSnapshot(next);
        setIsDeleteOpen(false);
        return;
      }
      await deleteLegalSection(activeDoc, selected.id);
      setDocSections(
        activeDoc,
        snapshot[activeDoc].sections.filter((item) => item.id !== selected.id),
      );
      setIsDeleteOpen(false);
    } catch (err) {
      setFormError(apiMessage(err, 'Could not delete section.'));
    }
  };

  const sectionFields = (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Slug"
          value={form.slug}
          onChange={(e) => setForm({ ...form, slug: e.target.value })}
        />
        <Input
          label="Sort order"
          value={form.sortOrder}
          onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
        />
        <div>
          <label
            htmlFor="legal-kind"
            className="mb-1.5 block text-sm font-medium text-fg-secondary"
          >
            Kind
          </label>
          <select
            id="legal-kind"
            className="input-base"
            value={form.kind}
            onChange={(e) =>
              setForm({ ...form, kind: e.target.value as LegalSectionKind, bullets: form.bullets })
            }
          >
            {allowedKindsFor(activeDoc).map((kind) => (
              <option key={kind} value={kind}>
                {kind}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="legal-heading"
            className="mb-1.5 block text-sm font-medium text-fg-secondary"
          >
            Heading
          </label>
          <select
            id="legal-heading"
            className="input-base"
            value={form.headingLevel}
            onChange={(e) =>
              setForm({ ...form, headingLevel: e.target.value as LegalHeadingLevel })
            }
          >
            {LEGAL_HEADING_LEVELS.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </div>
        <Input
          label="Title (EN)"
          value={form.titleEn}
          onChange={(e) => setForm({ ...form, titleEn: e.target.value })}
        />
        <Input
          label="Title (MM)"
          value={form.titleMm}
          onChange={(e) => setForm({ ...form, titleMm: e.target.value })}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="legal-body-en"
            className="mb-1.5 block text-sm font-medium text-fg-secondary"
          >
            Body (EN)
          </label>
          <textarea
            id="legal-body-en"
            className="input-base min-h-24"
            value={form.bodyEn}
            onChange={(e) => setForm({ ...form, bodyEn: e.target.value })}
          />
        </div>
        <div>
          <label
            htmlFor="legal-body-mm"
            className="mb-1.5 block text-sm font-medium text-fg-secondary"
          >
            Body (MM)
          </label>
          <textarea
            id="legal-body-mm"
            className="input-base min-h-24"
            value={form.bodyMm}
            onChange={(e) => setForm({ ...form, bodyMm: e.target.value })}
          />
        </div>
      </div>
      {form.kind !== 'body' ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-fg-secondary">Bullets</p>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setForm({ ...form, bullets: [...form.bullets, { en: '', mm: '' }] })}
            >
              Add bullet
            </Button>
          </div>
          {form.bullets.map((bullet, index) => (
            <div key={index} className="grid gap-4 sm:grid-cols-2">
              <Input
                label={`Bullet ${index + 1} (EN)`}
                value={bullet.en}
                onChange={(e) => {
                  const bullets = form.bullets.slice();
                  bullets[index] = { ...bullet, en: e.target.value };
                  setForm({ ...form, bullets });
                }}
              />
              <div className="flex items-end gap-2">
                <Input
                  label={`Bullet ${index + 1} (MM)`}
                  value={bullet.mm}
                  onChange={(e) => {
                    const bullets = form.bullets.slice();
                    bullets[index] = { ...bullet, mm: e.target.value };
                    setForm({ ...form, bullets });
                  }}
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() =>
                    setForm({ ...form, bullets: form.bullets.filter((_, i) => i !== index) })
                  }
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : null}
      <Toggle
        label="Published"
        checked={form.published}
        onChange={(published) => setForm({ ...form, published })}
      />
      {formError ? <p className="text-sm text-red-600">{formError}</p> : null}
    </div>
  );

  const renderDoc = (doc: LegalDoc) => {
    const current = snapshot[doc];
    return (
      <div className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-fg">{DOC_LABEL[doc]}</h2>
          {canWriteSettings ? (
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="secondary" onClick={() => openAdd(doc)}>
                <Plus className="mr-1 h-4 w-4" />
                Add section
              </Button>
              <Button
                type="button"
                onClick={() => void handleSaveMeta(doc)}
                disabled={savingDoc === doc}
              >
                Save {DOC_LABEL[doc]}
              </Button>
            </div>
          ) : null}
        </div>

        <Card>
          <h3 className="text-base font-semibold text-fg">Meta</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor={`${doc}-seo-en`}
                className="mb-1.5 block text-sm font-medium text-fg-secondary"
              >
                SEO description (EN)
              </label>
              <textarea
                id={`${doc}-seo-en`}
                className="input-base min-h-24"
                value={current.meta.seoDesc.en}
                disabled={!canWriteSettings}
                onChange={(e) =>
                  setDocMeta(doc, {
                    ...current.meta,
                    seoDesc: { ...current.meta.seoDesc, en: e.target.value },
                  })
                }
              />
            </div>
            <div>
              <label
                htmlFor={`${doc}-seo-mm`}
                className="mb-1.5 block text-sm font-medium text-fg-secondary"
              >
                SEO description (MM)
              </label>
              <textarea
                id={`${doc}-seo-mm`}
                className="input-base min-h-24"
                value={current.meta.seoDesc.mm}
                disabled={!canWriteSettings}
                onChange={(e) =>
                  setDocMeta(doc, {
                    ...current.meta,
                    seoDesc: { ...current.meta.seoDesc, mm: e.target.value },
                  })
                }
              />
            </div>
            <Input
              label="Effective date"
              type="date"
              value={current.meta.effectiveDate}
              disabled={!canWriteSettings}
              onChange={(e) => setDocMeta(doc, { ...current.meta, effectiveDate: e.target.value })}
            />
          </div>
          <div className="mt-6 space-y-4">
            <p className="text-sm font-medium text-fg-secondary">At a glance</p>
            {current.meta.glance.map((item, index) => (
              <div key={index} className="grid gap-4 sm:grid-cols-2">
                <Input
                  label={`Glance ${index + 1} (EN)`}
                  value={item.en}
                  disabled={!canWriteSettings}
                  onChange={(e) => {
                    const glance = current.meta.glance.slice();
                    glance[index] = { ...item, en: e.target.value };
                    setDocMeta(doc, { ...current.meta, glance });
                  }}
                />
                <Input
                  label={`Glance ${index + 1} (MM)`}
                  value={item.mm}
                  disabled={!canWriteSettings}
                  onChange={(e) => {
                    const glance = current.meta.glance.slice();
                    glance[index] = { ...item, mm: e.target.value };
                    setDocMeta(doc, { ...current.meta, glance });
                  }}
                />
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="text-base font-semibold text-fg">Sections</h3>
          {showEmpty && current.sections.length === 0 ? (
            <EmptyState
              icon={<Scale className="h-8 w-8 text-fg-muted" />}
              title={`No ${DOC_LABEL[doc].toLowerCase()} sections`}
              description="Add a published section to appear on the reader page."
            />
          ) : (
            <ul className="mt-4 divide-y divide-line">
              {current.sections.map((row) => (
                <li key={row.id} className="flex items-center justify-between gap-3 py-3">
                  <div>
                    <p className="font-medium text-fg">{row.title.en}</p>
                    <p className="text-sm text-fg-secondary">
                      #{row.slug} · {row.kind} · {row.published ? 'Published' : 'Unpublished'}
                    </p>
                  </div>
                  {canWriteSettings ? (
                    <div className="flex gap-2">
                      <Button type="button" variant="secondary" onClick={() => openEdit(doc, row)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => openDelete(doc, row)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    );
  };

  if (loading) return <LegalPageSkeleton />;

  return (
    <>
      <PageSEO.Legal />
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-fg">Legal</h1>
          <p className="mt-1 text-sm text-fg-secondary">
            Bilingual Privacy Policy and Terms of Service copy for reader /privacy and /terms.
            Contact and glance chrome stay on the reader shell.
          </p>
        </div>

        {error ? <LaneStatus message="Legal request failed." onRetry={() => void load()} /> : null}
        {metaError ? <p className="text-sm text-red-600">{metaError}</p> : null}

        {renderDoc('privacy')}
        {renderDoc('terms')}
      </div>

      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title={`Add ${DOC_LABEL[activeDoc]} section`}
      >
        {sectionFields}
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={() => setIsAddOpen(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={() => void handleCreate()}>
            Add section
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title={`Edit ${DOC_LABEL[activeDoc]} section`}
      >
        {sectionFields}
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={() => setIsEditOpen(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={() => void handleUpdate()}>
            Save
          </Button>
        </div>
      </Modal>

      <Modal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="Delete section">
        <p className="text-sm text-fg-secondary">
          Delete {selected?.title.en ?? 'this section'}? This cannot be undone on the live desk.
        </p>
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={() => setIsDeleteOpen(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={() => void handleDelete()}>
            Delete
          </Button>
        </div>
      </Modal>
    </>
  );
};

export default LegalPage;
