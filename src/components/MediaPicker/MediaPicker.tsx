import { useState, useRef } from 'react'
import { Upload, X, Image as ImageIcon, FileText } from 'lucide-react'
import Button from '../Button/Button'

interface MediaFile {
  id: string
  name: string
  type: 'image' | 'pdf'
  url: string
  size: number
  dimensions?: { width: number; height: number }
  pageCount?: number
  uploadedAt: string
  category: string
}

interface MediaPickerProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (files: MediaFile[]) => void
  multiple?: boolean
  accept?: 'image' | 'pdf' | 'all'
}

const mockMediaFiles: MediaFile[] = [
  {
    id: '1',
    name: 'webtoon-cover-1.jpg',
    type: 'image',
    url: 'https://picsum.photos/seed/1/400/600',
    size: 245000,
    dimensions: { width: 400, height: 600 },
    uploadedAt: '2026-04-27',
    category: 'covers',
  },
  {
    id: '2',
    name: 'webtoon-cover-2.jpg',
    type: 'image',
    url: 'https://picsum.photos/seed/2/400/600',
    size: 312000,
    dimensions: { width: 400, height: 600 },
    uploadedAt: '2026-04-26',
    category: 'covers',
  },
  {
    id: '3',
    name: 'episode-1-page-1.jpg',
    type: 'image',
    url: 'https://picsum.photos/seed/3/800/1200',
    size: 456000,
    dimensions: { width: 800, height: 1200 },
    uploadedAt: '2026-04-25',
    category: 'episodes',
  },
  {
    id: '4',
    name: 'chapter-1.pdf',
    type: 'pdf',
    url: '/uploads/chapter-1.pdf',
    size: 2500000,
    pageCount: 15,
    uploadedAt: '2026-04-24',
    category: 'pdfs',
  },
]

const MediaPicker = ({
  isOpen,
  onClose,
  onSelect,
  multiple = false,
  accept = 'all',
}: MediaPickerProps) => {
  const [files, setFiles] = useState<MediaFile[]>(mockMediaFiles)
  const [selectedFiles, setSelectedFiles] = useState<MediaFile[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'image' | 'pdf'>('all')
  const [filterCategory, setFilterCategory] = useState('all')
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  const filteredFiles = files.filter((file) => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = filterType === 'all' || file.type === filterType
    const matchesCategory = filterCategory === 'all' || file.category === filterCategory
    const matchesAccept = accept === 'all' || file.type === accept
    return matchesSearch && matchesType && matchesCategory && matchesAccept
  })

  const toggleSelect = (file: MediaFile) => {
    if (multiple) {
      setSelectedFiles((prev) =>
        prev.find((f) => f.id === file.id) ? prev.filter((f) => f.id !== file.id) : [...prev, file]
      )
    } else {
      setSelectedFiles([file])
    }
  }

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = e.target.files
    if (uploadedFiles) {
      Array.from(uploadedFiles).forEach((file) => {
        const newFile: MediaFile = {
          id: Math.random().toString(36).substring(2, 11),
          name: file.name,
          type: file.type.startsWith('image/') ? 'image' : 'pdf',
          url: URL.createObjectURL(file),
          size: file.size,
          uploadedAt: new Date().toISOString().split('T')[0],
          category: 'general',
        }
        setFiles((prev) => [newFile, ...prev])
      })
    }
  }

  const handleConfirm = () => {
    onSelect(selectedFiles)
    setSelectedFiles([])
    onClose()
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Select Media</h2>
          <button
            type="button"
            title="Close"
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 border-b space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search files..."
                aria-label="Search files"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
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
              <option value="pdfs">PDFs</option>
              <option value="general">General</option>
            </select>
          </div>

          <div className="flex items-center gap-4">
            <input
              ref={fileInputRef}
              type="file"
              accept={accept === 'image' ? 'image/*' : accept === 'pdf' ? '.pdf' : 'image/*,.pdf'}
              multiple
              aria-label="Upload new file"
              onChange={handleUpload}
              className="hidden"
            />
            <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
              <Upload className="w-4 h-4 mr-2" />
              Upload New
            </Button>
            {selectedFiles.length > 0 && (
              <span className="text-sm text-gray-500">{selectedFiles.length} selected</span>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-4 gap-4">
            {filteredFiles.map((file) => (
              <div
                key={file.id}
                onClick={() => toggleSelect(file)}
                className={`relative rounded-lg border-2 cursor-pointer overflow-hidden transition-all ${
                  selectedFiles.find((f) => f.id === file.id)
                    ? 'border-primary-500 ring-2 ring-primary-200'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {file.type === 'image' ? (
                  <img src={file.url} alt={file.name} className="w-full h-32 object-cover" />
                ) : (
                  <div className="w-full h-32 bg-gray-100 flex items-center justify-center">
                    <FileText className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                <div className="p-2">
                  <p className="text-xs font-medium text-gray-900 truncate">{file.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                </div>
                {selectedFiles.find((f) => f.id === file.id) && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>

          {filteredFiles.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <ImageIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No files found</p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 p-4 border-t">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={selectedFiles.length === 0}>
            Select {selectedFiles.length > 0 && `(${selectedFiles.length})`}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default MediaPicker
export type { MediaFile }
