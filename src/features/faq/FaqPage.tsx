import { useCallback, useEffect, useState } from 'react';
import { Plus, MessageCircleQuestion, Trash2, Edit } from 'lucide-react';
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
import { createFaqItem, deleteFaqItem, listFaqItems, updateFaqItem } from '@/lib/api/faq';
import { useOpenCreateQuery } from '@/lib/commands';
import {
  DEFAULT_FAQ_META,
  FAQ_CATEGORIES,
  FAQ_CATEGORY_LABELS,
  FAQ_RELATED_PATHS,
  loadFaq,
  persistedFaqItem,
  persistedFaqMeta,
  saveFaq,
  sortFaqItems,
  type FaqCategory,
  type FaqItem,
  type FaqMeta,
  type FaqRelatedPath,
} from '@/lib/faq';
import FaqPageSkeleton from './components/FaqPageSkeleton';

type FormState = {
  category: FaqCategory;
  questionEn: string;
  questionMm: string;
  answerEn: string;
  answerMm: string;
  relatedTo: string;
  relatedLabelEn: string;
  relatedLabelMm: string;
  sortOrder: string;
  published: boolean;
};

const emptyForm = (): FormState => ({
  category: 'general',
  questionEn: '',
  questionMm: '',
  answerEn: '',
  answerMm: '',
  relatedTo: '',
  relatedLabelEn: '',
  relatedLabelMm: '',
  sortOrder: '0',
  published: true,
});

