import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Search, Filter, MoreVertical, Edit, Trash2, Eye, Star } from 'lucide-react';
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
import { useAuth } from '@/features/auth/useAuth';
import { useStaffAccess } from '@/lib/auth/staffAccess';
import { appendActivityLog } from '@/lib/activityLog';
import { useData } from '@/lib/DataContext';
import type { Webtoon } from '../../types';
import { markIdLoaded } from '@/lib/imageLoaded';
import WebtoonsPageSkeleton from './components/WebtoonsPageSkeleton';
import { syncAuthorWebtoonCounts } from '@/lib/authors';
import { resolveGenreLabelEn, syncGenreWebtoonCounts } from '@/lib/genres';
import { apiMessage, isMockApi } from '@/lib/api/http';
import { deleteWebtoon } from '@/lib/api/catalog';

const WebtoonsPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
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
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loadedCovers, setLoadedCovers] = useState<Set<string>>(() => new Set());
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedWebtoon, setSelectedWebtoon] = useState<Webtoon | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    if (searchParams.get('new') !== '1') return;
    if (authLoading) return;
    navigate(canWriteCatalog ? '/webtoons/new' : '/webtoons', { replace: true });
  }, [authLoading, canWriteCatalog, navigate, searchParams]);

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
    const nextWebtoons = webtoons.filter((webtoon) => webtoon.id !== selectedWebtoon.id);
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

  const openDeleteModal = (webtoon: Webtoon) => {
    setSelectedWebtoon(webtoon);
    setDeleteError('');
    setIsDeleteModalOpen(true);
    setOpenMenuId(null);
  };

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
                onClick={() => navigate('/webtoons/new')}
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
                                    onClick={() => navigate(`/webtoons/${webtoon.id}/edit`)}
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
              <NoWebtoons onAdd={canWriteCatalog ? () => navigate('/webtoons/new') : undefined} />
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
        </div>
      )}
    </>
  );
};

export default WebtoonsPage;
