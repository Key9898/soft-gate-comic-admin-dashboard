import { useState } from 'react'
import { Search, Filter, MoreVertical, Eye, EyeOff, Trash2 } from 'lucide-react'
import { Card, Button, Input, Modal, PageSEO } from '../../components'
import { mockComments } from '../../demo'
import type { Comment } from '../../types'

const CommentsPage = () => {
  const [comments, setComments] = useState<Comment[]>(mockComments)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)

  const filteredComments = comments.filter((comment) => {
    const matchesSearch = comment.content.en.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || comment.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: Comment['status']) => {
    const styles = {
      visible: 'badge-success',
      hidden: 'badge-warning',
      deleted: 'badge-danger',
    }
    return styles[status]
  }

  const handleToggleVisibility = (comment: Comment) => {
    setComments(
      comments.map((c) =>
        c.id === comment.id ? { ...c, status: c.status === 'visible' ? 'hidden' : 'visible' } : c
      )
    )
    setOpenMenuId(null)
  }

  const handleDeleteComment = () => {
    if (!selectedComment) return
    setComments(
      comments.map((c) => (c.id === selectedComment.id ? { ...c, status: 'deleted' as const } : c))
    )
    setIsDeleteModalOpen(false)
    setSelectedComment(null)
  }

  const openDetailModal = (comment: Comment) => {
    setSelectedComment(comment)
    setIsDetailModalOpen(true)
    setOpenMenuId(null)
  }

  const openDeleteModal = (comment: Comment) => {
    setSelectedComment(comment)
    setIsDeleteModalOpen(true)
    setOpenMenuId(null)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <>
      <PageSEO.Comments />
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Comments</h1>
            <p className="text-gray-500 mt-1">Moderate user comments</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-green-50 text-green-600">
                <Eye className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Visible</p>
                <p className="text-2xl font-bold text-gray-900">
                  {comments.filter((c) => c.status === 'visible').length}
                </p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-yellow-50 text-yellow-600">
                <EyeOff className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Hidden</p>
                <p className="text-2xl font-bold text-gray-900">
                  {comments.filter((c) => c.status === 'hidden').length}
                </p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-red-50 text-red-600">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Deleted</p>
                <p className="text-2xl font-bold text-gray-900">
                  {comments.filter((c) => c.status === 'deleted').length}
                </p>
              </div>
            </div>
          </Card>
        </div>

        <Card>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search comments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="w-5 h-5" />}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                aria-label="Filter by status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
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
                className="p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                      {comment.user.avatar ? (
                        <img
                          src={comment.user.avatar}
                          alt={comment.user.displayName}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-primary-600 font-medium">
                          {comment.user.displayName.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900">
                          {comment.user.displayName}
                        </span>
                        <span className="text-xs text-gray-400">@{comment.user.username}</span>
                        <span className={getStatusBadge(comment.status)}>{comment.status}</span>
                      </div>
                      <p className="text-gray-700 mb-2">{comment.content.en}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
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
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>
                    {openMenuId === comment.id && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                        <button
                          type="button"
                          onClick={() => openDetailModal(comment)}
                          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <Eye className="w-4 h-4" />
                          View Details
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleVisibility(comment)}
                          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-yellow-600 hover:bg-yellow-50"
                        >
                          {comment.status === 'visible' ? (
                            <>
                              <EyeOff className="w-4 h-4" />
                              Hide Comment
                            </>
                          ) : (
                            <>
                              <Eye className="w-4 h-4" />
                              Show Comment
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => openDeleteModal(comment)}
                          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredComments.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No comments found</p>
            </div>
          )}
        </Card>

        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false)
            setSelectedComment(null)
          }}
          title="Comment Details"
          size="lg"
        >
          {selectedComment && (
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                  {selectedComment.user.avatar ? (
                    <img
                      src={selectedComment.user.avatar}
                      alt={selectedComment.user.displayName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-primary-600 font-bold">
                      {selectedComment.user.displayName.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {selectedComment.user.displayName}
                  </h3>
                  <p className="text-sm text-gray-500">@{selectedComment.user.username}</p>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-gray-50">
                <p className="text-gray-700">{selectedComment.content.en}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-gray-50">
                  <p className="text-sm text-gray-500">Status</p>
                  <span className={getStatusBadge(selectedComment.status)}>
                    {selectedComment.status}
                  </span>
                </div>
                <div className="p-4 rounded-lg bg-gray-50">
                  <p className="text-sm text-gray-500">Likes</p>
                  <p className="font-medium text-gray-900">{selectedComment.likeCount}</p>
                </div>
                <div className="p-4 rounded-lg bg-gray-50">
                  <p className="text-sm text-gray-500">Created</p>
                  <p className="font-medium text-gray-900">
                    {formatDate(selectedComment.createdAt)}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-gray-50">
                  <p className="text-sm text-gray-500">Comment ID</p>
                  <p className="font-medium text-gray-900 text-xs">{selectedComment.id}</p>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setIsDetailModalOpen(false)
                    setSelectedComment(null)
                  }}
                >
                  Close
                </Button>
                <Button
                  variant="danger"
                  onClick={() => {
                    setIsDetailModalOpen(false)
                    openDeleteModal(selectedComment)
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
            setIsDeleteModalOpen(false)
            setSelectedComment(null)
          }}
          title="Delete Comment"
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              Are you sure you want to delete this comment? This action cannot be undone.
            </p>
            <div className="p-3 rounded-lg bg-gray-50 text-sm text-gray-700">
              "{selectedComment?.content.en}"
            </div>
            <div className="flex justify-end gap-3">
              <Button
                variant="secondary"
                onClick={() => {
                  setIsDeleteModalOpen(false)
                  setSelectedComment(null)
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
    </>
  )
}

export default CommentsPage
