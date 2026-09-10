import { useEffect, useMemo, useState } from 'react';
import {
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Image as ImageIcon,
  Compass,
  Users,
} from 'lucide-react';
import {
  Card,
  Button,
  Input,
  Modal,
  PageSEO,
  EmptyState,
  NoSearchResults,
  Toggle,
  LaneStatus,
} from '../../components';
import MediaPicker from '../../components/MediaPicker/MediaPicker';
import type { MediaFile } from '../../components/MediaPicker/MediaPicker';
import { useAuth } from '@/features/auth/useAuth';
import { useStaffAccess } from '@/lib/auth/staffAccess';
import { appendActivityLog } from '@/lib/activityLog';
import { useData } from '@/lib/DataContext';
import type { AboutHistory, AboutTeamMember } from '../../types';
import AboutPageSkeleton from './components/AboutPageSkeleton';
import {
  groupHistoriesByYear,
  monthLabel,
  MONTH_LABELS,
  nextAboutHistoryId,
  persistedHistory,
  stripNonFirstPhotos,
  wouldBeFirstPublished,
} from '@/lib/aboutHistory';
import { apiMessage, isMockApi } from '@/lib/api/http';
import {
  createAboutHistory,
  deleteAboutHistory,
  updateAboutHistory,
  type AboutHistoryWriteBody,
} from '@/lib/api/aboutHistory';
import {
  createAboutTeamMember,
  deleteAboutTeamMember,
  updateAboutTeamMember,
  updateAboutTeamMeta,
  type AboutTeamMemberWriteBody,
} from '@/lib/api/aboutTeam';
import { nextAboutTeamMemberId, persistedMember, sortMembers } from '@/lib/aboutTeam';
import { useOpenCreateQuery } from '@/lib/commands';

type HistoryFormState = {
  year: string;
  month: string;
  titleEn: string;
  titleMm: string;
  descriptionEn: string;
  descriptionMm: string;
  sortOrder: string;
  published: boolean;
  photoUrl: string;
};

const emptyForm = (): HistoryFormState => ({
  year: '2026',
  month: '1',
  titleEn: '',
  titleMm: '',
  descriptionEn: '',
  descriptionMm: '',
  sortOrder: '0',
  published: true,
  photoUrl: '',
});

const DRAFT_ID = '__draft__';

const HistoryFormFields = ({
  formData,
  setFormData,
  isEdit,
  photoEligible,
  onOpenMedia,
}: {
  formData: HistoryFormState;
  setFormData: (next: HistoryFormState) => void;
  isEdit: boolean;
  photoEligible: boolean;
  onOpenMedia: () => void;
}) => (
  <>
    <div className="grid gap-4 sm:grid-cols-2">
      <Input
        label="Year"
        type="number"
        min={1000}
        max={9999}
        value={formData.year}
        onChange={(e) => setFormData({ ...formData, year: e.target.value })}
        required
      />
      <div>
        <label
          htmlFor={`${isEdit ? 'edit' : 'add'}-history-month`}
          className="mb-1.5 block text-sm font-medium text-fg-secondary"
        >
          Month
        </label>
        <select
          id={`${isEdit ? 'edit' : 'add'}-history-month`}
          value={formData.month}
          onChange={(e) => setFormData({ ...formData, month: e.target.value })}
          className="input-base"
        >
          {MONTH_LABELS.map((label, index) => (
            <option key={label} value={String(index + 1)}>
              {label}
            </option>
          ))}
        </select>
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
      required
    />
    <div>
      <label
        htmlFor={`${isEdit ? 'edit' : 'add'}-history-desc-en`}
        className="mb-1.5 block text-sm font-medium text-fg-secondary"
      >
        Description (EN)
      </label>
      <textarea
        id={`${isEdit ? 'edit' : 'add'}-history-desc-en`}
        value={formData.descriptionEn}
        onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
        rows={3}
        className="input-base"
        required
      />
    </div>
    <div>
      <label
        htmlFor={`${isEdit ? 'edit' : 'add'}-history-desc-mm`}
        className="mb-1.5 block text-sm font-medium text-fg-secondary"
      >
        Description (MM)
      </label>
      <textarea
        id={`${isEdit ? 'edit' : 'add'}-history-desc-mm`}
        value={formData.descriptionMm}
        onChange={(e) => setFormData({ ...formData, descriptionMm: e.target.value })}
        rows={3}
        className="input-base"
        required
      />
    </div>
    <Input
      label="Sort order"
      type="number"
      min={0}
      value={formData.sortOrder}
      onChange={(e) => setFormData({ ...formData, sortOrder: e.target.value })}
    />
    <Toggle
      checked={formData.published}
      label="Published"
      description="Unpublished rows stay on this desk only."
      onChange={(published) => setFormData({ ...formData, published })}
    />
    <div>
      <p className="mb-1.5 text-sm font-medium text-fg-secondary">Photo</p>
      {photoEligible ? (
        <div className="flex items-start gap-4">
          <button
            type="button"
            className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-line-strong bg-gray-50 transition-colors hover:border-primary-400"
            onClick={onOpenMedia}
            aria-label="Choose history photo"
          >
            {formData.photoUrl ? (
              <img src={formData.photoUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <ImageIcon className="h-8 w-8 text-fg-muted" />
            )}
          </button>
          <div className="flex-1">
            <Button type="button" variant="outline" size="sm" onClick={onOpenMedia}>
              Choose from Media
            </Button>
            {formData.photoUrl ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="ml-2"
                onClick={() => setFormData({ ...formData, photoUrl: '' })}
              >
                Remove
              </Button>
            ) : null}
            <p className="mt-2 text-sm text-fg-muted">
              Only the first published entry of this year can have a photo.
            </p>
          </div>
        </div>
      ) : (
        <p className="text-sm text-fg-muted">
          A photo is only allowed on the first published entry of this year (earliest month, then
          sort order).
        </p>
      )}
    </div>
  </>
);

