import { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Image as ImageIcon,
  PenTool,
} from 'lucide-react';
import {
  Card,
  Button,
  Input,
  Modal,
  PageSEO,
  EmptyState,
  NoSearchResults,
  coverSheenClass,
} from '../../components';
import MediaPicker from '../../components/MediaPicker/MediaPicker';
import type { MediaFile } from '../../components/MediaPicker/MediaPicker';
import { useAuth } from '@/features/auth/useAuth';
import { useStaffAccess } from '@/lib/auth/staffAccess';
import { appendActivityLog } from '@/lib/activityLog';
import { useData } from '@/lib/DataContext';
import type { Author } from '../../types';
import { markIdLoaded } from '@/lib/imageLoaded';
import AuthorsPageSkeleton from './components/AuthorsPageSkeleton';
import {
  assignedSeriesCount,
  canDeleteAuthor,
  cascadeAuthor,
  nextAuthorId,
  withDerivedCount,
} from '@/lib/authors';
import { apiMessage, isMockApi } from '@/lib/api/http';
import { createAuthor, deleteAuthor, updateAuthor } from '@/lib/api/catalog';

type AuthorFormState = {
  nameEn: string;
  nameMm: string;
  bioEn: string;
  bioMm: string;
  avatar: string;
  status: Author['status'];
};

const emptyForm = (): AuthorFormState => ({
  nameEn: '',
  nameMm: '',
  bioEn: '',
  bioMm: '',
  avatar: '',
  status: 'active',
});

const AuthorFormFields = ({
  formData,
  setFormData,
  isEdit,
  onOpenMedia,
}: {
  formData: AuthorFormState;
  setFormData: (next: AuthorFormState) => void;
  isEdit: boolean;
  onOpenMedia: () => void;
}) => (
  <>
    <div>
      <label className="mb-1.5 block text-sm font-medium text-fg-secondary">Avatar</label>
      <div className="flex items-start gap-4">
        <button
          type="button"
          className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-line-strong bg-gray-50 transition-colors hover:border-primary-400"
          onClick={onOpenMedia}
          aria-label="Choose author avatar"
        >
          {formData.avatar ? (
            <img src={formData.avatar} alt="" className="h-full w-full object-cover" />
          ) : (
            <ImageIcon className="h-8 w-8 text-fg-muted" />
          )}
        </button>
        <div className="flex-1">
          <Button type="button" variant="outline" size="sm" onClick={onOpenMedia}>
            Choose from Media
          </Button>
          {formData.avatar && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="ml-2"
              onClick={() => setFormData({ ...formData, avatar: '' })}
            >
              Remove
            </Button>
          )}
        </div>
      </div>
    </div>
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
    />
    <div>
      <label
        htmlFor={`${isEdit ? 'edit' : 'add'}-bio-en`}
        className="mb-1.5 block text-sm font-medium text-fg-secondary"
      >
        Bio (EN)
      </label>
      <textarea
        id={`${isEdit ? 'edit' : 'add'}-bio-en`}
        value={formData.bioEn}
        onChange={(e) => setFormData({ ...formData, bioEn: e.target.value })}
        rows={3}
        className="input-base"
      />
    </div>
    <div>
      <label
        htmlFor={`${isEdit ? 'edit' : 'add'}-bio-mm`}
        className="mb-1.5 block text-sm font-medium text-fg-secondary"
      >
        Bio (MM)
      </label>
      <textarea
        id={`${isEdit ? 'edit' : 'add'}-bio-mm`}
        value={formData.bioMm}
        onChange={(e) => setFormData({ ...formData, bioMm: e.target.value })}
        rows={3}
        className="input-base"
      />
    </div>
    <div>
      <label
        htmlFor={`${isEdit ? 'edit' : 'add'}-author-status`}
        className="mb-1.5 block text-sm font-medium text-fg-secondary"
      >
        Status
      </label>
      <select
        id={`${isEdit ? 'edit' : 'add'}-author-status`}
        value={formData.status}
        onChange={(e) => setFormData({ ...formData, status: e.target.value as Author['status'] })}
        className="input-base"
      >
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>
    </div>
  </>
);

