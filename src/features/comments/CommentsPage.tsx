import { useState } from 'react';
import { Search, Filter, MoreVertical, Eye, EyeOff, Trash2 } from 'lucide-react';
import {
  Card,
  Button,
  Input,
  Modal,
  PageSEO,
  EmptyState,
  NoComments,
  coverSheenClass,
} from '../../components';
import { useAuth } from '@/features/auth/useAuth';
import { useStaffAccess } from '@/lib/auth/staffAccess';
import { appendActivityLog } from '@/lib/activityLog';
import { useData } from '@/lib/DataContext';
import type { Comment } from '../../types';
import { markIdLoaded } from '@/lib/imageLoaded';
import CommentsPageSkeleton from './components/CommentsPageSkeleton';

const CommentsPage = () => {
  const { user } = useAuth();
  const { canWriteCommunity } = useStaffAccess();
  const { comments, setComments, setActivityLogs, isLoading } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loadedAvatars, setLoadedAvatars] = useState<Set<string>>(() => new Set());
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const filteredComments = comments.filter((comment) => {
    const matchesSearch = comment.content.en.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || comment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: Comment['status']) => {
    const styles = {
      visible: 'badge-success',
      hidden: 'badge-warning',
      deleted: 'badge-danger',
    };
    return styles[status];
  };

  const handleToggleVisibility = (comment: Comment) => {
    if (!canWriteCommunity) return;
    const nextStatus = comment.status === 'visible' ? 'hidden' : 'visible';
    setComments(comments.map((c) => (c.id === comment.id ? { ...c, status: nextStatus } : c)));
    appendActivityLog(setActivityLogs, {
      action: 'update',
      targetType: 'comment',
      targetId: comment.id,
      targetName: comment.content,
      details: `Comment ${nextStatus}`,
      admin: user,
    });
    setOpenMenuId(null);
  };

  const handleDeleteComment = () => {
    if (!canWriteCommunity || !selectedComment) return;
    setComments(
      comments.map((c) => (c.id === selectedComment.id ? { ...c, status: 'deleted' as const } : c)),
    );
    appendActivityLog(setActivityLogs, {
      action: 'delete',
      targetType: 'comment',
      targetId: selectedComment.id,
      targetName: selectedComment.content,
      admin: user,
    });
    setIsDeleteModalOpen(false);
    setSelectedComment(null);
  };

  const openDetailModal = (comment: Comment) => {
    setSelectedComment(comment);
    setIsDetailModalOpen(true);
    setOpenMenuId(null);
  };

  const openDeleteModal = (comment: Comment) => {
    setSelectedComment(comment);
    setIsDeleteModalOpen(true);
    setOpenMenuId(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      <PageSEO.Comments />
      {isLoading ? (
        <CommentsPageSkeleton />
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-fg">Comments</h1>
              <p className="mt-1 text-fg-muted">Moderate user comments</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Card>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-green-50 p-3 text-green-600">
                  <Eye className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-fg-muted">Visible</p>
                  <p className="text-2xl font-bold text-fg">
                    {comments.filter((c) => c.status === 'visible').length}
                  </p>
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-yellow-50 p-3 text-yellow-600">
                  <EyeOff className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-fg-muted">Hidden</p>
                  <p className="text-2xl font-bold text-fg">
                    {comments.filter((c) => c.status === 'hidden').length}
                  </p>
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-red-50 p-3 text-red-600">
                  <Trash2 className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-fg-muted">Deleted</p>
                  <p className="text-2xl font-bold text-fg">
                    {comments.filter((c) => c.status === 'deleted').length}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <Card>
            <div className="mb-6 flex flex-col gap-4 sm:flex-row">
              <div className="flex-1">
                <Input
                  placeholder="Search comments..."
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
                  <option value="visible">Visible</option>
                  <option value="hidden">Hidden</option>
                  <option value="deleted">Deleted</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              {filteredComments.map((comment) => (
                <div
                  key={comment.id}
                  className="rounded-lg border border-line p-4 transition-colors hover:border-line-strong"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-100">
                        {comment.user.avatar ? (
                          <>
                            <img
                              src={comment.user.avatar}
                              alt={comment.user.displayName}
                              className="h-10 w-10 rounded-full object-cover"
                              onLoad={() => markIdLoaded(setLoadedAvatars, comment.id)}
                              onError={() => markIdLoaded(setLoadedAvatars, comment.id)}
                            />
                            {!loadedAvatars.has(comment.id) && <span className={coverSheenClass} />}
                          </>
                        ) : (
                          <span className="font-medium text-primary-700">
                            {comment.user.displayName.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <span className="font-medium text-fg">{comment.user.displayName}</span>
                          <span className="text-xs text-fg-muted">@{comment.user.username}</span>
                          <span className={getStatusBadge(comment.status)}>{comment.status}</span>
                        </div>
                        <p className="mb-2 text-fg-secondary">{comment.content.en}</p>
                        <div className="flex items-center gap-4 text-xs text-fg-muted">
                          <span>{formatDate(comment.createdAt)}</span>
                          <span>Likes: {comment.likeCount}</span>
                        </div>
                      </div>
                    </div>
                    <div className="relative">
                      <button
                        type="button"
                        title="Comment actions"
                        aria-label="Comment actions menu"
                        onClick={() => setOpenMenuId(openMenuId === comment.id ? null : comment.id)}
                        className="rounded-lg p-2 text-fg-muted transition-colors hover:bg-gray-100 hover:text-fg-secondary"
                      >
                        <MoreVertical className="h-5 w-5" />
                      </button>
                      {openMenuId === comment.id && (
                        <div className="absolute right-0 z-10 mt-2 w-48 rounded-lg border border-line bg-white py-1 shadow-lg">
                          <button
                            type="button"
                            onClick={() => openDetailModal(comment)}
                            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-fg-secondary hover:bg-gray-50"
                          >
                            <Eye className="h-4 w-4" />
                            View Details
                          </button>
                          {canWriteCommunity ? (
                            <>
                              <button
                                type="button"
                                onClick={() => handleToggleVisibility(comment)}
                                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-yellow-600 hover:bg-yellow-50"
                              >
                                {comment.status === 'visible' ? (
                                  <>
                                    <EyeOff className="h-4 w-4" />
                                    Hide Comment
                                  </>
                                ) : (
                                  <>
                                    <Eye className="h-4 w-4" />
                                    Show Comment
                                  </>
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() => openDeleteModal(comment)}
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
                  </div>
                </div>
              ))}
            </div>

            {comments.length === 0 ? (
              <EmptyState
                title="No comments yet"
                description="Comments will appear here as readers post them."
              />
            ) : filteredComments.length === 0 ? (
              <NoComments />
            ) : null}
          </Card>

          <Modal
            isOpen={isDetailModalOpen}
            onClose={() => {
              setIsDetailModalOpen(false);
              setSelectedComment(null);
            }}
            title="Comment Details"
            size="lg"
          >
            {selectedComment && (
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary-100">
                    {selectedComment.user.avatar ? (
                      <img
                        src={selectedComment.user.avatar}
                        alt={selectedComment.user.displayName}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      <span className="font-bold text-primary-700">
                        {selectedComment.user.displayName.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-fg">{selectedComment.user.displayName}</h3>
                    <p className="text-sm text-fg-muted">@{selectedComment.user.username}</p>
                  </div>
                </div>

                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-fg-secondary">{selectedComment.content.en}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-gray-50 p-4">
                    <p className="text-sm text-fg-muted">Status</p>
                    <span className={getStatusBadge(selectedComment.status)}>
                      {selectedComment.status}
                    </span>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-4">
                    <p className="text-sm text-fg-muted">Likes</p>
                    <p className="font-medium text-fg">{selectedComment.likeCount}</p>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-4">
                    <p className="text-sm text-fg-muted">Created</p>
                    <p className="font-medium text-fg">{formatDate(selectedComment.createdAt)}</p>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-4">
                    <p className="text-sm text-fg-muted">Comment ID</p>
                    <p className="text-xs font-medium text-fg">{selectedComment.id}</p>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setIsDetailModalOpen(false);
                      setSelectedComment(null);
                    }}
                  >
                    Close
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => {
                      setIsDetailModalOpen(false);
                      openDeleteModal(selectedComment);
                    }}
                  >
                    Delete Comment
                  </Button>
                </div>
              </div>
            )}
          </Modal>

          <Modal
            isOpen={isDeleteModalOpen}
            onClose={() => {
              setIsDeleteModalOpen(false);
              setSelectedComment(null);
            }}
            title="Delete Comment"
            size="sm"
          >
            <div className="space-y-4">
              <p className="text-fg-secondary">
                Are you sure you want to delete this comment? This action cannot be undone.
              </p>
              <div className="rounded-lg bg-gray-50 p-3 text-sm text-fg-secondary">
                "{selectedComment?.content.en}"
              </div>
              <div className="flex justify-end gap-3">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setSelectedComment(null);
                  }}
                >
                  Cancel
                </Button>
                <Button variant="danger" onClick={handleDeleteComment}>
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

export default CommentsPage;