type MemberFormState = {
  nameEn: string;
  nameMm: string;
  roleEn: string;
  roleMm: string;
  sortOrder: string;
  published: boolean;
  photoUrl: string;
};

const emptyMemberForm = (): MemberFormState => ({
  nameEn: '',
  nameMm: '',
  roleEn: '',
  roleMm: '',
  sortOrder: '0',
  published: true,
  photoUrl: '',
});

const MemberFormFields = ({
  formData,
  setFormData,
  onOpenMedia,
}: {
  formData: MemberFormState;
  setFormData: (next: MemberFormState) => void;
  onOpenMedia: () => void;
}) => (
  <>
    <Input
      label="Name (EN)"
      value={formData.nameEn}
      onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
      required
    />
    <Input
      label="Name (MM)"
      value={formData.nameMm}
      onChange={(e) => setFormData({ ...formData, nameMm: e.target.value })}
      required
    />
    <Input
      label="Role (EN)"
      value={formData.roleEn}
      onChange={(e) => setFormData({ ...formData, roleEn: e.target.value })}
      required
    />
    <Input
      label="Role (MM)"
      value={formData.roleMm}
      onChange={(e) => setFormData({ ...formData, roleMm: e.target.value })}
      required
    />
    <Input
      label="Sort order"
      type="number"
      min={0}
      value={formData.sortOrder}
      onChange={(e) => setFormData({ ...formData, sortOrder: e.target.value })}
    />
    <Toggle
      checked={formData.published}
      label="Published"
      description="Unpublished rows stay on this desk only."
      onChange={(published) => setFormData({ ...formData, published })}
    />
    <div>
      <p className="mb-1.5 text-sm font-medium text-fg-secondary">Photo</p>
      <div className="flex items-start gap-4">
        <button
          type="button"
          className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-line-strong bg-gray-50 transition-colors hover:border-primary-400"
          onClick={onOpenMedia}
          aria-label="Choose member photo"
        >
          {formData.photoUrl ? (
            <img src={formData.photoUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <ImageIcon className="h-8 w-8 text-fg-muted" />
          )}
        </button>
        <div className="flex-1">
          <Button type="button" variant="outline" size="sm" onClick={onOpenMedia}>
            Choose from Media
          </Button>
          {formData.photoUrl ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="ml-2"
              onClick={() => setFormData({ ...formData, photoUrl: '' })}
            >
              Remove
            </Button>
          ) : null}
          <p className="mt-2 text-sm text-fg-muted">Every member may have a photo.</p>
        </div>
      </div>
    </div>
  </>
);