const FaqPage = () => {
  const { canWriteSettings } = useStaffAccess();
  const [meta, setMeta] = useState<FaqMeta>(() => persistedFaqMeta(DEFAULT_FAQ_META));
  const [items, setItems] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(() => !isMockApi());
  const [error, setError] = useState<Error | null>(null);
  const [loaded, setLoaded] = useState(() => isMockApi());
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<FaqItem | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [formError, setFormError] = useState('');

  const persistMock = useCallback((nextMeta: FaqMeta, nextItems: FaqItem[]) => {
    if (!isMockApi()) return;
    saveFaq({ meta: nextMeta, items: nextItems });
  }, []);

  const load = useCallback(async () => {
    if (isMockApi()) {
      const snapshot = loadFaq();
      setMeta(snapshot.meta);
      setItems(sortFaqItems(snapshot.items));
      setError(null);
      setLoaded(true);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await listFaqItems();
      setItems(sortFaqItems(res.items.map(persistedFaqItem)));
      setError(null);
      setLoaded(true);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('FAQ request failed.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useOpenCreateQuery(() => setIsAddOpen(true), canWriteSettings && !loading);

  const showEmpty = loaded && !error;

  const parseForm = (): FaqItem | null => {
    const sortOrder = Number(form.sortOrder);
    if (!Number.isInteger(sortOrder) || sortOrder < 0) {
      setFormError('sortOrder must be a non-negative integer');
      return null;
    }
    if (
      !form.questionEn.trim() ||
      !form.questionMm.trim() ||
      !form.answerEn.trim() ||
      !form.answerMm.trim()
    ) {
      setFormError('question and answer must include en and mm');
      return null;
    }
    const next: FaqItem = {
      id: selected?.id ?? `q${meta.nextItemNumber}`,
      category: form.category,
      question: { en: form.questionEn.trim(), mm: form.questionMm.trim() },
      answer: { en: form.answerEn.trim(), mm: form.answerMm.trim() },
      sortOrder,
      published: form.published,
    };
    if (form.relatedTo) {
      if (!(FAQ_RELATED_PATHS as readonly string[]).includes(form.relatedTo)) {
        setFormError('relatedTo is not allowed');
        return null;
      }
      if (!form.relatedLabelEn.trim() || !form.relatedLabelMm.trim()) {
        setFormError('relatedLabel must include en and mm');
        return null;
      }
      next.relatedTo = form.relatedTo as FaqRelatedPath;
      next.relatedLabel = { en: form.relatedLabelEn.trim(), mm: form.relatedLabelMm.trim() };
    }
    return next;
  };

  const handleAdd = async () => {
    const parsed = parseForm();
    if (!parsed) return;
    try {
      if (isMockApi()) {
        const nextMeta = { nextItemNumber: meta.nextItemNumber + 1 };
        const nextItems = sortFaqItems([...items, parsed]);
        setMeta(nextMeta);
        setItems(nextItems);
        persistMock(nextMeta, nextItems);
      } else {
        const created = await createFaqItem({
          category: parsed.category,
          question: parsed.question,
          answer: parsed.answer,
          sortOrder: parsed.sortOrder,
          published: parsed.published,
          relatedTo: parsed.relatedTo,
          relatedLabel: parsed.relatedLabel,
        });
        setItems(sortFaqItems([...items, persistedFaqItem(created.item)]));
      }
      setIsAddOpen(false);
      setForm(emptyForm());
      setFormError('');
    } catch (err) {
      setFormError(apiMessage(err, 'Could not save FAQ'));
    }
  };

  const handleEdit = async () => {
    if (!selected) return;
    const parsed = parseForm();
    if (!parsed) return;
    try {
      if (isMockApi()) {
        const nextItems = sortFaqItems(items.map((row) => (row.id === selected.id ? parsed : row)));
        setItems(nextItems);
        persistMock(meta, nextItems);
      } else {
        const { id, ...body } = parsed;
        const updated = await updateFaqItem(id, body);
        setItems(
          sortFaqItems(items.map((row) => (row.id === id ? persistedFaqItem(updated.item) : row))),
        );
      }
      setIsEditOpen(false);
      setSelected(null);
      setFormError('');
    } catch (err) {
      setFormError(apiMessage(err, 'Could not save FAQ'));
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    try {
      if (isMockApi()) {
        const nextItems = items.filter((row) => row.id !== selected.id);
        setItems(nextItems);
        persistMock(meta, nextItems);
      } else {
        await deleteFaqItem(selected.id);
        setItems(items.filter((row) => row.id !== selected.id));
      }
      setIsDeleteOpen(false);
      setSelected(null);
    } catch (err) {
      setFormError(apiMessage(err, 'Could not delete FAQ'));
    }
  };

  const fields = (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-fg-secondary" htmlFor="faq-category">
        Category
      </label>
      <select
        id="faq-category"
        className="input-base"
        value={form.category}
        disabled={!canWriteSettings}
        onChange={(e) => setForm({ ...form, category: e.target.value as FaqCategory })}
      >
        {FAQ_CATEGORIES.map((category) => (
          <option key={category} value={category}>
            {FAQ_CATEGORY_LABELS[category]}
          </option>
        ))}
      </select>
      <Input
        label="Question (EN)"
        value={form.questionEn}
        onChange={(e) => setForm({ ...form, questionEn: e.target.value })}
        disabled={!canWriteSettings}
      />
      <Input
        label="Question (MM)"
        value={form.questionMm}
        onChange={(e) => setForm({ ...form, questionMm: e.target.value })}
        disabled={!canWriteSettings}
      />
      <label className="block text-sm font-medium text-fg-secondary" htmlFor="faq-answer-en">
        Answer (EN)
      </label>
      <textarea
        id="faq-answer-en"
        className="input-base min-h-24"
        value={form.answerEn}
        disabled={!canWriteSettings}
        onChange={(e) => setForm({ ...form, answerEn: e.target.value })}
      />
      <label className="block text-sm font-medium text-fg-secondary" htmlFor="faq-answer-mm">
        Answer (MM)
      </label>
      <textarea
        id="faq-answer-mm"
        className="input-base min-h-24"
        value={form.answerMm}
        disabled={!canWriteSettings}
        onChange={(e) => setForm({ ...form, answerMm: e.target.value })}
      />
      <label className="block text-sm font-medium text-fg-secondary" htmlFor="faq-related">
        Related path
      </label>
      <select
        id="faq-related"
        className="input-base"
        value={form.relatedTo}
        disabled={!canWriteSettings}
        onChange={(e) => setForm({ ...form, relatedTo: e.target.value })}
      >
        <option value="">None</option>
        {FAQ_RELATED_PATHS.map((path) => (
          <option key={path} value={path}>
            {path}
          </option>
        ))}
      </select>
      {form.relatedTo ? (
        <>
          <Input
            label="Related label (EN)"
            value={form.relatedLabelEn}
            onChange={(e) => setForm({ ...form, relatedLabelEn: e.target.value })}
            disabled={!canWriteSettings}
          />
          <Input
            label="Related label (MM)"
            value={form.relatedLabelMm}
            onChange={(e) => setForm({ ...form, relatedLabelMm: e.target.value })}
            disabled={!canWriteSettings}
          />
        </>
      ) : null}
      <Input
        label="Sort order"
        value={form.sortOrder}
        onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
        disabled={!canWriteSettings}
      />
      <Toggle
        label="Published"
        checked={form.published}
        onChange={(published) => setForm({ ...form, published })}
        disabled={!canWriteSettings}
      />
      {formError ? <p className="text-sm text-red-600">{formError}</p> : null}
    </div>
  );

  if (loading) return <FaqPageSkeleton />;

  return (
    <>
      <PageSEO.Faq />
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-fg">FAQ</h1>
            <p className="mt-1 text-sm text-fg-secondary">
              Copy for reader /faq. Saves can reach reader /faq when the portal persist is on.
            </p>
          </div>
          {canWriteSettings ? (
            <Button
              type="button"
              onClick={() => {
                setSelected(null);
                setForm(emptyForm());
                setFormError('');
                setIsAddOpen(true);
              }}
            >
              <Plus className="mr-1 h-4 w-4" />
              Add FAQ
            </Button>
          ) : null}
        </div>

        {error ? <LaneStatus message="FAQ request failed." onRetry={() => void load()} /> : null}

        <Card>
          {showEmpty && items.length === 0 ? (
            <EmptyState
              icon={<MessageCircleQuestion className="h-8 w-8 text-fg-muted" />}
              title="No FAQ items"
              description="Empty FAQ is honest. Add a question when one exists."
            />
          ) : showEmpty ? (
            <ul className="divide-y divide-line">
              {items.map((row) => (
                <li key={row.id} className="flex items-start justify-between gap-3 py-3">
                  <div>
                    <p className="font-medium text-fg">{row.question.en}</p>
                    <p className="text-sm text-fg-secondary">
                      {row.id} · {FAQ_CATEGORY_LABELS[row.category]}
                    </p>
                  </div>
                  {canWriteSettings ? (
                    <div className="flex gap-1">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        aria-label={`Edit ${row.question.en}`}
                        onClick={() => {
                          setSelected(row);
                          setForm({
                            category: row.category,
                            questionEn: row.question.en,
                            questionMm: row.question.mm,
                            answerEn: row.answer.en,
                            answerMm: row.answer.mm,
                            relatedTo: row.relatedTo ?? '',
                            relatedLabelEn: row.relatedLabel?.en ?? '',
                            relatedLabelMm: row.relatedLabel?.mm ?? '',
                            sortOrder: String(row.sortOrder),
                            published: row.published,
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
                        aria-label={`Delete ${row.question.en}`}
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

      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add FAQ" size="lg">
        {fields}
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={() => setIsAddOpen(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={() => void handleAdd()}>
            Save
          </Button>
        </div>
      </Modal>
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit FAQ" size="lg">
        {fields}
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={() => setIsEditOpen(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={() => void handleEdit()}>
            Save
          </Button>
        </div>
      </Modal>
      <Modal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="Delete FAQ">
        <p className="text-sm text-fg-secondary">Delete {selected?.question.en}?</p>
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

export default FaqPage;
