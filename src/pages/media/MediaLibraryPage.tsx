import { useState } from 'react'
import { Search, Upload, Trash2, Eye, Copy, FileText, Image as ImageIcon } from 'lucide-react'
import { Card, Button, Input, PageSEO } from '../../components'
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog'
import { mockMediaFiles } from '../../demo'
import type { MediaFile } from '@webpad/shared'

const MediaLibraryPage = () => {
  const [files, setFiles] = useState<MediaFile[]>(mockMediaFiles)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'image' | 'pdf'>('all')
  const [filterCategory, setFilterCategory] = useState('all')
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, fileIds: [] as string[] })
  const [previewFile, setPreviewFile] = useState<MediaFile | null>(null)

  const filteredFiles = files.filter((file) => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = filterType === 'all' || file.type === filterType
    const matchesCategory = filterCategory === 'all' || file.category === filterCategory
    return matchesSearch && matchesType && matchesCategory
  })

  const formatFileSize = (bytes: number) => {
    if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(1)} MB`
    if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${bytes} B`
  }

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url)
  }

  const toggleSelect = (id: string) => {
    setSelectedFiles((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]))
  }

  const handleDelete = () => {
    setFiles((prev) => prev.filter((f) => !deleteDialog.fileIds.includes(f.id)))
    setSelectedFiles([])
    setDeleteDialog({ isOpen: false, fileIds: [] })
  }

  return (
    <>
      <PageSEO.Media />
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Media Library</h1>
            <p className="text-gray-500 mt-1">Manage your media files</p>
          </div>
          <Button>
            <Upload className="w-4 h-4 mr-2" />
            Upload
          </Button>
        </div>

        <Card>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              aria-label="Filter by file type"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as 'all' | 'image' | 'pdf')}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="all">All Types</option>
              <option value="image">Images</option>
              <option value="pdf">PDFs</option>
            </select>
            <select
              aria-label="Filter by category"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="all">All Categories</option>
              <option value="covers">Covers</option>
              <option value="episodes">Episodes</option>
              <option value="avatars">Avatars</option>
              <option value="pdfs">PDFs</option>
              <option value="general">General</option>
            </select>
          </div>

          {selectedFiles.length > 0 && (
            <div className="flex items-center gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">{selectedFiles.length} selected</span>
              <Button
                variant="danger"
                size="sm"
                onClick={() => setDeleteDialog({ isOpen: true, fileIds: selectedFiles })}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Selected
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setSelectedFiles([])}>
                Clear Selection
              </Button>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredFiles.map((file) => (
              <div
                key={file.id}
                className={`relative border rounded-lg overflow-hidden group ${
                  selectedFiles.includes(file.id) ? 'border-primary-500' : 'border-gray-200'
                }`}
              >
                <div className="relative">
                  {file.type === 'image' ? (
                    <img src={file.url} alt={file.name} className="w-full h-32 object-cover" />
                  ) : (
                    <div className="w-full h-32 bg-gray-100 flex items-center justify-center">
                      <FileText className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      title="Preview file"
                      onClick={() => setPreviewFile(file)}
                      className="p-2 bg-white rounded-full hover:bg-gray-100"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      title="Copy URL"
                      onClick={() => copyUrl(file.url)}
                      className="p-2 bg-white rounded-full hover:bg-gray-100"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      title="Delete file"
                      onClick={() => setDeleteDialog({ isOpen: true, fileIds: [file.id] })}
                      className="p-2 bg-white rounded-full hover:bg-gray-100"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
                <div className="p-2">
                  <p className="text-xs font-medium text-gray-900 truncate">{file.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                </div>
                <input
                  type="checkbox"
                  aria-label={`Select ${file.name}`}
                  checked={selectedFiles.includes(file.id)}
                  onChange={() => toggleSelect(file.id)}
                  className="absolute top-2 left-2 rounded border-gray-300"
                />
              </div>
            ))}
          </div>

          {filteredFiles.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <ImageIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No files found</p>
            </div>
          )}
        </Card>

        <ConfirmDialog
          isOpen={deleteDialog.isOpen}
          title="Delete Files"
          message={`Are you sure you want to delete ${deleteDialog.fileIds.length} file(s)? This action cannot be undone.`}
          confirmText="Delete"
          variant="danger"
          onConfirm={handleDelete}
          onCancel={() => setDeleteDialog({ isOpen: false, fileIds: [] })}
        />

        {previewFile && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            onClick={() => setPreviewFile(null)}
          >
            <div className="fixed inset-0 bg-black/50" />
            <div
              className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{previewFile.name}</h3>
                <button
                  type="button"
                  title="Close preview"
                  onClick={() => setPreviewFile(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
              {previewFile.type === 'image' ? (
                <img src={previewFile.url} alt={previewFile.name} className="w-full rounded-lg" />
              ) : (
                <div className="h-64 bg-gray-100 flex items-center justify-center rounded-lg">
                  <FileText className="w-16 h-16 text-gray-400" />
                </div>
              )}
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Size:</span> {formatFileSize(previewFile.size)}
                </div>
                <div>
                  <span className="text-gray-500">Type:</span> {previewFile.type.toUpperCase()}
                </div>
                <div>
                  <span className="text-gray-500">Uploaded:</span> {previewFile.uploadedAt}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default MediaLibraryPage
