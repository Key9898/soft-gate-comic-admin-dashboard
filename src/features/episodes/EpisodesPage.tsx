import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Image as ImageIcon,
  FileText,
  Upload,
  Clock,
} from 'lucide-react';
import { Card, Button, Input, Modal, PageSEO, NoEpisodes, NoSearchResults } from '../../components';
import { useAuth } from '@/features/auth/useAuth';
import { useStaffAccess } from '@/lib/auth/staffAccess';
import { appendActivityLog } from '@/lib/activityLog';
import { useData } from '@/lib/DataContext';
import type { Episode } from '../../types';
import EpisodesPageSkeleton from './components/EpisodesPageSkeleton';
import { measureImageSize, toImageSizes } from '@/lib/episodeImages';
import { isoToYangonDateTimeLocal, nowIso } from '@/lib/yangonDate';
import { apiMessage, isMockApi } from '@/lib/api/http';
import { deleteEpisode } from '@/lib/api/catalog';

const EpisodesPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isLoading: authLoading } = useAuth();
  const { canWriteCatalog } = useStaffAccess();
  const { episodes, setEpisodes, webtoons, setActivityLogs, isLoading, reloadCatalog } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [webtoonFilter, setWebtoonFilter] = useState<string>('all');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isBulkUploadModalOpen, setIsBulkUploadModalOpen] = useState(false);
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState('');

  const [bulkUploadData, setBulkUploadData] = useState({
    webtoonId: '',
    files: [] as File[],
    splitByPage: false,
    pagesPerEpisode: 10,
  });

  useEffect(() => {
    if (searchParams.get('new') !== '1') return;
    if (authLoading) return;
    navigate(canWriteCatalog ? '/episodes/new' : '/episodes', { replace: true });
  }, [authLoading, canWriteCatalog, navigate, searchParams]);

  const filteredEpisodes = episodes.filter((episode) => {
    const matchesSearch = episode.title.en.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || episode.status === statusFilter;
    const matchesWebtoon = webtoonFilter === 'all' || episode.webtoonId === webtoonFilter;
    return matchesSearch && matchesStatus && matchesWebtoon;
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

  const getStatusBadge = (status: Episode['status']) => {
    const styles = {
      published: 'badge-success',
      draft: 'bg-gray-100 text-fg',
      scheduled: 'badge-warning',
    };
    return styles[status];
  };

  const handleDeleteEpisode = async () => {
    if (!canWriteCatalog || !selectedEpisode) return;
    if (!isMockApi()) {
      try {
        await deleteEpisode(selectedEpisode.id);
        await reloadCatalog();
        appendActivityLog(setActivityLogs, {
          action: 'delete',
          targetType: 'episode',
          targetId: selectedEpisode.id,
          targetName: selectedEpisode.title,
          admin: user,
        });
        setIsDeleteModalOpen(false);
        setSelectedEpisode(null);
        setDeleteError('');
      } catch (err) {
        setDeleteError(apiMessage(err, 'Could not delete episode'));
      }
      return;
    }
    setEpisodes(episodes.filter((e) => e.id !== selectedEpisode.id));
    appendActivityLog(setActivityLogs, {
      action: 'delete',
      targetType: 'episode',
      targetId: selectedEpisode.id,
      targetName: selectedEpisode.title,
      admin: user,
    });
    setIsDeleteModalOpen(false);
    setSelectedEpisode(null);
  };

  const handleBulkUpload = async () => {
    if (!canWriteCatalog || !isMockApi()) return;
    if (!bulkUploadData.webtoonId || bulkUploadData.files.length === 0) return;

    const webtoon = webtoons.find((w) => w.id === bulkUploadData.webtoonId);
    const currentEpisodes = episodes.filter((e) => e.webtoonId === bulkUploadData.webtoonId);
    let createdCount = bulkUploadData.files.length;

    if (bulkUploadData.splitByPage && bulkUploadData.files.length === 1) {
      const totalPages = Math.ceil(bulkUploadData.files[0].size / 50000);
      const episodesToCreate = Math.ceil(totalPages / bulkUploadData.pagesPerEpisode);
      createdCount = episodesToCreate;

      for (let i = 0; i < episodesToCreate; i++) {
        const newEpisode: Episode = {
          id: `${Date.now()}-${i}`,
          webtoonId: bulkUploadData.webtoonId,
          webtoonTitle: webtoon?.title || { en: '', mm: '' },
          title: {
            en: `Episode ${currentEpisodes.length + i + 1}`,
            mm: '',
          },
          description: { en: '', mm: '' },
          images: [],
          isPremium: false,
          coinPrice: 0,
          viewCount: 0,
          likeCount: 0,
          episodeNumber: currentEpisodes.length + i + 1,
          status: 'draft',
          createdAt: nowIso(),
          updatedAt: nowIso(),
        };
        setEpisodes((prev) => [newEpisode, ...prev]);
      }
    } else {
      const created = await Promise.all(
        bulkUploadData.files.map(async (file, index) => {
          const url = URL.createObjectURL(file);
          const size = await measureImageSize(url);
          const imageSizes = toImageSizes([size]);
          const newEpisode: Episode = {
            id: `${Date.now()}-${index}`,
            webtoonId: bulkUploadData.webtoonId,
            webtoonTitle: webtoon?.title || { en: '', mm: '' },
            title: {
              en: `Episode ${currentEpisodes.length + index + 1}`,
              mm: '',
            },
            description: { en: '', mm: '' },
            images: [url],
            ...(imageSizes ? { imageSizes } : {}),
            isPremium: false,
            coinPrice: 0,
            viewCount: 0,
            likeCount: 0,
            episodeNumber: currentEpisodes.length + index + 1,
            status: 'draft',
            createdAt: nowIso(),
            updatedAt: nowIso(),
          };
          return newEpisode;
        }),
      );
      created.forEach((newEpisode) => {
        setEpisodes((prev) => [newEpisode, ...prev]);
      });
    }

    appendActivityLog(setActivityLogs, {
      action: 'create',
      targetType: 'episode',
      targetId: bulkUploadData.webtoonId,
      targetName: webtoon?.title || 'Bulk episodes',
      details: `Bulk created ${createdCount} episode(s)`,
      admin: user,
    });
    setIsBulkUploadModalOpen(false);
    setBulkUploadData({
      webtoonId: '',
      files: [],
      splitByPage: false,
      pagesPerEpisode: 10,
    });
  };

  const openDeleteModal = (episode: Episode) => {
    setSelectedEpisode(episode);
    setDeleteError('');
    setIsDeleteModalOpen(true);
    setOpenMenuId(null);
  };

  const goToEditor = (path: string) => {
    setOpenMenuId(null);
    navigate(path);
  };

  return (
    <>
      <PageSEO.Episodes />
      {isLoading ? (
        <EpisodesPageSkeleton />
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-fg">Episodes</h1>
              <p className="mt-1 text-fg-muted">Manage webtoon episodes</p>
            </div>
            {canWriteCatalog ? (
              <div className="flex gap-2">
                {isMockApi() ? (
                  <Button
                    variant="outline"
                    leftIcon={<Upload className="h-4 w-4" />}
                    onClick={() => setIsBulkUploadModalOpen(true)}
                  >
                    Bulk Upload
                  </Button>
                ) : null}
                <Button
                  leftIcon={<Plus className="h-4 w-4" />}
                  onClick={() => navigate('/episodes/new')}
                >
                  Add Episode
                </Button>
              </div>
            ) : null}
          </div>

          <Card>
            <div className="mb-6 flex flex-col gap-4 sm:flex-row">
              <div className="flex-1">
                <Input
                  placeholder="Search episodes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  leftIcon={<Search className="h-5 w-5" />}
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-fg-muted" />
                <select
                  aria-label="Filter by webtoon"
                  value={webtoonFilter}
                  onChange={(e) => setWebtoonFilter(e.target.value)}
                  className="rounded-lg border border-line-strong px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">All Webtoons</option>
                  {webtoons.map((webtoon) => (
                    <option key={webtoon.id} value={webtoon.id}>
                      {webtoon.title.en}
                    </option>
                  ))}
                </select>
                <select
                  aria-label="Filter by status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-lg border border-line-strong px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">All Status</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="scheduled">Scheduled</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-line">
                    <th className="table-header">Episode</th>
                    <th className="table-header">Webtoon</th>
                    <th className="table-header">Images</th>
                    <th className="table-header">Status</th>
                    <th className="table-header">Premium</th>
                    <th className="table-header">Views</th>
                    <th className="table-header">Likes</th>
                    <th className="table-header">Created</th>
                    <th className="table-header text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {filteredEpisodes.map((episode) => (
                    <tr key={episode.id} className="hover:bg-gray-50">
                      <td className="table-cell">
                        <div>
                          <p className="font-medium text-fg">
                            Ep. {episode.episodeNumber}: {episode.title.en}
                          </p>
                          {episode.description && (
                            <p className="line-clamp-1 max-w-[200px] text-xs text-fg-muted">
                              {episode.description.en}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="table-cell">{episode.webtoonTitle.en}</td>
                      <td className="table-cell">
                        <span className="text-sm text-fg-secondary">
                          {episode.images.length} {episode.images.length === 1 ? 'image' : 'images'}
                        </span>
                      </td>
                      <td className="table-cell">
                        <span className={getStatusBadge(episode.status)}>{episode.status}</span>
                        {episode.status === 'scheduled' && (
                          <div className="mt-1 flex items-center gap-1 text-xs text-fg-muted">
                            <Clock className="h-3 w-3" />
                            <span>
                              {episode.scheduledAt
                                ? isoToYangonDateTimeLocal(episode.scheduledAt).replace('T', ' ')
                                : 'Scheduled'}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="table-cell">
                        {episode.isPremium ? (
                          <span className="badge-primary">{episode.coinPrice} coins</span>
                        ) : (
                          <span className="badge bg-gray-100 text-fg-secondary">Free</span>
                        )}
                      </td>
                      <td className="table-cell">{formatNumber(episode.viewCount)}</td>
                      <td className="table-cell">{formatNumber(episode.likeCount)}</td>
                      <td className="table-cell text-fg-muted">{episode.createdAt}</td>
                      <td className="table-cell text-right">
                        <div className="relative inline-block">
                          <button
                            type="button"
                            title="Episode actions"
                            aria-label="Episode actions menu"
                            onClick={() =>
                              setOpenMenuId(openMenuId === episode.id ? null : episode.id)
                            }
                            className="rounded-lg p-2 text-fg-muted transition-colors hover:bg-gray-100 hover:text-fg-secondary"
                          >
                            <MoreVertical className="h-5 w-5" />
                          </button>
                          {openMenuId === episode.id && (
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
                                    onClick={() => goToEditor(`/episodes/${episode.id}/edit`)}
                                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-fg-secondary hover:bg-gray-50"
                                  >
                                    <Edit className="h-4 w-4" />
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => openDeleteModal(episode)}
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

            {episodes.length === 0 ? (
              <NoEpisodes onAdd={canWriteCatalog ? () => navigate('/episodes/new') : undefined} />
            ) : filteredEpisodes.length === 0 ? (
              <NoSearchResults
                query={searchQuery}
                onClear={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                  setWebtoonFilter('all');
                }}
              />
            ) : null}
          </Card>

          <Modal
            isOpen={isDeleteModalOpen}
            onClose={() => {
              setIsDeleteModalOpen(false);
              setSelectedEpisode(null);
            }}
            title="Delete Episode"
            size="sm"
          >
            <div className="space-y-4">
              <p className="text-fg-secondary">
                Are you sure you want to delete <strong>{selectedEpisode?.title.en}</strong>? This
                action cannot be undone.
              </p>
              {deleteError ? <p className="text-sm text-red-600">{deleteError}</p> : null}
              <div className="flex justify-end gap-3">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setSelectedEpisode(null);
                  }}
                >
                  Cancel
                </Button>
                <Button variant="danger" onClick={() => void handleDeleteEpisode()}>
                  Delete
                </Button>
              </div>
            </div>
          </Modal>

          <Modal
            isOpen={isBulkUploadModalOpen}
            onClose={() => {
              setIsBulkUploadModalOpen(false);
              setBulkUploadData({
                webtoonId: '',
                files: [],
                splitByPage: false,
                pagesPerEpisode: 10,
              });
            }}
            title="Bulk Upload Episodes"
            size="lg"
          >
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="bulk-webtoon"
                  className="mb-1.5 block text-sm font-medium text-fg-secondary"
                >
                  Select Webtoon
                </label>
                <select
                  id="bulk-webtoon"
                  value={bulkUploadData.webtoonId}
                  onChange={(e) =>
                    setBulkUploadData({ ...bulkUploadData, webtoonId: e.target.value })
                  }
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

              <div>
                <label className="mb-1.5 block text-sm font-medium text-fg-secondary">
                  Upload Files
                </label>
                <div
                  className="cursor-pointer rounded-lg border-2 border-dashed border-line-strong p-8 text-center transition-colors hover:border-primary-400"
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*,.pdf';
                    input.multiple = true;
                    input.onchange = (e) => {
                      const files = (e.target as HTMLInputElement).files;
                      if (files) {
                        setBulkUploadData({ ...bulkUploadData, files: Array.from(files) });
                      }
                    };
                    input.click();
                  }}
                >
                  <Upload className="mx-auto mb-4 h-12 w-12 text-fg-muted" />
                  <p className="mb-2 text-fg-secondary">Click to upload or drag and drop</p>
                  <p className="text-sm text-fg-muted">Images (JPG, PNG) or PDF files</p>
                </div>
              </div>

              {bulkUploadData.files.length > 0 && (
                <div className="rounded-lg border p-3">
                  <p className="mb-2 text-sm font-medium text-fg-secondary">
                    {bulkUploadData.files.length} file(s) selected
                  </p>
                  <div className="max-h-40 space-y-2 overflow-y-auto">
                    {bulkUploadData.files.map((file, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        {file.type.startsWith('image/') ? (
                          <ImageIcon className="h-4 w-4 text-blue-500" />
                        ) : (
                          <FileText className="h-4 w-4 text-red-500" />
                        )}
                        <span className="text-fg-secondary">{file.name}</span>
                        <span className="text-xs text-fg-muted">
                          ({(file.size / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {bulkUploadData.files.length === 1 &&
                bulkUploadData.files[0].type === 'application/pdf' && (
                  <div className="space-y-3 rounded-lg bg-gray-50 p-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="splitByPage"
                        checked={bulkUploadData.splitByPage}
                        onChange={(e) =>
                          setBulkUploadData({ ...bulkUploadData, splitByPage: e.target.checked })
                        }
                        className="h-4 w-4 rounded border-line-strong text-primary-600"
                      />
                      <label htmlFor="splitByPage" className="text-sm text-fg-secondary">
                        Split PDF into multiple episodes
                      </label>
                    </div>
                    {bulkUploadData.splitByPage && (
                      <div>
                        <label
                          htmlFor="pagesPerEpisode"
                          className="mb-1 block text-sm text-fg-secondary"
                        >
                          Pages per episode
                        </label>
                        <input
                          id="pagesPerEpisode"
                          type="number"
                          min={1}
                          max={100}
                          value={bulkUploadData.pagesPerEpisode}
                          onChange={(e) =>
                            setBulkUploadData({
                              ...bulkUploadData,
                              pagesPerEpisode: parseInt(e.target.value) || 10,
                            })
                          }
                          className="w-24 rounded-lg border border-line-strong px-3 py-2 text-sm"
                        />
                      </div>
                    )}
                  </div>
                )}

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setIsBulkUploadModalOpen(false);
                    setBulkUploadData({
                      webtoonId: '',
                      files: [],
                      splitByPage: false,
                      pagesPerEpisode: 10,
                    });
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => void handleBulkUpload()}
                  disabled={!bulkUploadData.webtoonId || bulkUploadData.files.length === 0}
                >
                  Upload {bulkUploadData.files.length > 0 && `(${bulkUploadData.files.length})`}
                </Button>
              </div>
            </div>
          </Modal>
        </div>
      )}
    </>
  );
};

export default EpisodesPage;