const AuthorsPage = () => {
  const { user } = useAuth();
  const { canWriteCatalog } = useStaffAccess();
  const { authors, setAuthors, webtoons, setWebtoons, setActivityLogs, isLoading, reloadCatalog } =
    useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loadedAvatars, setLoadedAvatars] = useState<Set<string>>(() => new Set());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedAuthor, setSelectedAuthor] = useState<Author | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [formData, setFormData] = useState<AuthorFormState>(emptyForm);
  const [formError, setFormError] = useState('');
  const [deleteError, setDeleteError] = useState('');

  const filteredAuthors = authors.filter((author) => {
    const haystack = `${author.name.en} ${author.name.mm}`.toLowerCase();
    const matchesSearch = haystack.includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || author.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: Author['status']) =>
    status === 'active' ? 'badge-success' : 'bg-gray-100 text-fg';

  const handleAvatarSelect = (files: MediaFile[]) => {
    if (files.length > 0) {
      setFormData({ ...formData, avatar: files[0].url });
    }
    setIsMediaPickerOpen(false);
  };

  const authorWriteBody = () => ({
    name: { en: formData.nameEn.trim(), mm: formData.nameMm },
    bio: formData.bioEn || formData.bioMm ? { en: formData.bioEn, mm: formData.bioMm } : undefined,
    avatar: formData.avatar || undefined,
    status: formData.status,
  });

  const persistAuthor = (updated: Author, isCreate: boolean) => {
    if (!canWriteCatalog) return;
    const nextAuthors = isCreate
      ? [updated, ...authors]
      : authors.map((author) => (author.id === updated.id ? updated : author));
    setAuthors(nextAuthors);
    setWebtoons(cascadeAuthor(webtoons, updated));
    appendActivityLog(setActivityLogs, {
      action: isCreate ? 'create' : 'update',
      targetType: 'author',
      targetId: updated.id,
      targetName: updated.name,
      admin: user,
    });
  };

  const handleAddAuthor = async () => {
    if (!canWriteCatalog) return;
    if (!isMockApi()) {
      try {
        const { author } = await createAuthor(authorWriteBody());
        await reloadCatalog();
        appendActivityLog(setActivityLogs, {
          action: 'create',
          targetType: 'author',
          targetId: author.id,
          targetName: author.name,
          admin: user,
        });
        setIsAddModalOpen(false);
        resetForm();
      } catch (err) {
        setFormError(apiMessage(err, 'Could not save author'));
      }
      return;
    }
    const created: Author = {
      id: nextAuthorId(authors),
      name: { en: formData.nameEn.trim(), mm: formData.nameMm },
      bio:
        formData.bioEn || formData.bioMm ? { en: formData.bioEn, mm: formData.bioMm } : undefined,
      avatar: formData.avatar || undefined,
      status: formData.status,
      followerCount: 0,
      webtoonCount: 0,
    };
    persistAuthor(withDerivedCount(created, webtoons), true);
    setIsAddModalOpen(false);
    resetForm();
  };

  const handleEditAuthor = async () => {
    if (!canWriteCatalog || !selectedAuthor) return;
    if (!isMockApi()) {
      try {
        await updateAuthor(selectedAuthor.id, authorWriteBody());
        await reloadCatalog();
        appendActivityLog(setActivityLogs, {
          action: 'update',
          targetType: 'author',
          targetId: selectedAuthor.id,
          targetName: { en: formData.nameEn.trim(), mm: formData.nameMm },
          admin: user,
        });
        setIsEditModalOpen(false);
        resetForm();
      } catch (err) {
        setFormError(apiMessage(err, 'Could not save author'));
      }
      return;
    }
    const updated = withDerivedCount(
      {
        ...selectedAuthor,
        name: { en: formData.nameEn.trim(), mm: formData.nameMm },
        bio:
          formData.bioEn || formData.bioMm ? { en: formData.bioEn, mm: formData.bioMm } : undefined,
        avatar: formData.avatar || undefined,
        status: formData.status,
      },
      webtoons,
    );
    persistAuthor(updated, false);
    setIsEditModalOpen(false);
    resetForm();
  };

  const handleDeleteAuthor = async () => {
    if (!canWriteCatalog || !selectedAuthor || !canDeleteAuthor(webtoons, selectedAuthor.id))
      return;
    if (!isMockApi()) {
      try {
        await deleteAuthor(selectedAuthor.id);
        await reloadCatalog();
        appendActivityLog(setActivityLogs, {
          action: 'delete',
          targetType: 'author',
          targetId: selectedAuthor.id,
          targetName: selectedAuthor.name,
          admin: user,
        });
        setIsDeleteModalOpen(false);
        setSelectedAuthor(null);
        setDeleteError('');
      } catch (err) {
        setDeleteError(apiMessage(err, 'Could not delete author'));
      }
      return;
    }
    setAuthors(authors.filter((author) => author.id !== selectedAuthor.id));
    appendActivityLog(setActivityLogs, {
      action: 'delete',
      targetType: 'author',
      targetId: selectedAuthor.id,
      targetName: selectedAuthor.name,
      admin: user,
    });
    setIsDeleteModalOpen(false);
    setSelectedAuthor(null);
  };

  const openEditModal = (author: Author) => {
    setSelectedAuthor(author);
    setFormData({
      nameEn: author.name.en,
      nameMm: author.name.mm,
      bioEn: author.bio?.en || '',
      bioMm: author.bio?.mm || '',
      avatar: author.avatar || '',
      status: author.status,
    });
    setIsEditModalOpen(true);
    setOpenMenuId(null);
  };

  const openDeleteModal = (author: Author) => {
    setSelectedAuthor(author);
    setDeleteError('');
    setIsDeleteModalOpen(true);
    setOpenMenuId(null);
  };

  const resetForm = () => {
    setFormData(emptyForm());
    setSelectedAuthor(null);
    setFormError('');
  };

  const formFields = (
    <AuthorFormFields
      formData={formData}
      setFormData={setFormData}
      isEdit={isEditModalOpen}
      onOpenMedia={() => setIsMediaPickerOpen(true)}
    />
  );

  return (
    <>
      <PageSEO.Authors />
      {isLoading ? (
        <AuthorsPageSkeleton />
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-fg">Authors</h1>
              <p className="mt-1 text-fg-muted">Manage catalog creators for the reader site</p>
            </div>
            {canWriteCatalog ? (
              <Button
                leftIcon={<Plus className="h-4 w-4" />}
                onClick={() => setIsAddModalOpen(true)}
              >
                Add Author
              </Button>
            ) : null}
          </div>

          <Card>
            <div className="mb-6 flex flex-col gap-4 sm:flex-row">
              <div className="flex-1">
                <Input
                  placeholder="Search authors..."
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
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-line">
                    <th className="table-header">Author</th>
                    <th className="table-header">Name (MM)</th>
                    <th className="table-header">Status</th>
                    <th className="table-header">Series</th>
                    <th className="table-header text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {filteredAuthors.map((author) => (
                    <tr key={author.id} className="hover:bg-gray-50">
                      <td className="table-cell">
                        <div className="flex items-center gap-3">
                          {author.avatar ? (
                            <div className="relative h-10 w-10 flex-shrink-0">
                              <img
                                src={author.avatar}
                                alt=""
                                className="h-10 w-10 rounded-full object-cover"
                                onLoad={() => markIdLoaded(setLoadedAvatars, author.id)}
                                onError={() => markIdLoaded(setLoadedAvatars, author.id)}
                              />
                              {!loadedAvatars.has(author.id) && (
                                <span className={`${coverSheenClass} rounded-full`} />
                              )}
                            </div>
                          ) : (
                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary-50 text-sm font-bold text-primary-700">
                              {(author.name.en || author.name.mm || '?').charAt(0)}
                            </div>
                          )}
                          <p className="font-medium text-fg">{author.name.en}</p>
                        </div>
                      </td>
                      <td className="table-cell text-fg-secondary">{author.name.mm || '—'}</td>
                      <td className="table-cell">
                        <span className={getStatusBadge(author.status)}>{author.status}</span>
                      </td>
                      <td className="table-cell">{author.webtoonCount}</td>
                      <td className="table-cell text-right">
                        {canWriteCatalog ? (
                          <div className="relative inline-block">
                            <button
                              type="button"
                              title="Author actions"
                              aria-label="Author actions menu"
                              onClick={() =>
                                setOpenMenuId(openMenuId === author.id ? null : author.id)
                              }
                              className="rounded-lg p-2 text-fg-muted transition-colors hover:bg-gray-100 hover:text-fg-secondary"
                            >
                              <MoreVertical className="h-5 w-5" />
                            </button>
                            {openMenuId === author.id && (
                              <div className="absolute right-0 z-10 mt-2 w-48 rounded-lg border border-line bg-white py-1 shadow-lg">
                                <button
                                  type="button"
                                  onClick={() => openEditModal(author)}
                                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-fg-secondary hover:bg-gray-50"
                                >
                                  <Edit className="h-4 w-4" />
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => openDeleteModal(author)}
                                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {authors.length === 0 ? (
              <EmptyState
                icon={<PenTool className="h-8 w-8 text-fg-muted" />}
                title="No authors yet"
                description="Add a catalog creator before assigning series."
                action={
                  canWriteCatalog
                    ? { label: 'Add Author', onClick: () => setIsAddModalOpen(true) }
                    : undefined
                }
              />
            ) : filteredAuthors.length === 0 ? (
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
            title="Add Author"
            size="lg"
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void handleAddAuthor();
              }}
              className="space-y-4"
            >
              {formFields}
              {formError ? <p className="text-sm text-red-600">{formError}</p> : null}
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
                <Button type="submit" disabled={!formData.nameEn.trim()}>
                  Add Author
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
            title="Edit Author"
            size="lg"
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void handleEditAuthor();
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
                <Button type="submit" disabled={!formData.nameEn.trim()}>
                  Save Changes
                </Button>
              </div>
            </form>
          </Modal>

          <Modal
            isOpen={isDeleteModalOpen}
            onClose={() => {
              setIsDeleteModalOpen(false);
              setSelectedAuthor(null);
            }}
            title="Delete Author"
            size="sm"
          >
            <div className="space-y-4">
              {selectedAuthor && !canDeleteAuthor(webtoons, selectedAuthor.id) ? (
                <p className="text-fg-secondary">
                  <strong>{selectedAuthor.name.en}</strong> still has{' '}
                  {assignedSeriesCount(webtoons, selectedAuthor.id)} series (including drafts). Set
                  status to inactive instead. Direct profile URLs stay valid; search will hide this
                  creator.
                </p>
              ) : (
                <p className="text-fg-secondary">
                  Delete <strong>{selectedAuthor?.name.en}</strong>? This cannot be undone. The
                  reader profile URL will 404.
                </p>
              )}
              {deleteError ? <p className="text-sm text-red-600">{deleteError}</p> : null}
              <div className="flex justify-end gap-3">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setSelectedAuthor(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  onClick={() => void handleDeleteAuthor()}
                  disabled={Boolean(
                    selectedAuthor && !canDeleteAuthor(webtoons, selectedAuthor.id),
                  )}
                >
                  Delete
                </Button>
              </div>
            </div>
          </Modal>

          <MediaPicker
            isOpen={isMediaPickerOpen}
            onClose={() => setIsMediaPickerOpen(false)}
            onSelect={handleAvatarSelect}
            accept="image"
          />
        </div>
      )}
    </>
  );
};

export default AuthorsPage;
