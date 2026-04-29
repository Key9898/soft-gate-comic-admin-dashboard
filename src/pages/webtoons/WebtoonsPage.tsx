import { useState } from 'react'
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Star,
  Image as ImageIcon,
  X,
} from 'lucide-react'
import { Card, Button, Input, Modal, PageSEO } from '../../components'
import MediaPicker from '../../components/MediaPicker/MediaPicker'
import type { MediaFile } from '../../components/MediaPicker/MediaPicker'
import { mockWebtoons, mockAuthors, mockGenres } from '../../demo'
import type { Webtoon } from '../../types'

const popularTags = [
  'action',
  'romance',
  'comedy',
  'drama',
  'fantasy',
  'horror',
  'thriller',
  'slice-of-life',
  'supernatural',
  'mystery',
  'sci-fi',
  'school-life',
  'webtoon',
  'manhwa',
  'completed',
  'new',
  'trending',
  'recommended',
]

const WebtoonsPage = () => {
  const [webtoons, setWebtoons] = useState<Webtoon[]>(mockWebtoons)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedWebtoon, setSelectedWebtoon] = useState<Webtoon | null>(null)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false)
  const [tagInput, setTagInput] = useState('')

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    author: '',
    genres: [] as string[],
    tags: [] as string[],
    coverImage: '',
    status: 'draft' as Webtoon['status'],
    isPremium: false,
  })

  const filteredWebtoons = webtoons.filter((webtoon) => {
    const matchesSearch = webtoon.title.en.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || webtoon.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`
    }
    return num.toString()
  }

  const getStatusBadge = (status: Webtoon['status']) => {
    const styles = {
      ongoing: 'badge-success',
      completed: 'badge-info',
      hiatus: 'badge-warning',
      draft: 'bg-gray-100 text-gray-800',
    }
    return styles[status]
  }

  const handleCoverSelect = (files: MediaFile[]) => {
    if (files.length > 0) {
      setFormData({ ...formData, coverImage: files[0].url })
    }
    setIsMediaPickerOpen(false)
  }

  const addTag = (tag: string) => {
    const normalizedTag = tag.toLowerCase().trim()
    if (normalizedTag && !formData.tags.includes(normalizedTag)) {
      setFormData({ ...formData, tags: [...formData.tags, normalizedTag] })
    }
    setTagInput('')
  }

  const removeTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter((t) => t !== tag) })
  }

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag(tagInput)
    }
  }

  const handleAddWebtoon = () => {
    const newWebtoon: Webtoon = {
      id: `${Date.now()}`,
      title: { en: formData.title, mm: formData.title },
      description: { en: formData.description, mm: formData.description },
      coverImage: formData.coverImage || undefined,
      coverColor: formData.coverImage ? '' : 'bg-gradient-to-br from-gray-400 to-gray-600',
      author: mockAuthors.find((a) => a.id === formData.author) || mockAuthors[0],
      genres: formData.genres,
      tags: formData.tags,
      status: formData.status,
      isPremium: formData.isPremium,
      viewCount: 0,
      likeCount: 0,
      episodeCount: 0,
      rating: 0,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    }
    setWebtoons([newWebtoon, ...webtoons])
    setIsAddModalOpen(false)
    resetForm()
  }

  const handleEditWebtoon = () => {
    if (!selectedWebtoon) return
    setWebtoons(
      webtoons.map((w) =>
        w.id === selectedWebtoon.id
          ? {
              ...w,
              title: { en: formData.title, mm: formData.title },
              description: { en: formData.description, mm: formData.description },
              coverImage: formData.coverImage || undefined,
              coverColor: formData.coverImage ? '' : w.coverColor,
              author: mockAuthors.find((a) => a.id === formData.author) || w.author,
              genres: formData.genres,
              tags: formData.tags,
              status: formData.status,
              isPremium: formData.isPremium,
              updatedAt: new Date().toISOString().split('T')[0],
            }
          : w
      )
    )
    setIsEditModalOpen(false)
    resetForm()
  }

  const handleDeleteWebtoon = () => {
    if (!selectedWebtoon) return
    setWebtoons(webtoons.filter((w) => w.id !== selectedWebtoon.id))
    setIsDeleteModalOpen(false)
    setSelectedWebtoon(null)
  }

  const openEditModal = (webtoon: Webtoon) => {
    setSelectedWebtoon(webtoon)
    setFormData({
      title: webtoon.title.en,
      description: webtoon.description.en,
      author: webtoon.author.id,
      genres: webtoon.genres,
      tags: webtoon.tags || [],
      coverImage: webtoon.coverImage || '',
      status: webtoon.status,
      isPremium: webtoon.isPremium,
    })
    setIsEditModalOpen(true)
    setOpenMenuId(null)
  }

  const openDeleteModal = (webtoon: Webtoon) => {
    setSelectedWebtoon(webtoon)
    setIsDeleteModalOpen(true)
    setOpenMenuId(null)
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      author: '',
      genres: [],
      tags: [],
      coverImage: '',
      status: 'draft',
      isPremium: false,
    })
    setSelectedWebtoon(null)
    setTagInput('')
  }

  const toggleGenre = (genre: string) => {
    setFormData((prev) => ({
      ...prev,
      genres: prev.genres.includes(genre)
        ? prev.genres.filter((g) => g !== genre)
        : [...prev.genres, genre],
    }))
  }

  const WebtoonForm = ({ isEdit = false }: { isEdit?: boolean }) => (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (isEdit) {
          handleEditWebtoon()
        } else {
          handleAddWebtoon()
        }
      }}
      className="space-y-4"
    >
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Cover Image</label>
        <div className="flex items-start gap-4">
          <div
            className="w-24 h-32 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50 cursor-pointer hover:border-primary-400 transition-colors"
            onClick={() => setIsMediaPickerOpen(true)}
          >
            {formData.coverImage ? (
              <img src={formData.coverImage} alt="Cover" className="w-full h-full object-cover" />
            ) : (
              <div className="text-center p-2">
                <ImageIcon className="w-8 h-8 mx-auto text-gray-400" />
                <p className="text-xs text-gray-500 mt-1">Click to upload</p>
              </div>
            )}
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-600 mb-2">Recommended: 400x600px, JPG/PNG</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsMediaPickerOpen(true)}
            >
              Choose from Media
            </Button>
            {formData.coverImage && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="ml-2"
                onClick={() => setFormData({ ...formData, coverImage: '' })}
              >
                Remove
              </Button>
            )}
          </div>
        </div>
      </div>

      <Input
        label="Title"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        required
      />
      <div>
        <label
          htmlFor={`${isEdit ? 'edit' : 'add'}-description`}
          className="block text-sm font-medium text-gray-700 mb-1.5"
        >
          Description
        </label>
        <textarea
          id={`${isEdit ? 'edit' : 'add'}-description`}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
          className="input-base"
          required
        />
      </div>
      <div>
        <label
          htmlFor={`${isEdit ? 'edit' : 'add'}-author`}
          className="block text-sm font-medium text-gray-700 mb-1.5"
        >
          Author
        </label>
        <select
          id={`${isEdit ? 'edit' : 'add'}-author`}
          value={formData.author}
          onChange={(e) => setFormData({ ...formData, author: e.target.value })}
          className="input-base"
          required
        >
          <option value="">Select author</option>
          {mockAuthors.map((author) => (
            <option key={author.id} value={author.id}>
              {author.name.en}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Genres</label>
        <div className="flex flex-wrap gap-2">
          {mockGenres.map((genre) => (
            <button
              key={genre.id}
              type="button"
              onClick={() => toggleGenre(genre.name.en)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                formData.genres.includes(genre.name.en)
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {genre.name.en}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Tags</label>
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {formData.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-sm"
              >
                #{tag}
                <button
                  type="button"
                  title={`Remove tag: ${tag}`}
                  onClick={() => removeTag(tag)}
                  className="hover:text-red-500"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              placeholder="Type tag and press Enter..."
              className="flex-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="flex flex-wrap gap-1">
            <span className="text-xs text-gray-500 mr-2">Popular:</span>
            {popularTags
              .filter((t) => !formData.tags.includes(t))
              .slice(0, 8)
              .map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => addTag(tag)}
                  className="text-xs px-2 py-0.5 bg-gray-50 text-gray-600 rounded hover:bg-gray-100"
                >
                  #{tag}
                </button>
              ))}
          </div>
        </div>
      </div>
      <div>
        <label
          htmlFor={`${isEdit ? 'edit' : 'add'}-status`}
          className="block text-sm font-medium text-gray-700 mb-1.5"
        >
          Status
        </label>
        <select
          id={`${isEdit ? 'edit' : 'add'}-status`}
          value={formData.status}
          onChange={(e) =>
            setFormData({ ...formData, status: e.target.value as Webtoon['status'] })
          }
          className="input-base"
        >
          <option value="draft">Draft</option>
          <option value="ongoing">Ongoing</option>
          <option value="completed">Completed</option>
          <option value="hiatus">Hiatus</option>
        </select>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id={`${isEdit ? 'edit' : 'add'}IsPremium`}
          checked={formData.isPremium}
          onChange={(e) => setFormData({ ...formData, isPremium: e.target.checked })}
          className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
        />
        <label htmlFor={`${isEdit ? 'edit' : 'add'}IsPremium`} className="text-sm text-gray-700">
          Premium Content
        </label>
      </div>
      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            if (isEdit) {
              setIsEditModalOpen(false)
            } else {
              setIsAddModalOpen(false)
            }
            resetForm()
          }}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={!formData.title || !formData.author}>
          {isEdit ? 'Save Changes' : 'Add Webtoon'}
        </Button>
      </div>
    </form>
  )

  return (
    <>
      <PageSEO.Webtoons />
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Webtoons</h1>
            <p className="text-gray-500 mt-1">Manage your webtoon collection</p>
          </div>
          <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setIsAddModalOpen(true)}>
            Add Webtoon
          </Button>
        </div>

        <Card>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search webtoons..."
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
                <tr className="border-b border-gray-200">
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
              <tbody className="divide-y divide-gray-200">
                {filteredWebtoons.map((webtoon) => (
                  <tr key={webtoon.id} className="hover:bg-gray-50">
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        {webtoon.coverImage ? (
                          <img
                            src={webtoon.coverImage}
                            alt={webtoon.title.en}
                            className="w-12 h-16 rounded-lg object-cover flex-shrink-0"
                          />
                        ) : (
                          <div
                            className={`w-12 h-16 rounded-lg ${webtoon.coverColor} flex-shrink-0`}
                          />
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{webtoon.title.en}</p>
                          <p className="text-xs text-gray-500 line-clamp-1 max-w-[200px]">
                            {webtoon.description.en}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">{webtoon.author.name.en}</td>
                    <td className="table-cell">
                      <div className="flex flex-wrap gap-1">
                        {webtoon.genres.slice(0, 2).map((genre) => (
                          <span key={genre} className="badge-primary">
                            {genre}
                          </span>
                        ))}
                        {webtoon.genres.length > 2 && (
                          <span className="badge bg-gray-100 text-gray-600">
                            +{webtoon.genres.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="flex flex-wrap gap-1">
                        {(webtoon.tags || []).slice(0, 2).map((tag) => (
                          <span key={tag} className="text-xs text-gray-500">
                            #{tag}
                          </span>
                        ))}
                        {(webtoon.tags || []).length > 2 && (
                          <span className="text-xs text-gray-400">
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
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
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
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>
                        {openMenuId === webtoon.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                            <button
                              type="button"
                              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              <Eye className="w-4 h-4" />
                              View Details
                            </button>
                            <button
                              type="button"
                              onClick={() => openEditModal(webtoon)}
                              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              <Edit className="w-4 h-4" />
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => openDeleteModal(webtoon)}
                              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredWebtoons.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No webtoons found</p>
            </div>
          )}
        </Card>

        <Modal
          isOpen={isAddModalOpen}
          onClose={() => {
            setIsAddModalOpen(false)
            resetForm()
          }}
          title="Add New Webtoon"
          size="lg"
        >
          <WebtoonForm />
        </Modal>

        <Modal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false)
            resetForm()
          }}
          title="Edit Webtoon"
          size="lg"
        >
          <WebtoonForm isEdit />
        </Modal>

        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false)
            setSelectedWebtoon(null)
          }}
          title="Delete Webtoon"
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              Are you sure you want to delete <strong>{selectedWebtoon?.title.en}</strong>? This action
              cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="secondary"
                onClick={() => {
                  setIsDeleteModalOpen(false)
                  setSelectedWebtoon(null)
                }}
              >
                Cancel
              </Button>
              <Button variant="danger" onClick={handleDeleteWebtoon}>
                Delete
              </Button>
            </div>
          </div>
        </Modal>

        <MediaPicker
          isOpen={isMediaPickerOpen}
          onClose={() => setIsMediaPickerOpen(false)}
          onSelect={handleCoverSelect}
          accept="image"
        />
      </div>
    </>
  )
}

export default WebtoonsPage
