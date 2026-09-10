import { beforeEach, describe, expect, it, vi } from 'vitest';
import { isMockApi } from './api/http';
import { uploadMedia } from './api/media';
import { MAX_IMAGE_UPLOAD_BYTES } from './mediaUpload';
import {
  isDurableEpisodeImageUrl,
  isJpegPngFile,
  persistEpisodePageFile,
} from './episodePageUpload';

vi.mock('./api/http', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./api/http')>();
  return { ...actual, isMockApi: vi.fn(() => true) };
});

vi.mock('./api/media', () => ({
  uploadMedia: vi.fn(),
}));

const mockedIsMockApi = vi.mocked(isMockApi);
const mockedUploadMedia = vi.mocked(uploadMedia);

const jpegFile = (name = 'page.jpg', size = 12) =>
  new File([new Uint8Array(size)], name, { type: 'image/jpeg' });

describe('isJpegPngFile', () => {
  it('accepts JPEG and PNG MIME types', () => {
    expect(isJpegPngFile(new File(['x'], 'a.jpg', { type: 'image/jpeg' }))).toBe(true);
    expect(isJpegPngFile(new File(['x'], 'a.jpg', { type: 'image/jpg' }))).toBe(true);
    expect(isJpegPngFile(new File(['x'], 'a.png', { type: 'image/png' }))).toBe(true);
  });

  it('rejects GIF and WebP', () => {
    expect(isJpegPngFile(new File(['x'], 'a.gif', { type: 'image/gif' }))).toBe(false);
    expect(isJpegPngFile(new File(['x'], 'a.webp', { type: 'image/webp' }))).toBe(false);
  });

  it('uses the extension when MIME is empty', () => {
    expect(isJpegPngFile(new File(['x'], 'strip.PNG', { type: '' }))).toBe(true);
    expect(isJpegPngFile(new File(['x'], 'strip.gif', { type: '' }))).toBe(false);
  });
});

describe('isDurableEpisodeImageUrl', () => {
  it('rejects blob URLs only', () => {
    expect(isDurableEpisodeImageUrl('blob:http://localhost/abc')).toBe(false);
    expect(isDurableEpisodeImageUrl('https://cdn.example/admin/a.jpg')).toBe(true);
    expect(isDurableEpisodeImageUrl('http://localhost:3000/uploads/a.png')).toBe(true);
    expect(isDurableEpisodeImageUrl('data:image/png;base64,abc')).toBe(true);
  });
});

describe('persistEpisodePageFile', () => {
  beforeEach(() => {
    mockedIsMockApi.mockReset();
    mockedUploadMedia.mockReset();
    mockedIsMockApi.mockReturnValue(true);
  });

  it('persists mock JPEG as a data URL, not blob:', async () => {
    const media = await persistEpisodePageFile(jpegFile());
    expect(media.url.startsWith('data:')).toBe(true);
    expect(media.url.startsWith('blob:')).toBe(false);
    expect(media.category).toBe('episodes');
    expect(mockedUploadMedia).not.toHaveBeenCalled();
  });

  it('calls uploadMedia on the live path and refuses blob: results', async () => {
    mockedIsMockApi.mockReturnValue(false);
    mockedUploadMedia.mockResolvedValue({
      file: {
        id: 'media-1',
        name: 'page.jpg',
        type: 'image',
        url: 'https://cdn.example/admin/page.jpg',
        size: 12,
        uploadedAt: '2026-09-10',
        category: 'episodes',
      },
    });

    const media = await persistEpisodePageFile(jpegFile());
    expect(mockedUploadMedia).toHaveBeenCalledWith(expect.any(File), 'episodes');
    expect(media.url).toBe('https://cdn.example/admin/page.jpg');
  });

  it('rejects GIF before upload', async () => {
    mockedIsMockApi.mockReturnValue(false);
    await expect(
      persistEpisodePageFile(new File(['x'], 'x.gif', { type: 'image/gif' })),
    ).rejects.toThrow('Only JPEG or PNG files are allowed');
    expect(mockedUploadMedia).not.toHaveBeenCalled();
  });

  it('rejects files over 2MB', async () => {
    const big = new File([new Uint8Array(MAX_IMAGE_UPLOAD_BYTES + 1)], 'big.jpg', {
      type: 'image/jpeg',
    });
    await expect(persistEpisodePageFile(big)).rejects.toThrow('Image must be 2MB or smaller');
  });

  it('throws when live upload returns a blob: URL', async () => {
    mockedIsMockApi.mockReturnValue(false);
    mockedUploadMedia.mockResolvedValue({
      file: {
        id: 'bad',
        name: 'page.jpg',
        type: 'image',
        url: 'blob:http://localhost/nope',
        size: 12,
        uploadedAt: '2026-09-10',
        category: 'episodes',
      },
    });
    await expect(persistEpisodePageFile(jpegFile())).rejects.toThrow(
      'Upload did not return a durable URL',
    );
  });
});
