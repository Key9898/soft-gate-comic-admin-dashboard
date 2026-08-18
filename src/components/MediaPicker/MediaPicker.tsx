import { useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon, FileText } from 'lucide-react';
import type { MediaFile } from '@softgate/shared';
import Button from '../Button/Button';
import { useData } from '@/lib/DataContext';
import { MediaUploadError, readFileAsMediaFile } from '@/lib/mediaUpload';

interface MediaPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (files: MediaFile[]) => void;
  multiple?: boolean;
  accept?: 'image' | 'pdf' | 'all';
}

const MediaPicker = ({
  isOpen,
  onClose,
  onSelect,
  multiple = false,
  accept = 'all',
}: MediaPickerProps) => {
  const { mediaFiles, setMediaFiles } = useData();
  const [selectedFiles, setSelectedFiles] = useState<MediaFile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'image' | 'pdf'>('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const filteredFiles = mediaFiles.filter((file) => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || file.type === filterType;
    const matchesCategory = filterCategory === 'all' || file.category === filterCategory;
    const matchesAccept = accept === 'all' || file.type === accept;
    return matchesSearch && matchesType && matchesCategory && matchesAccept;
  });

  const toggleSelect = (file: MediaFile) => {
    if (multiple) {
      setSelectedFiles((prev) =>
        prev.find((f) => f.id === file.id) ? prev.filter((f) => f.id !== file.id) : [...prev, file],
      );
    } else {
      setSelectedFiles([file]);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = e.target.files;
    if (!uploadedFiles?.length) return;
    setUploadError('');
    try {
      const next: MediaFile[] = [];
      for (const file of Array.from(uploadedFiles)) {
        next.push(await readFileAsMediaFile(file, 'general'));
      }
      setMediaFiles((prev) => [...next, ...prev]);
      setSelectedFiles((prev) => (multiple ? [...next, ...prev] : next.slice(0, 1)));
    } catch (err) {
      setUploadError(err instanceof MediaUploadError ? err.message : 'Upload failed');
    } finally {
      e.target.value = '';
    }
  };

  const handleConfirm = () => {
    onSelect(selectedFiles);
    setSelectedFiles([]);
    onClose();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative mx-4 flex max-h-[90vh] w-full max-w-4xl flex-col rounded-xl bg-surface shadow-xl">
        <div className="flex items-center justify-between border-b border-line p-4">
          <h2 className="text-lg font-semibold text-fg">Select Media</h2>
          <button
            type="button"
            title="Close"
            onClick={onClose}
            className="rounded-lg p-2 text-fg-muted hover:bg-sg-hover hover:text-fg-secondary"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 border-b border-line p-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search files..."
                aria-label="Search files"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-line-strong px-4 py-2 focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <select
              aria-label="Filter by file type"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as 'all' | 'image' | 'pdf')}
              className="rounded-lg border border-line-strong px-4 py-2"
            >
              <option value="all">All Types</option>
              <option value="image">Images</option>
              <option value="pdf">PDFs</option>
            </select>
            <select
              aria-label="Filter by category"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="rounded-lg border border-line-strong px-4 py-2"
            >
              <option value="all">All Categories</option>
              <option value="covers">Covers</option>
              <option value="episodes">Episodes</option>
              <option value="avatars">Avatars</option>
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
              <Upload className="mr-2 h-4 w-4" />
              Upload New
            </Button>
            {selectedFiles.length > 0 && (
              <span className="text-sm text-fg-muted">{selectedFiles.length} selected</span>
            )}
            {uploadError && <span className="text-sm text-red-600">{uploadError}</span>}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-4 gap-4">
            {filteredFiles.map((file) => (
              <div
                key={file.id}
                onClick={() => toggleSelect(file)}
                className={`relative cursor-pointer overflow-hidden rounded-lg border-2 transition-all ${
                  selectedFiles.find((f) => f.id === file.id)
                    ? 'border-primary-500 ring-2 ring-primary-200'
                    : 'border-line hover:border-line-strong'
                }`}
              >
                {file.type === 'image' ? (
                  <img src={file.url} alt={file.name} className="h-32 w-full object-cover" />
                ) : (
                  <div className="flex h-32 w-full items-center justify-center bg-gray-100">
                    <FileText className="h-12 w-12 text-fg-muted" />
                  </div>
                )}
                <div className="p-2">
                  <p className="truncate text-xs font-medium text-fg">{file.name}</p>
                  <p className="text-xs text-fg-muted">{formatFileSize(file.size)}</p>
                </div>
                {selectedFiles.find((f) => f.id === file.id) && (
                  <div className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary-500">
                    <svg
                      className="h-4 w-4 text-white"
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
            <div className="py-12 text-center text-fg-muted">
              <ImageIcon className="mx-auto mb-4 h-12 w-12 text-fg-muted" />
              <p>No files found</p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-line p-4">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={selectedFiles.length === 0}>
            Select {selectedFiles.length > 0 && `(${selectedFiles.length})`}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MediaPicker;
export type { MediaFile };
