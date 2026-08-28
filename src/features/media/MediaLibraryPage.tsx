import { useRef, useState } from 'react';
import { Search, Upload, Trash2, Eye, Copy, FileText } from 'lucide-react';
import {
  Card,
  Button,
  Input,
  PageSEO,
  NoMedia,
  NoSearchResults,
  coverSheenClass,
} from '../../components';
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog';
import { useAuth } from '@/features/auth/useAuth';
import { useStaffAccess } from '@/lib/auth/staffAccess';
import { appendActivityLog } from '@/lib/activityLog';
import { useData } from '@/lib/DataContext';
import { apiMessage, isMockApi } from '@/lib/api/http';
import { deleteMedia, uploadMedia } from '@/lib/api/media';
import { MediaUploadError, readFileAsMediaFile } from '@/lib/mediaUpload';
import { useToast } from '../../components/Toast/Toast';
import type { MediaFile } from '@softgate/shared';
import { markIdLoaded } from '@/lib/imageLoaded';
import MediaLibraryPageSkeleton from './components/MediaLibraryPageSkeleton';

const MediaLibraryPage = () => {
  const { user } = useAuth();
  const { canWriteCatalog } = useStaffAccess();
  const { mediaFiles, setMediaFiles, setActivityLogs, isLoading } = useData();
  const { addToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'image' | 'pdf'>('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, fileIds: [] as string[] });
  const [previewFile, setPreviewFile] = useState<(typeof mediaFiles)[number] | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [loadedThumbs, setLoadedThumbs] = useState<Set<string>>(() => new Set());

  const filteredFiles = mediaFiles.filter((file) => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || file.type === filterType;
    const matchesCategory = filterCategory === 'all' || file.category === filterCategory;
    return matchesSearch && matchesType && matchesCategory;
  });

  const formatFileSize = (bytes: number) => {
    if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(1)} MB`;
    if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${bytes} B`;
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
  };

  const toggleSelect = (id: string) => {
    setSelectedFiles((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]));
  };

  const handleDelete = async () => {
    if (!canWriteCatalog) return;
    const deletedFiles = mediaFiles.filter((file) => deleteDialog.fileIds.includes(file.id));
    try {
      if (!isMockApi()) {
        for (const file of deletedFiles) {
          await deleteMedia(file.id);
        }
      }
      setMediaFiles((prev) => prev.filter((f) => !deleteDialog.fileIds.includes(f.id)));
      deletedFiles.forEach((file) => {
        appendActivityLog(setActivityLogs, {
          action: 'delete',
          targetType: 'media',
          targetId: file.id,
          targetName: file.name,
          admin: user,
        });
      });
      setSelectedFiles([]);
      setDeleteDialog({ isOpen: false, fileIds: [] });
    } catch (err) {
      addToast(apiMessage(err, 'Delete failed'), 'error');
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!canWriteCatalog) return;
    const uploaded = e.target.files;
    if (!uploaded?.length) return;

    setIsUploading(true);
    try {
      const nextFiles: MediaFile[] = [];
      for (const file of Array.from(uploaded)) {
        const mediaFile = isMockApi()
          ? await readFileAsMediaFile(file, 'general')
          : (await uploadMedia(file, 'general')).file;
        nextFiles.push(mediaFile);
        if (mediaFile.type === 'pdf' && isMockApi()) {
          addToast('PDF uploaded — preview may not survive a full page refresh', 'info');
        }
      }
      setMediaFiles((prev) => [...nextFiles, ...prev]);
      nextFiles.forEach((file) => {
        appendActivityLog(setActivityLogs, {
          action: 'create',
          targetType: 'media',
          targetId: file.id,
          targetName: file.name,
          admin: user,
        });
      });
      addToast(
        nextFiles.length === 1 ? 'File uploaded' : `${nextFiles.length} files uploaded`,
        'success',
      );
    } catch (err) {
      const message =
        err instanceof MediaUploadError ? err.message : apiMessage(err, 'Upload failed');
      addToast(message, 'error');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  return (
    <>
      <PageSEO.Media />
      {isLoading ? (
        <MediaLibraryPageSkeleton />
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-fg">Media Library</h1>
              <p className="mt-1 text-fg-muted">Manage your media files</p>
            </div>
            {canWriteCatalog ? (
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf,application/pdf"
                  multiple
                  aria-label="Upload media files"
                  className="hidden"
                  onChange={handleUpload}
                />
                <Button
                  isLoading={isUploading}
                  leftIcon={<Upload className="h-4 w-4" />}
                  onClick={() => fileInputRef.current?.click()}
                >
                  Upload
                </Button>
              </div>
            ) : null}
          </div>

          <Card>
            <div className="mb-6 flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-muted" />
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

            {canWriteCatalog && selectedFiles.length > 0 && (
              <div className="mb-4 flex items-center gap-4 rounded-lg bg-gray-50 p-3">
                <span className="text-sm text-fg-secondary">{selectedFiles.length} selected</span>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setDeleteDialog({ isOpen: true, fileIds: selectedFiles })}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Selected
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setSelectedFiles([])}>
                  Clear Selection
                </Button>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {filteredFiles.map((file) => (
                <div
                  key={file.id}
                  className={`group relative overflow-hidden rounded-lg border ${
                    selectedFiles.includes(file.id) ? 'border-primary-500' : 'border-line'
                  }`}
                >
                  <div className="relative">
                    {file.type === 'image' ? (
                      <div className="relative h-32 w-full">
                        <img
                          src={file.url}
                          alt={file.name}
                          className="h-32 w-full object-cover"
                          onLoad={() => markIdLoaded(setLoadedThumbs, file.id)}
                          onError={() => markIdLoaded(setLoadedThumbs, file.id)}
                        />
                        {!loadedThumbs.has(file.id) && <span className={coverSheenClass} />}
                      </div>
                    ) : (
                      <div className="flex h-32 w-full items-center justify-center bg-gray-100">
                        <FileText className="h-12 w-12 text-fg-muted" />
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        type="button"
                        title="Preview file"
                        onClick={() => setPreviewFile(file)}
                        className="rounded-full bg-white p-2 hover:bg-gray-100"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        title="Copy URL"
                        onClick={() => copyUrl(file.url)}
                        className="rounded-full bg-white p-2 hover:bg-gray-100"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      {canWriteCatalog ? (
                        <button
                          type="button"
                          title="Delete file"
                          onClick={() => setDeleteDialog({ isOpen: true, fileIds: [file.id] })}
                          className="rounded-full bg-white p-2 hover:bg-gray-100"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </button>
                      ) : null}
                    </div>
                  </div>
                  <div className="p-2">
                    <p className="truncate text-xs font-medium text-fg">{file.name}</p>
                    <p className="text-xs text-fg-muted">{formatFileSize(file.size)}</p>
                  </div>
                  {canWriteCatalog ? (
                    <input
                      type="checkbox"
                      aria-label={`Select ${file.name}`}
                      checked={selectedFiles.includes(file.id)}
                      onChange={() => toggleSelect(file.id)}
                      className="absolute left-2 top-2 rounded border-line-strong"
                    />
                  ) : null}
                </div>
              ))}
            </div>

            {mediaFiles.length === 0 ? (
              <NoMedia onUpload={() => fileInputRef.current?.click()} />
            ) : filteredFiles.length === 0 ? (
              <NoSearchResults
                query={searchQuery}
                onClear={() => {
                  setSearchQuery('');
                  setFilterType('all');
                  setFilterCategory('all');
                }}
              />
            ) : null}
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
                className="relative mx-4 w-full max-w-2xl rounded-xl bg-white p-4 shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{previewFile.name}</h3>
                  <button
                    type="button"
                    title="Close preview"
                    onClick={() => setPreviewFile(null)}
                    className="rounded-lg p-2 hover:bg-gray-100"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
                {previewFile.type === 'image' ? (
                  <img src={previewFile.url} alt={previewFile.name} className="w-full rounded-lg" />
                ) : (
                  <div className="flex h-64 items-center justify-center rounded-lg bg-gray-100">
                    <FileText className="h-16 w-16 text-fg-muted" />
                  </div>
                )}
                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-fg-muted">Size:</span> {formatFileSize(previewFile.size)}
                  </div>
                  <div>
                    <span className="text-fg-muted">Type:</span> {previewFile.type.toUpperCase()}
                  </div>
                  <div>
                    <span className="text-fg-muted">Uploaded:</span> {previewFile.uploadedAt}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default MediaLibraryPage;
