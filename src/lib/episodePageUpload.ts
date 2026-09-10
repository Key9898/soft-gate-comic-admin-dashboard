import type { MediaFile } from '@softgate/shared';
import { isMockApi } from '@/lib/api/http';
import { uploadMedia } from '@/lib/api/media';
import { MAX_IMAGE_UPLOAD_BYTES, MediaUploadError, readImageAsMediaFile } from '@/lib/mediaUpload';

const JPEG_PNG_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png']);

export const isJpegPngFile = (file: File): boolean => {
  const type = file.type.toLowerCase();
  if (JPEG_PNG_TYPES.has(type)) return true;
  if (type) return false;
  return /\.(jpe?g|png)$/i.test(file.name);
};

export const isDurableEpisodeImageUrl = (url: string): boolean => !url.startsWith('blob:');

export async function persistEpisodePageFile(file: File): Promise<MediaFile> {
  if (!isJpegPngFile(file)) {
    throw new MediaUploadError('Only JPEG or PNG files are allowed');
  }
  if (file.size > MAX_IMAGE_UPLOAD_BYTES) {
    throw new MediaUploadError('Image must be 2MB or smaller');
  }

  const media = isMockApi()
    ? await readImageAsMediaFile(file, 'episodes')
    : (await uploadMedia(file, 'episodes')).file;

  if (!isDurableEpisodeImageUrl(media.url)) {
    throw new MediaUploadError('Upload did not return a durable URL');
  }

  return media;
}