const AboutPage = () => {
  const { user } = useAuth();
  const { canWriteSettings } = useStaffAccess();
  const {
    aboutHistories,
    setAboutHistories,
    aboutTeamMembers,
    setAboutTeamMembers,
    aboutTeamMeta,
    setAboutTeamMeta,
    setActivityLogs,
    aboutLoading,
    aboutError,
    reloadCatalog,
    retry,
  } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [isEditMemberModalOpen, setIsEditMemberModalOpen] = useState(false);
  const [isDeleteMemberModalOpen, setIsDeleteMemberModalOpen] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState<AboutHistory | null>(null);
  const [selectedMember, setSelectedMember] = useState<AboutTeamMember | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [openMemberMenuId, setOpenMemberMenuId] = useState<string | null>(null);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [mediaTarget, setMediaTarget] = useState<'history' | 'member'>('history');
  const [formData, setFormData] = useState<HistoryFormState>(emptyForm);
  const [memberFormData, setMemberFormData] = useState<MemberFormState>(emptyMemberForm);
  const [formError, setFormError] = useState('');
  const [memberFormError, setMemberFormError] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [memberDeleteError, setMemberDeleteError] = useState('');
  const [metaError, setMetaError] = useState('');
  const [metaForm, setMetaForm] = useState({
    deckEn: aboutTeamMeta.deck.en,
    deckMm: aboutTeamMeta.deck.mm,
    standInNoteEn: aboutTeamMeta.standInNote.en,
    standInNoteMm: aboutTeamMeta.standInNote.mm,
    standInVisible: aboutTeamMeta.standInVisible,
  });

  useEffect(() => {
    setMetaForm({
      deckEn: aboutTeamMeta.deck.en,
      deckMm: aboutTeamMeta.deck.mm,
      standInNoteEn: aboutTeamMeta.standInNote.en,
      standInNoteMm: aboutTeamMeta.standInNote.mm,
      standInVisible: aboutTeamMeta.standInVisible,
    });
  }, [aboutTeamMeta]);

  useOpenCreateQuery(() => setIsAddModalOpen(true), canWriteSettings && !aboutLoading);
  useOpenCreateQuery(
    () => setIsAddMemberModalOpen(true),
    canWriteSettings && !aboutLoading,
    'member',
  );

  const formCandidate = useMemo(
    () => ({
      id: selectedHistory?.id ?? DRAFT_ID,
      year: Number.parseInt(formData.year, 10) || 0,
      month: Number.parseInt(formData.month, 10) || 0,
      sortOrder: Number.parseInt(formData.sortOrder, 10) || 0,
      published: formData.published,
    }),
    [formData, selectedHistory],
  );

  const photoEligible = wouldBeFirstPublished(aboutHistories, formCandidate);

  const filtered = aboutHistories.filter((row) => {
    const haystack =
      `${row.year} ${monthLabel(row.month)} ${row.title.en} ${row.title.mm} ${row.description.en} ${row.description.mm}`.toLowerCase();
    return haystack.includes(searchQuery.toLowerCase());
  });
  const yearGroups = groupHistoriesByYear(filtered);
  const sortedMembers = sortMembers(aboutTeamMembers);
  const filteredMembers = sortedMembers.filter((row) => {
    const haystack = `${row.name.en} ${row.name.mm} ${row.role.en} ${row.role.mm}`.toLowerCase();
    return haystack.includes(memberSearchQuery.toLowerCase());
  });

  const formComplete =
    formData.titleEn.trim() !== '' &&
    formData.titleMm.trim() !== '' &&
    formData.descriptionEn.trim() !== '' &&
    formData.descriptionMm.trim() !== '';

  const handlePhotoSelect = (files: MediaFile[]) => {
    const url = files[0]?.url?.trim() ?? '';
    if (url.startsWith('blob:')) {
      const message = 'Choose a saved media file, not a local blob.';
      if (mediaTarget === 'member') setMemberFormError(message);
      else setFormError(message);
      setIsMediaPickerOpen(false);
      return;
    }
    if (url) {
      if (mediaTarget === 'member') {
        setMemberFormData((prev) => ({ ...prev, photoUrl: url }));
      } else {
        setFormData((prev) => ({ ...prev, photoUrl: url }));
      }
    }
    setIsMediaPickerOpen(false);
  };

  const readFormHistory = (id: string): AboutHistory | null => {
    const year = Number.parseInt(formData.year, 10);
    const month = Number.parseInt(formData.month, 10);
    const sortOrder = Number.parseInt(formData.sortOrder, 10);
    if (!Number.isInteger(year) || year < 1000 || year > 9999) {
      setFormError('Year must be a four-digit integer.');
      return null;
    }
    if (!Number.isInteger(month) || month < 1 || month > 12) {
      setFormError('Month must be from 1 to 12.');
      return null;
    }
    if (!Number.isInteger(sortOrder) || sortOrder < 0) {
      setFormError('Sort order must be an integer of 0 or more.');
      return null;
    }
    const titleEn = formData.titleEn.trim();
    const titleMm = formData.titleMm.trim();
    const descriptionEn = formData.descriptionEn.trim();
    const descriptionMm = formData.descriptionMm.trim();
    if (!titleEn || !titleMm) {
      setFormError('Title must include English and Myanmar.');
      return null;
    }
    if (!descriptionEn || !descriptionMm) {
      setFormError('Description must include English and Myanmar.');
      return null;
    }
    const photoUrl = photoEligible ? formData.photoUrl.trim() : '';
    if (photoUrl.startsWith('blob:')) {
      setFormError('Photo cannot be a blob URL.');
      return null;
    }
    return persistedHistory({
      id,
      year,
      month,
      title: { en: titleEn, mm: titleMm },
      description: { en: descriptionEn, mm: descriptionMm },
      sortOrder,
      published: formData.published,
      photoUrl: photoUrl || undefined,
    });
  };

  const writeBody = (row: AboutHistory): AboutHistoryWriteBody => ({
    year: row.year,
    month: row.month,
    title: row.title,
    description: row.description,
    sortOrder: row.sortOrder,
    published: row.published,
    photoUrl: row.photoUrl ?? '',
  });

  const persistHistory = (updated: AboutHistory, isCreate: boolean) => {
    if (!canWriteSettings) return;
    const nextList = isCreate
      ? [...aboutHistories, updated]
      : aboutHistories.map((row) => (row.id === updated.id ? updated : row));
    setAboutHistories(
      stripNonFirstPhotos(
        nextList,
        nextList.map((row) => row.year),
      ),
    );
    appendActivityLog(setActivityLogs, {
      action: isCreate ? 'create' : 'update',
      targetType: 'about-history',
      targetId: updated.id,
      targetName: updated.title,
      admin: user,
    });
  };

  const handleAdd = async () => {
    if (!canWriteSettings) return;
    const created = readFormHistory(isMockApi() ? nextAboutHistoryId(aboutHistories) : DRAFT_ID);
    if (!created) return;
    if (!isMockApi()) {
      try {
        const { history } = await createAboutHistory(writeBody(created));
        await reloadCatalog();
        appendActivityLog(setActivityLogs, {
          action: 'create',
          targetType: 'about-history',
          targetId: history.id,
          targetName: history.title,
          admin: user,
        });
        setIsAddModalOpen(false);
        resetForm();
      } catch (err) {
        setFormError(apiMessage(err, 'Could not save history'));
      }
      return;
    }
    persistHistory(created, true);
    setIsAddModalOpen(false);
    resetForm();
  };

  const handleEdit = async () => {
    if (!canWriteSettings || !selectedHistory) return;
    const updated = readFormHistory(selectedHistory.id);
    if (!updated) return;
    if (!isMockApi()) {
      try {
        await updateAboutHistory(selectedHistory.id, writeBody(updated));
        await reloadCatalog();
        appendActivityLog(setActivityLogs, {
          action: 'update',
          targetType: 'about-history',
          targetId: selectedHistory.id,
          targetName: updated.title,
          admin: user,
        });
        setIsEditModalOpen(false);
        resetForm();
      } catch (err) {
        setFormError(apiMessage(err, 'Could not save history'));
      }
      return;
    }
    persistHistory(updated, false);
    setIsEditModalOpen(false);
    resetForm();
  };

  const handleDelete = async () => {
    if (!canWriteSettings || !selectedHistory) return;
    if (!isMockApi()) {
      try {
        await deleteAboutHistory(selectedHistory.id);
        await reloadCatalog();
        appendActivityLog(setActivityLogs, {
          action: 'delete',
          targetType: 'about-history',
          targetId: selectedHistory.id,
          targetName: selectedHistory.title,
          admin: user,
        });
        setIsDeleteModalOpen(false);
        setSelectedHistory(null);
        setDeleteError('');
      } catch (err) {
        setDeleteError(apiMessage(err, 'Could not delete history'));
      }
      return;
    }
    const remaining = aboutHistories.filter((row) => row.id !== selectedHistory.id);
    setAboutHistories(
      stripNonFirstPhotos(
        remaining,
        remaining.map((row) => row.year),
      ),
    );
    appendActivityLog(setActivityLogs, {
      action: 'delete',
      targetType: 'about-history',
      targetId: selectedHistory.id,
      targetName: selectedHistory.title,
      admin: user,
    });
    setIsDeleteModalOpen(false);
    setSelectedHistory(null);
  };

  const openEditModal = (row: AboutHistory) => {
    setSelectedHistory(row);
    setFormData({
      year: String(row.year),
      month: String(row.month),
      titleEn: row.title.en,
      titleMm: row.title.mm,
      descriptionEn: row.description.en,
      descriptionMm: row.description.mm,
      sortOrder: String(row.sortOrder),
      published: row.published,
      photoUrl: row.photoUrl ?? '',
    });
    setFormError('');
    setIsEditModalOpen(true);
    setOpenMenuId(null);
  };

  const openDeleteModal = (row: AboutHistory) => {
    setSelectedHistory(row);
    setDeleteError('');
    setIsDeleteModalOpen(true);
    setOpenMenuId(null);
  };

  const resetForm = () => {
    setFormData(emptyForm());
    setSelectedHistory(null);
    setFormError('');
  };

  const resetMemberForm = () => {
    setMemberFormData(emptyMemberForm());
    setSelectedMember(null);
    setMemberFormError('');
  };

  const memberFormComplete =
    memberFormData.nameEn.trim() !== '' &&
    memberFormData.nameMm.trim() !== '' &&
    memberFormData.roleEn.trim() !== '' &&
    memberFormData.roleMm.trim() !== '';

  const metaFormComplete =
    metaForm.deckEn.trim() !== '' &&
    metaForm.deckMm.trim() !== '' &&
    metaForm.standInNoteEn.trim() !== '' &&
    metaForm.standInNoteMm.trim() !== '';

  const readFormMember = (id: string): AboutTeamMember | null => {
    const sortOrder = Number.parseInt(memberFormData.sortOrder, 10);
    if (!Number.isInteger(sortOrder) || sortOrder < 0) {
      setMemberFormError('Sort order must be an integer of 0 or more.');
      return null;
    }
    const nameEn = memberFormData.nameEn.trim();
    const nameMm = memberFormData.nameMm.trim();
    const roleEn = memberFormData.roleEn.trim();
    const roleMm = memberFormData.roleMm.trim();
    if (!nameEn || !nameMm) {
      setMemberFormError('Name must include English and Myanmar.');
      return null;
    }
    if (!roleEn || !roleMm) {
      setMemberFormError('Role must include English and Myanmar.');
      return null;
    }
    const photoUrl = memberFormData.photoUrl.trim();
    if (photoUrl.startsWith('blob:')) {
      setMemberFormError('Photo cannot be a blob URL.');
      return null;
    }
    return persistedMember({
      id,
      name: { en: nameEn, mm: nameMm },
      role: { en: roleEn, mm: roleMm },
      sortOrder,
      published: memberFormData.published,
      photoUrl: photoUrl || undefined,
    });
  };

  const memberWriteBody = (row: AboutTeamMember): AboutTeamMemberWriteBody => ({
    name: row.name,
    role: row.role,
    sortOrder: row.sortOrder,
    published: row.published,
    photoUrl: row.photoUrl ?? '',
  });

  const persistMember = (updated: AboutTeamMember, isCreate: boolean) => {
    if (!canWriteSettings) return;
    const nextList = isCreate
      ? [...aboutTeamMembers, updated]
      : aboutTeamMembers.map((row) => (row.id === updated.id ? updated : row));
    setAboutTeamMembers(sortMembers(nextList));
    appendActivityLog(setActivityLogs, {
      action: isCreate ? 'create' : 'update',
      targetType: 'about-team',
      targetId: updated.id,
      targetName: updated.name,
      admin: user,
    });
  };

  const handleAddMember = async () => {
    if (!canWriteSettings) return;
    const created = readFormMember(
      isMockApi() ? nextAboutTeamMemberId(aboutTeamMembers) : DRAFT_ID,
    );
    if (!created) return;
    if (!isMockApi()) {
      try {
        const { member } = await createAboutTeamMember(memberWriteBody(created));
        await reloadCatalog();
        appendActivityLog(setActivityLogs, {
          action: 'create',
          targetType: 'about-team',
          targetId: member.id,
          targetName: member.name,
          admin: user,
        });
        setIsAddMemberModalOpen(false);
        resetMemberForm();
      } catch (err) {
        setMemberFormError(apiMessage(err, 'Could not save member'));
      }
      return;
    }
    persistMember(created, true);
    setIsAddMemberModalOpen(false);
    resetMemberForm();
  };

  const handleEditMember = async () => {
    if (!canWriteSettings || !selectedMember) return;
    const updated = readFormMember(selectedMember.id);
    if (!updated) return;
    if (!isMockApi()) {
      try {
        await updateAboutTeamMember(selectedMember.id, memberWriteBody(updated));
        await reloadCatalog();
        appendActivityLog(setActivityLogs, {
          action: 'update',
          targetType: 'about-team',
          targetId: selectedMember.id,
          targetName: updated.name,
          admin: user,
        });
        setIsEditMemberModalOpen(false);
        resetMemberForm();
      } catch (err) {
        setMemberFormError(apiMessage(err, 'Could not save member'));
      }
      return;
    }
    persistMember(updated, false);
    setIsEditMemberModalOpen(false);
    resetMemberForm();
  };

  const handleDeleteMember = async () => {
    if (!canWriteSettings || !selectedMember) return;
    if (!isMockApi()) {
      try {
        await deleteAboutTeamMember(selectedMember.id);
        await reloadCatalog();
        appendActivityLog(setActivityLogs, {
          action: 'delete',
          targetType: 'about-team',
          targetId: selectedMember.id,
          targetName: selectedMember.name,
          admin: user,
        });
        setIsDeleteMemberModalOpen(false);
        setSelectedMember(null);
        setMemberDeleteError('');
      } catch (err) {
        setMemberDeleteError(apiMessage(err, 'Could not delete member'));
      }
      return;
    }
    setAboutTeamMembers(aboutTeamMembers.filter((row) => row.id !== selectedMember.id));
    appendActivityLog(setActivityLogs, {
      action: 'delete',
      targetType: 'about-team',
      targetId: selectedMember.id,
      targetName: selectedMember.name,
      admin: user,
    });
    setIsDeleteMemberModalOpen(false);
    setSelectedMember(null);
  };

  const handleSaveMeta = async () => {
    if (!canWriteSettings) return;
    const deckEn = metaForm.deckEn.trim();
    const deckMm = metaForm.deckMm.trim();
    const standInNoteEn = metaForm.standInNoteEn.trim();
    const standInNoteMm = metaForm.standInNoteMm.trim();
    if (!deckEn || !deckMm) {
      setMetaError('Deck must include English and Myanmar.');
      return;
    }
    if (!standInNoteEn || !standInNoteMm) {
      setMetaError('Stand-in note must include English and Myanmar.');
      return;
    }
    const nextMeta = {
      deck: { en: deckEn, mm: deckMm },
      standInNote: { en: standInNoteEn, mm: standInNoteMm },
      standInVisible: metaForm.standInVisible,
    };
    if (!isMockApi()) {
      try {
        await updateAboutTeamMeta(nextMeta);
        await reloadCatalog();
        appendActivityLog(setActivityLogs, {
          action: 'update',
          targetType: 'about-team',
          targetId: 'about-team',
          targetName: { en: 'Team page', mm: 'Team page' },
          admin: user,
        });
        setMetaError('');
      } catch (err) {
        setMetaError(apiMessage(err, 'Could not save team page'));
      }
      return;
    }
    setAboutTeamMeta(nextMeta);
    appendActivityLog(setActivityLogs, {
      action: 'update',
      targetType: 'about-team',
      targetId: 'about-team',
      targetName: { en: 'Team page', mm: 'Team page' },
      admin: user,
    });
    setMetaError('');
  };

  const openEditMemberModal = (row: AboutTeamMember) => {
    setSelectedMember(row);
    setMemberFormData({
      nameEn: row.name.en,
      nameMm: row.name.mm,
      roleEn: row.role.en,
      roleMm: row.role.mm,
      sortOrder: String(row.sortOrder),
      published: row.published,
      photoUrl: row.photoUrl ?? '',
    });
    setMemberFormError('');
    setIsEditMemberModalOpen(true);
    setOpenMemberMenuId(null);
  };

  const openDeleteMemberModal = (row: AboutTeamMember) => {
    setSelectedMember(row);
    setMemberDeleteError('');
    setIsDeleteMemberModalOpen(true);
    setOpenMemberMenuId(null);
  };

  const formFields = (
    <HistoryFormFields
      formData={formData}
      setFormData={setFormData}
      isEdit={isEditModalOpen}
      photoEligible={photoEligible}
      onOpenMedia={() => {
        setMediaTarget('history');
        setIsMediaPickerOpen(true);
      }}
    />
  );

  const memberFields = (
    <MemberFormFields
      formData={memberFormData}
      setFormData={setMemberFormData}
      onOpenMedia={() => {
        setMediaTarget('member');
        setIsMediaPickerOpen(true);
      }}
    />
  );

  return (
    <>
      <PageSEO.About />
      {aboutLoading ? (
        <AboutPageSkeleton />
      ) : aboutError ? (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-fg">About</h1>
            <p className="mt-1 text-fg-muted">
              Timeline and team CMS for reader About. Super Admin and Admin can write. This desk
              does not change reader /about until website 205–207.
            </p>
          </div>
          <LaneStatus message="About request failed." onRetry={retry} />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-fg">About</h1>
              <p className="mt-1 text-fg-muted">
                Timeline and team CMS for reader About. Super Admin and Admin can write. This desk
                does not change reader /about until website 205–207.
              </p>
            </div>
            {canWriteSettings ? (
              <Button
                leftIcon={<Plus className="h-4 w-4" />}
                onClick={() => setIsAddModalOpen(true)}
              >
                Add history
              </Button>
            ) : null}
          </div>

          <Card>
            <div className="mb-6">
              <Input
                placeholder="Search history..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="h-5 w-5" />}
              />
            </div>

            <div className="space-y-8">
              {yearGroups.map((group) => (
                <section key={group.year}>
                  <h2 className="mb-3 text-lg font-semibold text-fg">{group.year}</h2>
                  <ul className="divide-y divide-line rounded-lg border border-line">
                    {group.items.map((row) => (
                      <li key={row.id} className="flex items-start gap-4 p-4">
                        {row.photoUrl ? (
                          <img
                            src={row.photoUrl}
                            alt=""
                            className="h-16 w-16 flex-shrink-0 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg bg-gray-50 text-fg-muted">
                            <Compass className="h-6 w-6" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium uppercase tracking-wide text-fg-muted">
                            {monthLabel(row.month)}
                            {row.published ? null : ' · Unpublished'}
                          </p>
                          <p className="font-medium text-fg">{row.title.en}</p>
                          <p className="text-sm text-fg-secondary">{row.title.mm}</p>
                          <p className="mt-1 line-clamp-2 text-sm text-fg-muted">
                            {row.description.en}
                          </p>
                        </div>
                        {canWriteSettings ? (
                          <div className="relative flex-shrink-0">
                            <button
                              type="button"
                              title="History actions"
                              aria-label="History actions menu"
                              onClick={() => setOpenMenuId(openMenuId === row.id ? null : row.id)}
                              className="rounded-lg p-2 text-fg-muted transition-colors hover:bg-gray-100 hover:text-fg-secondary"
                            >
                              <MoreVertical className="h-5 w-5" />
                            </button>
                            {openMenuId === row.id ? (
                              <div className="absolute right-0 z-10 mt-2 w-40 rounded-lg border border-line bg-white py-1 shadow-lg">
                                <button
                                  type="button"
                                  onClick={() => openEditModal(row)}
                                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-fg-secondary hover:bg-gray-50"
                                >
                                  <Edit className="h-4 w-4" />
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => openDeleteModal(row)}
                                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Delete
                                </button>
                              </div>
                            ) : null}
                          </div>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>

            {aboutHistories.length === 0 ? (
              <EmptyState
                icon={<Compass className="h-8 w-8 text-fg-muted" />}
                title="No history yet"
                description="Add a year and month for the About timeline."
                action={
                  canWriteSettings
                    ? { label: 'Add history', onClick: () => setIsAddModalOpen(true) }
                    : undefined
                }
              />
            ) : filtered.length === 0 ? (
              <NoSearchResults query={searchQuery} onClear={() => setSearchQuery('')} />
            ) : null}
          </Card>

          <Card>
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-fg">Team</h2>
                <p className="mt-1 text-sm text-fg-muted">
                  Public roster copy. Staff invite stays on Team.
                </p>
              </div>
              {canWriteSettings ? (
                <Button
                  leftIcon={<Plus className="h-4 w-4" />}
                  onClick={() => setIsAddMemberModalOpen(true)}
                >
                  Add member
                </Button>
              ) : null}
            </div>

            <div className="mb-6 space-y-4">
              <Input
                label="Deck (EN)"
                value={metaForm.deckEn}
                onChange={(e) => setMetaForm({ ...metaForm, deckEn: e.target.value })}
                disabled={!canWriteSettings}
                required
              />
              <Input
                label="Deck (MM)"
                value={metaForm.deckMm}
                onChange={(e) => setMetaForm({ ...metaForm, deckMm: e.target.value })}
                disabled={!canWriteSettings}
                required
              />
              <Toggle
                checked={metaForm.standInVisible}
                label="Show stand-in note"
                description="Reader copy until the studio publishes its public roster."
                onChange={(standInVisible) => setMetaForm({ ...metaForm, standInVisible })}
                disabled={!canWriteSettings}
              />
              <Input
                label="Stand-in note (EN)"
                value={metaForm.standInNoteEn}
                onChange={(e) => setMetaForm({ ...metaForm, standInNoteEn: e.target.value })}
                disabled={!canWriteSettings}
                required
              />
              <Input
                label="Stand-in note (MM)"
                value={metaForm.standInNoteMm}
                onChange={(e) => setMetaForm({ ...metaForm, standInNoteMm: e.target.value })}
                disabled={!canWriteSettings}
                required
              />
              {metaError ? <p className="text-sm text-red-600">{metaError}</p> : null}
              {canWriteSettings ? (
                <div className="flex justify-end">
                  <Button
                    type="button"
                    onClick={() => void handleSaveMeta()}
                    disabled={!metaFormComplete}
                  >
                    Save team page
                  </Button>
                </div>
              ) : null}
            </div>

            <div className="mb-6">
              <Input
                placeholder="Search members..."
                value={memberSearchQuery}
                onChange={(e) => setMemberSearchQuery(e.target.value)}
                leftIcon={<Search className="h-5 w-5" />}
              />
            </div>

            {filteredMembers.length > 0 ? (
              <ul className="divide-y divide-line rounded-lg border border-line">
                {filteredMembers.map((row) => (
                  <li key={row.id} className="flex items-start gap-4 p-4">
                    {row.photoUrl ? (
                      <img
                        src={row.photoUrl}
                        alt=""
                        className="h-16 w-16 flex-shrink-0 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg bg-gray-50 text-fg-muted">
                        <Users className="h-6 w-6" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-fg">{row.name.en}</p>
                      <p className="text-sm text-fg-secondary">{row.name.mm}</p>
                      <p className="mt-1 text-sm text-fg-muted">
                        {row.role.en}
                        {row.published ? null : ' · Unpublished'}
                      </p>
                      <p className="text-sm text-fg-muted">{row.role.mm}</p>
                    </div>
                    {canWriteSettings ? (
                      <div className="relative flex-shrink-0">
                        <button
                          type="button"
                          title="Member actions"
                          aria-label="Member actions menu"
                          onClick={() =>
                            setOpenMemberMenuId(openMemberMenuId === row.id ? null : row.id)
                          }
                          className="rounded-lg p-2 text-fg-muted transition-colors hover:bg-gray-100 hover:text-fg-secondary"
                        >
                          <MoreVertical className="h-5 w-5" />
                        </button>
                        {openMemberMenuId === row.id ? (
                          <div className="absolute right-0 z-10 mt-2 w-40 rounded-lg border border-line bg-white py-1 shadow-lg">
                            <button
                              type="button"
                              onClick={() => openEditMemberModal(row)}
                              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-fg-secondary hover:bg-gray-50"
                            >
                              <Edit className="h-4 w-4" />
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => openDeleteMemberModal(row)}
                              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </button>
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : null}

            {aboutTeamMembers.length === 0 ? (
              <EmptyState
                icon={<Users className="h-8 w-8 text-fg-muted" />}
                title="No members yet"
                description="Add a public roster row for the About team."
                action={
                  canWriteSettings
                    ? { label: 'Add member', onClick: () => setIsAddMemberModalOpen(true) }
                    : undefined
                }
              />
            ) : filteredMembers.length === 0 ? (
              <NoSearchResults query={memberSearchQuery} onClear={() => setMemberSearchQuery('')} />
            ) : null}
          </Card>

          <Modal
            isOpen={isAddModalOpen}
            onClose={() => {
              setIsAddModalOpen(false);
              resetForm();
            }}
            title="Add history"
            size="lg"
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void handleAdd();
              }}
              className="space-y-4"
            >
              {formFields}
              {formError ? <p className="text-sm text-red-600">{formError}</p> : null}
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={!formComplete}>
                  Add history
                </Button>
              </div>
            </form>
          </Modal>

          <Modal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              resetForm();
            }}
            title="Edit history"
            size="lg"
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void handleEdit();
              }}
              className="space-y-4"
            >
              {formFields}
              {formError ? <p className="text-sm text-red-600">{formError}</p> : null}
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={!formComplete}>
                  Save Changes
                </Button>
              </div>
            </form>
          </Modal>

          <Modal
            isOpen={isDeleteModalOpen}
            onClose={() => {
              setIsDeleteModalOpen(false);
              setSelectedHistory(null);
            }}
            title="Delete history"
            size="sm"
          >
            <div className="space-y-4">
              <p className="text-fg-secondary">
                Delete <strong>{selectedHistory?.title.en}</strong>? This cannot be undone on this
                desk. Reader About is unchanged until website 205–207.
              </p>
              {deleteError ? <p className="text-sm text-red-600">{deleteError}</p> : null}
              <div className="flex justify-end gap-3">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setSelectedHistory(null);
                  }}
                >
                  Cancel
                </Button>
                <Button variant="danger" onClick={() => void handleDelete()}>
                  Delete
                </Button>
              </div>
            </div>
          </Modal>

          <Modal
            isOpen={isAddMemberModalOpen}
            onClose={() => {
              setIsAddMemberModalOpen(false);
              resetMemberForm();
            }}
            title="Add member"
            size="lg"
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void handleAddMember();
              }}
              className="space-y-4"
            >
              {memberFields}
              {memberFormError ? <p className="text-sm text-red-600">{memberFormError}</p> : null}
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setIsAddMemberModalOpen(false);
                    resetMemberForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={!memberFormComplete}>
                  Add member
                </Button>
              </div>
            </form>
          </Modal>

          <Modal
            isOpen={isEditMemberModalOpen}
            onClose={() => {
              setIsEditMemberModalOpen(false);
              resetMemberForm();
            }}
            title="Edit member"
            size="lg"
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void handleEditMember();
              }}
              className="space-y-4"
            >
              {memberFields}
              {memberFormError ? <p className="text-sm text-red-600">{memberFormError}</p> : null}
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setIsEditMemberModalOpen(false);
                    resetMemberForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={!memberFormComplete}>
                  Save Changes
                </Button>
              </div>
            </form>
          </Modal>

          <Modal
            isOpen={isDeleteMemberModalOpen}
            onClose={() => {
              setIsDeleteMemberModalOpen(false);
              setSelectedMember(null);
            }}
            title="Delete member"
            size="sm"
          >
            <div className="space-y-4">
              <p className="text-fg-secondary">
                Delete <strong>{selectedMember?.name.en}</strong>? This cannot be undone on this
                desk. Reader About is unchanged until website 205–207.
              </p>
              {memberDeleteError ? (
                <p className="text-sm text-red-600">{memberDeleteError}</p>
              ) : null}
              <div className="flex justify-end gap-3">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setIsDeleteMemberModalOpen(false);
                    setSelectedMember(null);
                  }}
                >
                  Cancel
                </Button>
                <Button variant="danger" onClick={() => void handleDeleteMember()}>
                  Delete
                </Button>
              </div>
            </div>
          </Modal>

          <MediaPicker
            isOpen={isMediaPickerOpen}
            onClose={() => setIsMediaPickerOpen(false)}
            onSelect={handlePhotoSelect}
            accept="image"
          />
        </div>
      )}
    </>
  );
};

export default AboutPage;
