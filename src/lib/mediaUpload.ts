import type { MediaFile } from '@softgate/shared';

export const MAX_IMAGE_UPLOAD_BYTES = 2 * 1024 * 1024;

export class MediaUploadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MediaUploadError';
  }
}

const createId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2, 11);

const todayIsoDate = () => new Date().toISOString().split('T')[0];

const readAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new MediaUploadError('Failed to read image file'));
      }
    };
    reader.onerror = () => reject(new MediaUploadError('Failed to read image file'));
    reader.readAsDataURL(file);
  });

/** Persistable image upload for mock Media Storage (data URL survives refresh). */
export const readImageAsMediaFile = async (file: File, category: string): Promise<MediaFile> => {
  if (!file.type.startsWith('image/')) {
    throw new MediaUploadError('Only image files are allowed');
  }
  if (file.size > MAX_IMAGE_UPLOAD_BYTES) {
    throw new MediaUploadError('Image must be 2MB or smaller');
  }

  const url = await readAsDataUrl(file);

  return {
    id: createId(),
    name: file.name,
    type: 'image',
    url,
    size: file.size,
    uploadedAt: todayIsoDate(),
    category,
  };
};

/** Library upload: images as data URL; PDFs as blob URL (may not survive refresh). */
export const readFileAsMediaFile = async (file: File, category = 'general'): Promise<MediaFile> => {
  if (file.type.startsWith('image/')) {
    return readImageAsMediaFile(file, category);
  }

  if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
    return {
      id: createId(),
      name: file.name,
      type: 'pdf',
      url: URL.createObjectURL(file),
      size: file.size,
      uploadedAt: todayIsoDate(),
      category: category === 'general' ? 'pdfs' : category,
    };
  }

  throw new MediaUploadError('Only image or PDF files are allowed');
};
