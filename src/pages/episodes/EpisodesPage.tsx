import { useState, useRef } from 'react'
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
  X,
  Clock,
} from 'lucide-react'
import { Card, Button, Input, Modal, PageSEO } from '../../components'
import MediaPicker from '../../components/MediaPicker/MediaPicker'
import type { MediaFile } from '../../components/MediaPicker/MediaPicker'
import { mockEpisodes, mockWebtoons } from '../../demo'
import type { Episode } from '../../types'

interface EpisodeImage {
  id: string
  url: string
  order: number
}

const EpisodesPage = () => {
  const [episodes, setEpisodes] = useState<Episode[]>(mockEpisodes)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [webtoonFilter, setWebtoonFilter] = useState<string>('all')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isBulkUploadModalOpen, setIsBulkUploadModalOpen] = useState(false)
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const pdfInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    webtoonId: '',
    isPremium: false,
    coinPrice: 0,
    status: 'draft' as Episode['status'],
    images: [] as EpisodeImage[],
    pdfFile: null as MediaFile | null,
    scheduledAt: '',
  })

  const [bulkUploadData, setBulkUploadData] = useState({
    webtoonId: '',
    files: [] as File[],
    splitByPage: false,
    pagesPerEpisode: 10,
  })

  const filteredEpisodes = episodes.filter((episode) => {
    const matchesSearch = episode.title.en.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || episode.status === statusFilter
    const matchesWebtoon = webtoonFilter === 'all' || episode.webtoonId === webtoonFilter
    return matchesSearch && matchesStatus && matchesWebtoon
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

  const getStatusBadge = (status: Episode['status']) => {
    const styles = {
      published: 'badge-success',
      draft: 'bg-gray-100 text-gray-800',
      scheduled: 'badge-warning',
    }
    return styles[status]
  }

  const handleImageSelect = (files: MediaFile[]) => {
    const newImages: EpisodeImage[] = files.map((file, index) => ({
      id: file.id,
      url: file.url,
      order: formData.images.length + index + 1,
    }))
    setFormData({ ...formData, images: [...formData.images, ...newImages] })
    setIsMediaPickerOpen(false)
  }

  const handlePdfSelect = (files: MediaFile[]) => {
    if (files.length > 0 && files[0].type === 'pdf') {
      setFormData({ ...formData, pdfFile: files[0] })
    }
    setIsMediaPickerOpen(false)
  }

  const removeImage = (imageId: string) => {
    setFormData({
      ...formData,
      images: formData.images
        .filter((img) => img.id !== imageId)
        .map((img, index) => ({ ...img, order: index + 1 })),
    })
  }

  const moveImage = (imageId: string, direction: 'up' | 'down') => {
    const currentIndex = formData.images.findIndex((img) => img.id === imageId)
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === formData.images.length - 1)
    ) {
      return
    }

    const newImages = [...formData.images]
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    ;[newImages[currentIndex], newImages[targetIndex]] = [
      newImages[targetIndex],
      newImages[currentIndex],
    ]

    setFormData({
      ...formData,
      images: newImages.map((img, index) => ({ ...img, order: index + 1 })),
    })
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      Array.from(files).forEach((file) => {
        if (file.type.startsWith('image/')) {
          const newImage: EpisodeImage = {
            id: Math.random().toString(36).slice(2, 11),
            url: URL.createObjectURL(file),
            order: formData.images.length + 1,
          }
          setFormData((prev) => ({ ...prev, images: [...prev.images, newImage] }))
        }
      })
    }
  }

  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type === 'application/pdf') {
      const newPdf: MediaFile = {
        id: Math.random().toString(36).slice(2, 11),
        name: file.name,
        type: 'pdf',
        url: URL.createObjectURL(file),
        size: file.size,
        uploadedAt: new Date().toISOString().split('T')[0],
        category: 'episodes',
      }
      setFormData({ ...formData, pdfFile: newPdf })
    }
  }

  const handleAddEpisode = () => {
    const webtoon = mockWebtoons.find((w) => w.id === formData.webtoonId)
    const newEpisode: Episode = {
      id: `${Date.now()}`,
      webtoonId: formData.webtoonId,
      webtoonTitle: webtoon?.title || { en: '', mm: '' },
      title: { en: formData.title, mm: formData.title },
      description: formData.description ? { en: formData.description, mm: formData.description } : undefined,
      images: formData.images.map((img) => img.url),
      isPremium: formData.isPremium,
      coinPrice: formData.coinPrice,
      viewCount: 0,
      likeCount: 0,
      episodeNumber: episodes.filter((e) => e.webtoonId === formData.webtoonId).length + 1,
      status: formData.status,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    }
    setEpisodes([newEpisode, ...episodes])
    setIsAddModalOpen(false)
    resetForm()
  }

  const handleEditEpisode = () => {
    if (!selectedEpisode) return
    setEpisodes(
      episodes.map((e) =>
        e.id === selectedEpisode.id
          ? {
              ...e,
              title: { en: formData.title, mm: formData.title },
              description: formData.description ? { en: formData.description, mm: formData.description } : undefined,
              images: formData.images.map((img) => img.url),
              isPremium: formData.isPremium,
              coinPrice: formData.coinPrice,
              status: formData.status,
              updatedAt: new Date().toISOString().split('T')[0],
            }
          : e
      )
    )
    setIsEditModalOpen(false)
    resetForm()
  }

  const handleDeleteEpisode = () => {
    if (!selectedEpisode) return
    setEpisodes(episodes.filter((e) => e.id !== selectedEpisode.id))
    setIsDeleteModalOpen(false)
    setSelectedEpisode(null)
  }

  const handleBulkUpload = () => {
    if (!bulkUploadData.webtoonId || bulkUploadData.files.length === 0) return

    const webtoon = mockWebtoons.find((w) => w.id === bulkUploadData.webtoonId)
    const currentEpisodes = episodes.filter((e) => e.webtoonId === bulkUploadData.webtoonId)

    if (bulkUploadData.splitByPage && bulkUploadData.files.length === 1) {
      const totalPages = Math.ceil(bulkUploadData.files[0].size / 50000)
      const episodesToCreate = Math.ceil(totalPages / bulkUploadData.pagesPerEpisode)

      for (let i = 0; i < episodesToCreate; i++) {
        const newEpisode: Episode = {
          id: `${Date.now()}-${i}`,
          webtoonId: bulkUploadData.webtoonId,
          webtoonTitle: webtoon?.title || { en: '', mm: '' },
          title: { en: `Episode ${currentEpisodes.length + i + 1}`, mm: `Episode ${currentEpisodes.length + i + 1}` },
          description: { en: '', mm: '' },
          images: [],
          isPremium: false,
          coinPrice: 0,
          viewCount: 0,
          likeCount: 0,
          episodeNumber: currentEpisodes.length + i + 1,
          status: 'draft',
          createdAt: new Date().toISOString().split('T')[0],
          updatedAt: new Date().toISOString().split('T')[0],
        }
        setEpisodes((prev) => [newEpisode, ...prev])
      }
    } else {
      bulkUploadData.files.forEach((file, index) => {
        const newEpisode: Episode = {
          id: `${Date.now()}-${index}`,
          webtoonId: bulkUploadData.webtoonId,
          webtoonTitle: webtoon?.title || { en: '', mm: '' },
          title: { en: `Episode ${currentEpisodes.length + index + 1}`, mm: `Episode ${currentEpisodes.length + index + 1}` },
          description: { en: '', mm: '' },
          images: [URL.createObjectURL(file)],
          isPremium: false,
          coinPrice: 0,
          viewCount: 0,
          likeCount: 0,
          episodeNumber: currentEpisodes.length + index + 1,
          status: 'draft',
          createdAt: new Date().toISOString().split('T')[0],
          updatedAt: new Date().toISOString().split('T')[0],
        }
        setEpisodes((prev) => [newEpisode, ...prev])
      })
    }

    setIsBulkUploadModalOpen(false)
    setBulkUploadData({
      webtoonId: '',
      files: [],
      splitByPage: false,
      pagesPerEpisode: 10,
    })
  }

  const openEditModal = (episode: Episode) => {
    setSelectedEpisode(episode)
    setFormData({
      title: episode.title.en,
      description: episode.description?.en || '',
      webtoonId: episode.webtoonId,
      isPremium: episode.isPremium,
      coinPrice: episode.coinPrice,
      status: episode.status,
      images: episode.images.map((url, index) => ({ id: `${index}`, url, order: index + 1 })),
      pdfFile: null,
      scheduledAt: '',
    })
    setIsEditModalOpen(true)
    setOpenMenuId(null)
  }

  const openDeleteModal = (episode: Episode) => {
    setSelectedEpisode(episode)
    setIsDeleteModalOpen(true)
    setOpenMenuId(null)
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      webtoonId: '',
      isPremium: false,
      coinPrice: 0,
      status: 'draft',
      images: [],
      pdfFile: null,
      scheduledAt: '',
    })
    setSelectedEpisode(null)
  }

  const EpisodeForm = ({ isEdit = false }: { isEdit?: boolean }) => (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (isEdit) {
          handleEditEpisode()
        } else {
          handleAddEpisode()
        }
      }}
      className="space-y-4"
    >
      {!isEdit && (
        <div>
          <label
            htmlFor={`${isEdit ? 'edit' : 'add'}-webtoon`}
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            Webtoon
          </label>
          <select
            id={`${isEdit ? 'edit' : 'add'}-webtoon`}
            value={formData.webtoonId}
            onChange={(e) => setFormData({ ...formData, webtoonId: e.target.value })}
            className="input-base"
            required
          >
            <option value="">Select webtoon</option>
            {mockWebtoons
              .filter((w) => w.status !== 'draft')
              .map((webtoon) => (
                <option key={webtoon.id} value={webtoon.id}>
                  {webtoon.title.en}
                </option>
              ))}
          </select>
        </div>
      )}
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
          rows={2}
          className="input-base"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Episode Images</label>
        <div className="space-y-3">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setIsMediaPickerOpen(true)
              }}
            >
              <ImageIcon className="w-4 h-4 mr-1" />
              From Media
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-4 h-4 mr-1" />
              Upload
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              aria-label="Upload episode images"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          {formData.images.length > 0 && (
            <div className="border rounded-lg p-3 max-h-60 overflow-y-auto">
              <p className="text-xs text-gray-500 mb-2">{formData.images.length} images</p>
              <div className="grid grid-cols-4 gap-2">
                {formData.images.map((image, index) => (
                  <div
                    key={image.id}
                    className="relative group aspect-[3/4] rounded overflow-hidden border"
                  >
                    <img
                      src={image.url}
                      alt={`Page ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => moveImage(image.id, 'up')}
                        className="p-1 bg-white rounded text-xs"
                        disabled={index === 0}
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => moveImage(image.id, 'down')}
                        className="p-1 bg-white rounded text-xs"
                        disabled={index === formData.images.length - 1}
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        title="Remove image"
                        onClick={() => removeImage(image.id)}
                        className="p-1 bg-red-500 text-white rounded text-xs"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                    <span className="absolute bottom-1 left-1 text-xs bg-black/70 text-white px-1 rounded">
                      {index + 1}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          PDF File (Optional)
        </label>
        <div className="flex gap-2 items-center">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setIsMediaPickerOpen(true)
            }}
          >
            <FileText className="w-4 h-4 mr-1" />
            From Media
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => pdfInputRef.current?.click()}
          >
            <Upload className="w-4 h-4 mr-1" />
            Upload PDF
          </Button>
          <input
            ref={pdfInputRef}
            type="file"
            accept=".pdf"
            aria-label="Upload PDF file"
            onChange={handlePdfUpload}
            className="hidden"
          />
        </div>
        {formData.pdfFile && (
          <div className="mt-2 flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
            <FileText className="w-5 h-5 text-red-500" />
            <span className="text-sm text-gray-700">{formData.pdfFile.name}</span>
            <button
              type="button"
              title="Remove PDF file"
              onClick={() => setFormData({ ...formData, pdfFile: null })}
              className="ml-auto text-gray-400 hover:text-red-500"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
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
              setFormData({ ...formData, status: e.target.value as Episode['status'] })
            }
            className="input-base"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="scheduled">Scheduled</option>
          </select>
        </div>
        {formData.status === 'scheduled' && (
          <div>
            <label
              htmlFor={`${isEdit ? 'edit' : 'add'}-scheduled`}
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Schedule Date
            </label>
            <input
              id={`${isEdit ? 'edit' : 'add'}-scheduled`}
              type="datetime-local"
              value={formData.scheduledAt}
              onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
              className="input-base"
            />
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id={`${isEdit ? 'edit' : 'add'}EpisodeIsPremium`}
          checked={formData.isPremium}
          onChange={(e) =>
            setFormData({
              ...formData,
              isPremium: e.target.checked,
              coinPrice: e.target.checked ? 5 : 0,
            })
          }
          className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
        />
        <label
          htmlFor={`${isEdit ? 'edit' : 'add'}EpisodeIsPremium`}
          className="text-sm text-gray-700"
        >
          Premium Content
        </label>
      </div>
      {formData.isPremium && (
        <Input
          label="Coin Price"
          type="number"
          min={1}
          value={formData.coinPrice}
          onChange={(e) => setFormData({ ...formData, coinPrice: parseInt(e.target.value) || 0 })}
        />
      )}
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
        <Button type="submit" disabled={!formData.title || (!isEdit && !formData.webtoonId)}>
          {isEdit ? 'Save Changes' : 'Add Episode'}
        </Button>
      </div>
    </form>
  )

  return (
    <>
      <PageSEO.Episodes />
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Episodes</h1>
            <p className="text-gray-500 mt-1">Manage webtoon episodes</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              leftIcon={<Upload className="w-4 h-4" />}
              onClick={() => setIsBulkUploadModalOpen(true)}
            >
              Bulk Upload
            </Button>
            <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setIsAddModalOpen(true)}>
              Add Episode
            </Button>
          </div>
        </div>

        <Card>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search episodes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="w-5 h-5" />}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                aria-label="Filter by webtoon"
                value={webtoonFilter}
                onChange={(e) => setWebtoonFilter(e.target.value)}
                className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Webtoons</option>
                {mockWebtoons.map((webtoon) => (
                  <option key={webtoon.id} value={webtoon.id}>
                    {webtoon.title.en}
                  </option>
                ))}
              </select>
              <select
                aria-label="Filter by status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
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
                <tr className="border-b border-gray-200">
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
              <tbody className="divide-y divide-gray-200">
                {filteredEpisodes.map((episode) => (
                  <tr key={episode.id} className="hover:bg-gray-50">
                    <td className="table-cell">
                      <div>
                        <p className="font-medium text-gray-900">
                          Ep. {episode.episodeNumber}: {episode.title.en}
                        </p>
                        {episode.description && (
                          <p className="text-xs text-gray-500 line-clamp-1 max-w-[200px]">
                            {episode.description.en}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="table-cell">{episode.webtoonTitle.en}</td>
                    <td className="table-cell">
                      <span className="text-sm text-gray-600">
                        {episode.images.length} {episode.images.length === 1 ? 'image' : 'images'}
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className={getStatusBadge(episode.status)}>{episode.status}</span>
                      {episode.status === 'scheduled' && (
                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                          <Clock className="w-3 h-3" />
                          <span>Scheduled</span>
                        </div>
                      )}
                    </td>
                    <td className="table-cell">
                      {episode.isPremium ? (
                        <span className="badge-primary">{episode.coinPrice} coins</span>
                      ) : (
                        <span className="badge bg-gray-100 text-gray-600">Free</span>
                      )}
                    </td>
                    <td className="table-cell">{formatNumber(episode.viewCount)}</td>
                    <td className="table-cell">{formatNumber(episode.likeCount)}</td>
                    <td className="table-cell text-gray-500">{episode.createdAt}</td>
                    <td className="table-cell text-right">
                      <div className="relative inline-block">
                        <button
                          type="button"
                          title="Episode actions"
                          aria-label="Episode actions menu"
                          onClick={() =>
                            setOpenMenuId(openMenuId === episode.id ? null : episode.id)
                          }
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>
                        {openMenuId === episode.id && (
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
                              onClick={() => openEditModal(episode)}
                              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              <Edit className="w-4 h-4" />
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => openDeleteModal(episode)}
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

          {filteredEpisodes.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No episodes found</p>
            </div>
          )}
        </Card>

        <Modal
          isOpen={isAddModalOpen}
          onClose={() => {
            setIsAddModalOpen(false)
            resetForm()
          }}
          title="Add New Episode"
          size="lg"
        >
          <EpisodeForm />
        </Modal>

        <Modal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false)
            resetForm()
          }}
          title="Edit Episode"
          size="lg"
        >
          <EpisodeForm isEdit />
        </Modal>

        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false)
            setSelectedEpisode(null)
          }}
          title="Delete Episode"
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              Are you sure you want to delete <strong>{selectedEpisode?.title.en}</strong>? This action
              cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="secondary"
                onClick={() => {
                  setIsDeleteModalOpen(false)
                  setSelectedEpisode(null)
                }}
              >
                Cancel
              </Button>
              <Button variant="danger" onClick={handleDeleteEpisode}>
                Delete
              </Button>
            </div>
          </div>
        </Modal>

        <Modal
          isOpen={isBulkUploadModalOpen}
          onClose={() => {
            setIsBulkUploadModalOpen(false)
            setBulkUploadData({
              webtoonId: '',
              files: [],
              splitByPage: false,
              pagesPerEpisode: 10,
            })
          }}
          title="Bulk Upload Episodes"
          size="lg"
        >
          <div className="space-y-4">
            <div>
              <label
                htmlFor="bulk-webtoon"
                className="block text-sm font-medium text-gray-700 mb-1.5"
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
                {mockWebtoons
                  .filter((w) => w.status !== 'draft')
                  .map((webtoon) => (
                    <option key={webtoon.id} value={webtoon.id}>
                      {webtoon.title.en}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Upload Files</label>
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-primary-400 transition-colors"
                onClick={() => {
                  const input = document.createElement('input')
                  input.type = 'file'
                  input.accept = 'image/*,.pdf'
                  input.multiple = true
                  input.onchange = (e) => {
                    const files = (e.target as HTMLInputElement).files
                    if (files) {
                      setBulkUploadData({ ...bulkUploadData, files: Array.from(files) })
                    }
                  }
                  input.click()
                }}
              >
                <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 mb-2">Click to upload or drag and drop</p>
                <p className="text-sm text-gray-400">Images (JPG, PNG) or PDF files</p>
              </div>
            </div>

            {bulkUploadData.files.length > 0 && (
              <div className="border rounded-lg p-3">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  {bulkUploadData.files.length} file(s) selected
                </p>
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {bulkUploadData.files.map((file, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      {file.type.startsWith('image/') ? (
                        <ImageIcon className="w-4 h-4 text-blue-500" />
                      ) : (
                        <FileText className="w-4 h-4 text-red-500" />
                      )}
                      <span className="text-gray-700">{file.name}</span>
                      <span className="text-gray-400 text-xs">
                        ({(file.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {bulkUploadData.files.length === 1 &&
              bulkUploadData.files[0].type === 'application/pdf' && (
                <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="splitByPage"
                      checked={bulkUploadData.splitByPage}
                      onChange={(e) =>
                        setBulkUploadData({ ...bulkUploadData, splitByPage: e.target.checked })
                      }
                      className="w-4 h-4 rounded border-gray-300 text-primary-600"
                    />
                    <label htmlFor="splitByPage" className="text-sm text-gray-700">
                      Split PDF into multiple episodes
                    </label>
                  </div>
                  {bulkUploadData.splitByPage && (
                    <div>
                      <label htmlFor="pagesPerEpisode" className="block text-sm text-gray-600 mb-1">
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
                        className="w-24 px-3 py-2 border rounded-lg text-sm"
                      />
                    </div>
                  )}
                </div>
              )}

            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="secondary"
                onClick={() => {
                  setIsBulkUploadModalOpen(false)
                  setBulkUploadData({
                    webtoonId: '',
                    files: [],
                    splitByPage: false,
                    pagesPerEpisode: 10,
                  })
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleBulkUpload}
                disabled={!bulkUploadData.webtoonId || bulkUploadData.files.length === 0}
              >
                Upload {bulkUploadData.files.length > 0 && `(${bulkUploadData.files.length})`}
              </Button>
            </div>
          </div>
        </Modal>

        <MediaPicker
          isOpen={isMediaPickerOpen}
          onClose={() => setIsMediaPickerOpen(false)}
          onSelect={(files) => {
            const imageFiles = files.filter((f) => f.type === 'image')
            if (imageFiles.length > 0) {
              handleImageSelect(imageFiles)
            } else if (files.length > 0 && files[0].type === 'pdf') {
              handlePdfSelect(files)
            }
          }}
          accept="all"
          multiple
        />
      </div>
    </>
  )
}

export default EpisodesPage
