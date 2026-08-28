import { useState } from 'react';
import { Plus, Search, MoreVertical, Edit, Trash2, LayoutGrid } from 'lucide-react';
import { Card, Button, Input, Modal, PageSEO, EmptyState, NoSearchResults } from '../../components';
import { useAuth } from '@/features/auth/useAuth';
import { useStaffAccess } from '@/lib/auth/staffAccess';
import { appendActivityLog } from '@/lib/activityLog';
import { useData } from '@/lib/DataContext';
import type { Genre } from '../../types';
import GenresPageSkeleton from './components/GenresPageSkeleton';
import {
  assignedSeriesCount,
  canDeleteGenre,
  cascadeGenreTokens,
  isAllGenre,
  isSlugTaken,
  isValidSlug,
  nextGenreId,
  syncGenreWebtoonCounts,
  withDerivedCount,
} from '@/lib/genres';
import { apiMessage, isMockApi } from '@/lib/api/http';
import { createGenre, deleteGenre, updateGenre } from '@/lib/api/catalog';

type GenreFormState = {
  nameEn: string;
  nameMm: string;
  slug: string;
};

const emptyForm = (): GenreFormState => ({
  nameEn: '',
  nameMm: '',
  slug: '',
});

const GenresPage = () => {
  const { user } = useAuth();
  const { canWriteCatalog } = useStaffAccess();
  const { genres, setGenres, webtoons, setWebtoons, setActivityLogs, isLoading, reloadCatalog } =
    useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState<Genre | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [formData, setFormData] = useState<GenreFormState>(emptyForm);
  const [formError, setFormError] = useState('');
  const [deleteError, setDeleteError] = useState('');

  const filteredGenres = genres.filter((genre) => {
    const haystack = `${genre.name.en} ${genre.name.mm} ${genre.slug}`.toLowerCase();
    return haystack.includes(searchQuery.toLowerCase());
  });

  const persistGenre = (previous: Genre | null, updated: Genre, isCreate: boolean) => {
    if (!canWriteCatalog) return;
    let nextWebtoons = webtoons;
    if (!isCreate && previous && !isAllGenre(updated)) {
      nextWebtoons = cascadeGenreTokens(webtoons, previous, updated);
      setWebtoons(nextWebtoons);
    }
    const nextGenres = isCreate
      ? [updated, ...genres]
      : genres.map((genre) => (genre.id === updated.id ? updated : genre));
    setGenres(syncGenreWebtoonCounts(nextGenres, nextWebtoons));
    appendActivityLog(setActivityLogs, {
      action: isCreate ? 'create' : 'update',
      targetType: 'genre',
      targetId: updated.id,
      targetName: updated.name,
      admin: user,
    });
  };

  const handleAddGenre = async () => {
    if (!canWriteCatalog) return;
    const slug = formData.slug.trim().toLowerCase();
    if (!isValidSlug(slug)) {
      setFormError('Use a lowercase kebab slug such as slice-of-life. The slug “all” is reserved.');
      return;
    }
    if (isSlugTaken(genres, slug)) {
      setFormError('That slug is already in use.');
      return;
    }
    if (!isMockApi()) {
      try {
        const { genre } = await createGenre({
          name: { en: formData.nameEn.trim(), mm: formData.nameMm },
          slug,
        });
        await reloadCatalog();
        appendActivityLog(setActivityLogs, {
          action: 'create',
          targetType: 'genre',
          targetId: genre.id,
          targetName: genre.name,
          admin: user,
        });
        setIsAddModalOpen(false);
        resetForm();
      } catch (err) {
        setFormError(apiMessage(err, 'Could not save genre'));
      }
      return;
    }
    const created: Genre = {
      id: nextGenreId(genres),
      name: { en: formData.nameEn.trim(), mm: formData.nameMm },
      slug,
      webtoonCount: 0,
    };
    persistGenre(null, withDerivedCount(created, webtoons), true);
    setIsAddModalOpen(false);
    resetForm();
  };

  const handleEditGenre = async () => {
    if (!canWriteCatalog || !selectedGenre) return;
    if (!isMockApi()) {
      try {
        await updateGenre(selectedGenre.id, {
          name: { en: formData.nameEn.trim(), mm: formData.nameMm },
        });
        await reloadCatalog();
        appendActivityLog(setActivityLogs, {
          action: 'update',
          targetType: 'genre',
          targetId: selectedGenre.id,
          targetName: { en: formData.nameEn.trim(), mm: formData.nameMm },
          admin: user,
        });
        setIsEditModalOpen(false);
        resetForm();
      } catch (err) {
        setFormError(apiMessage(err, 'Could not save genre'));
      }
      return;
    }
    const updated = withDerivedCount(
      {
        ...selectedGenre,
        name: { en: formData.nameEn.trim(), mm: formData.nameMm },
      },
      webtoons,
    );
    persistGenre(selectedGenre, updated, false);
    setIsEditModalOpen(false);
    resetForm();
  };

  const handleDeleteGenre = async () => {
    if (!canWriteCatalog || !selectedGenre || !canDeleteGenre(webtoons, selectedGenre)) return;
    if (!isMockApi()) {
      try {
        await deleteGenre(selectedGenre.id);
        await reloadCatalog();
        appendActivityLog(setActivityLogs, {
          action: 'delete',
          targetType: 'genre',
          targetId: selectedGenre.id,
          targetName: selectedGenre.name,
          admin: user,
        });
        setIsDeleteModalOpen(false);
        setSelectedGenre(null);
        setDeleteError('');
      } catch (err) {
        setDeleteError(apiMessage(err, 'Could not delete genre'));
      }
      return;
    }
    setGenres(genres.filter((genre) => genre.id !== selectedGenre.id));
    appendActivityLog(setActivityLogs, {
      action: 'delete',
      targetType: 'genre',
      targetId: selectedGenre.id,
      targetName: selectedGenre.name,
      admin: user,
    });
    setIsDeleteModalOpen(false);
    setSelectedGenre(null);
  };

  const openEditModal = (genre: Genre) => {
    setSelectedGenre(genre);
    setFormData({
      nameEn: genre.name.en,
      nameMm: genre.name.mm,
      slug: genre.slug,
    });
    setFormError('');
    setIsEditModalOpen(true);
    setOpenMenuId(null);
  };

  const openDeleteModal = (genre: Genre) => {
    setSelectedGenre(genre);
    setDeleteError('');
    setIsDeleteModalOpen(true);
    setOpenMenuId(null);
  };

  const resetForm = () => {
    setFormData(emptyForm());
    setSelectedGenre(null);
    setFormError('');
  };

  const deleteBlocked = Boolean(selectedGenre && !canDeleteGenre(webtoons, selectedGenre));

  return (
    <>
      <PageSEO.Genres />
      {isLoading ? (
        <GenresPageSkeleton />
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-fg">Genres</h1>
              <p className="mt-1 text-fg-muted">Manage catalog categories for the reader site</p>
            </div>
            {canWriteCatalog ? (
              <Button
                leftIcon={<Plus className="h-4 w-4" />}
                onClick={() => setIsAddModalOpen(true)}
              >
                Add Genre
              </Button>
            ) : null}
          </div>

          <Card>
            <div className="mb-6">
              <Input
                placeholder="Search genres..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="h-5 w-5" />}
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-line">
                    <th className="table-header">Name (EN)</th>
                    <th className="table-header">Name (MM)</th>
                    <th className="table-header">Slug</th>
                    <th className="table-header">Series</th>
                    <th className="table-header text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {filteredGenres.map((genre) => (
                    <tr key={genre.id} className="hover:bg-gray-50">
                      <td className="table-cell">
                        <p className="font-medium text-fg">{genre.name.en}</p>
                      </td>
                      <td className="table-cell text-fg-secondary">{genre.name.mm || '—'}</td>
                      <td className="table-cell font-mono text-sm text-fg-secondary">
                        {genre.slug}
                      </td>
                      <td className="table-cell">{genre.webtoonCount}</td>
                      <td className="table-cell text-right">
                        {canWriteCatalog ? (
                          <div className="relative inline-block">
                            <button
                              type="button"
                              title="Genre actions"
                              aria-label="Genre actions menu"
                              onClick={() =>
                                setOpenMenuId(openMenuId === genre.id ? null : genre.id)
                              }
                              className="rounded-lg p-2 text-fg-muted transition-colors hover:bg-gray-100 hover:text-fg-secondary"
                            >
                              <MoreVertical className="h-5 w-5" />
                            </button>
                            {openMenuId === genre.id && (
                              <div className="absolute right-0 z-10 mt-2 w-48 rounded-lg border border-line bg-white py-1 shadow-lg">
                                <button
                                  type="button"
                                  onClick={() => openEditModal(genre)}
                                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-fg-secondary hover:bg-gray-50"
                                >
                                  <Edit className="h-4 w-4" />
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => openDeleteModal(genre)}
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

            {genres.length === 0 ? (
              <EmptyState
                icon={<LayoutGrid className="h-8 w-8 text-fg-muted" />}
                title="No genres yet"
                description="Add a catalog category before assigning series."
                action={
                  canWriteCatalog
                    ? { label: 'Add Genre', onClick: () => setIsAddModalOpen(true) }
                    : undefined
                }
              />
            ) : filteredGenres.length === 0 ? (
              <NoSearchResults query={searchQuery} onClear={() => setSearchQuery('')} />
            ) : null}
          </Card>

          <Modal
            isOpen={isAddModalOpen}
            onClose={() => {
              setIsAddModalOpen(false);
              resetForm();
            }}
            title="Add Genre"
            size="lg"
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void handleAddGenre();
              }}
              className="space-y-4"
            >
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
              <Input
                label="Slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                required
              />
              <p className="text-xs text-fg-muted">
                Lowercase kebab-case. This becomes /categories/slug on the reader site and cannot
                change later.
              </p>
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
                  Add Genre
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
            title="Edit Genre"
            size="lg"
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void handleEditGenre();
              }}
              className="space-y-4"
            >
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
              <Input label="Slug" value={formData.slug} readOnly disabled />
              <p className="text-xs text-fg-muted">
                Slug is locked so /categories/{formData.slug || '…'} stays valid.
              </p>
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
              setSelectedGenre(null);
            }}
            title="Delete Genre"
            size="sm"
          >
            <div className="space-y-4">
              {selectedGenre && isAllGenre(selectedGenre) ? (
                <p className="text-fg-secondary">
                  <strong>{selectedGenre.name.en}</strong> is the browse-all category. It cannot be
                  deleted. Rename the labels if needed; the slug stays <code>all</code>.
                </p>
              ) : selectedGenre && !canDeleteGenre(webtoons, selectedGenre) ? (
                <p className="text-fg-secondary">
                  <strong>{selectedGenre.name.en}</strong> still has{' '}
                  {assignedSeriesCount(webtoons, selectedGenre)} series (including drafts). Remove
                  or reassign those series before deleting. The reader URL /categories/
                  {selectedGenre.slug} stays valid while this row exists.
                </p>
              ) : (
                <p className="text-fg-secondary">
                  Delete <strong>{selectedGenre?.name.en}</strong>? This cannot be undone. The
                  reader category URL will 404.
                </p>
              )}
              {deleteError ? <p className="text-sm text-red-600">{deleteError}</p> : null}
              <div className="flex justify-end gap-3">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setSelectedGenre(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  onClick={() => void handleDeleteGenre()}
                  disabled={deleteBlocked}
                >
                  Delete
                </Button>
              </div>
            </div>
          </Modal>
        </div>
      )}
    </>
  );
};

export default GenresPage;
