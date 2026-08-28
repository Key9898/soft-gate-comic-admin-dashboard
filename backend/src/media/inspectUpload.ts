import { randomUUID } from 'node:crypto';

export const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
export const MAX_PDF_BYTES = 10 * 1024 * 1024;

export type MediaKind = 'image' | 'pdf';

export type InspectedUpload = {
  kind: MediaKind;
  contentType: string;
  extension: string;
};

const IMAGE_EXT: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
};

export function inspectUpload(file: {
  mimetype: string;
  size: number;
}): InspectedUpload | { error: string } {
  const mime = file.mimetype.toLowerCase();
  if (mime === 'image/svg+xml' || mime === 'image/svg') {
    return { error: 'SVG is not allowed' };
  }
  if (mime === 'application/pdf') {
    if (file.size > MAX_PDF_BYTES) return { error: 'PDF must be 10MB or smaller' };
    return { kind: 'pdf', contentType: 'application/pdf', extension: '.pdf' };
  }
  const extension = IMAGE_EXT[mime];
  if (extension) {
    if (file.size > MAX_IMAGE_BYTES) return { error: 'Image must be 2MB or smaller' };
    return {
      kind: 'image',
      contentType: mime === 'image/jpg' ? 'image/jpeg' : mime,
      extension,
    };
  }
  return { error: 'Only JPEG, PNG, WebP, GIF, or PDF files are allowed' };
}

export function newObjectKey(extension: string): string {
  return `${randomUUID()}${extension}`;
}

export function newAssetId(): string {
  return randomUUID();
}
