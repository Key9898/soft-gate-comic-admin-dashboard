import { afterEach, describe, it, expect, beforeEach, vi } from 'vitest';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider } from '@/features/auth/useAuth';
import { DataProvider } from '@/lib/DataContext';
import { hashPassword, upsertAccount, writeCredential } from '@/lib/auth';
import { uploadMedia } from '@/lib/api/media';
import { persistEpisodePageFile } from '@/lib/episodePageUpload';
import EpisodeEditorPage from './EpisodeEditorPage';

vi.mock('@/lib/api/media', () => ({
  uploadMedia: vi.fn(),
}));

vi.mock('@/lib/episodePageUpload', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/episodePageUpload')>();
  return {
    ...actual,
    persistEpisodePageFile: vi.fn(),
  };
});

const mockedUploadMedia = vi.mocked(uploadMedia);
const mockedPersist = vi.mocked(persistEpisodePageFile);

const PathProbe = () => {
  const location = useLocation();
  return <div data-testid="path">{`${location.pathname}${location.search}`}</div>;
};

const seed = (role: 'super_admin' | 'admin' | 'member' | 'viewer') => {
  const passwordHash = hashPassword('password1');
  const account = {
    id: '1',
    email: 'staff@test.com',
    username: 'staff',
    displayName: 'Staff',
    role,
    createdAt: '2026-08-23',
    passwordHash,
  };
  upsertAccount(account);
  writeCredential(account.email, passwordHash);
  localStorage.setItem('softgate_admin_user', JSON.stringify(account));
};

const wrap = (path: string) =>
  render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[path]}>
        <AuthProvider>
          <DataProvider>
            <Routes>
              <Route path="/episodes/new" element={<EpisodeEditorPage />} />
              <Route path="/episodes/:episodeId/edit" element={<EpisodeEditorPage />} />
              <Route path="/episodes" element={<PathProbe />} />
            </Routes>
          </DataProvider>
        </AuthProvider>
      </MemoryRouter>
    </HelmetProvider>,
  );

describe('EpisodeEditorPage', () => {
  beforeEach(() => {
    localStorage.clear();
    mockedUploadMedia.mockReset();
    mockedPersist.mockReset();
    class FakeImage {
      naturalWidth = 320;
      naturalHeight = 480;
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      decode = () => Promise.resolve();
      set src(_value: string) {
        queueMicrotask(() => this.onload?.());
      }
    }
    vi.stubGlobal('Image', FakeImage);
    let n = 0;
    mockedPersist.mockImplementation(async (file) => {
      const result = await mockedUploadMedia(file, 'episodes');
      return result.file;
    });
    mockedUploadMedia.mockImplementation(async (file) => {
      n += 1;
      return {
        file: {
          id: `media-${file.name}-${n}`,
          name: file.name,
          type: 'image' as const,
          url: `https://cdn.example/admin/${file.name}`,
          size: file.size,
          uploadedAt: '2026-09-10',
          category: 'episodes',
        },
      };
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('uploads JPEG/PNG through uploadMedia and never stores blob: URLs', async () => {
    const user = userEvent.setup({ delay: null });
    seed('admin');
    wrap('/episodes/new');

    expect(await screen.findByRole('heading', { name: 'Add Episode' })).toBeInTheDocument();
    expect(screen.queryByText(/pdf file/i)).not.toBeInTheDocument();

    const input = screen.getByLabelText('Upload episode images');
    await user.upload(input, [
      new File([new Uint8Array(8)], 'one.jpg', { type: 'image/jpeg' }),
      new File([new Uint8Array(8)], 'two.png', { type: 'image/png' }),
    ]);

    await waitFor(() => {
      expect(mockedUploadMedia).toHaveBeenCalledTimes(2);
    });
    expect(screen.getByAltText('Page 1')).toHaveAttribute(
      'src',
      'https://cdn.example/admin/one.jpg',
    );
    expect(screen.getByAltText('Page 2')).toHaveAttribute(
      'src',
      'https://cdn.example/admin/two.png',
    );
    expect(screen.getByAltText('Page 1').getAttribute('src')?.startsWith('blob:')).toBe(false);
  });

  it('reindexes after reorder and remove', async () => {
    const user = userEvent.setup({ delay: null });
    seed('admin');
    wrap('/episodes/new');

    expect(await screen.findByLabelText('Upload episode images')).toBeInTheDocument();
    await user.upload(screen.getByLabelText('Upload episode images'), [
      new File([new Uint8Array(8)], 'one.jpg', { type: 'image/jpeg' }),
      new File([new Uint8Array(8)], 'two.png', { type: 'image/png' }),
    ]);

    await waitFor(() => {
      expect(screen.getByAltText('Page 2')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Move page 2 up' }));
    expect(screen.getByAltText('Page 1')).toHaveAttribute(
      'src',
      'https://cdn.example/admin/two.png',
    );
    expect(screen.getByAltText('Page 2')).toHaveAttribute(
      'src',
      'https://cdn.example/admin/one.jpg',
    );

    await user.click(screen.getByRole('button', { name: 'Remove page 1' }));
    expect(screen.getByAltText('Page 1')).toHaveAttribute(
      'src',
      'https://cdn.example/admin/one.jpg',
    );
    expect(screen.queryByAltText('Page 2')).not.toBeInTheDocument();
  });

  it('redirects a viewer away from the editor', async () => {
    seed('viewer');
    wrap('/episodes/new');
    await waitFor(() => {
      expect(screen.getByTestId('path')).toHaveTextContent('/episodes');
    });
  });
});
