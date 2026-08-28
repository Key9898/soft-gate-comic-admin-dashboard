import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError, apiMessage, apiRequest, isMockApi, mapStaffUser } from './http';
import { loadCatalog } from './catalog';
import { uploadMedia } from './media';
import { loginStaff } from './staff';

describe('api http', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('treats missing VITE_USE_MOCK_API as mock', () => {
    expect(isMockApi()).toBe(true);
  });

  it('maps staff username from the email local-part', () => {
    expect(
      mapStaffUser({
        id: 'u1',
        email: 'owner@softgatecomic.com',
        displayName: 'Owner',
        role: 'super_admin',
        createdAt: '2026-08-24T12:00:00.000Z',
      }),
    ).toMatchObject({
      username: 'owner',
      createdAt: '2026-08-24',
    });
  });

  it('sends credentials and JSON headers', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    await apiRequest<{ ok: boolean }>('/api/staff/me');

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('/api/staff/me');
    expect(init.credentials).toBe('include');
    expect(new Headers(init.headers).get('Content-Type')).toBe('application/json');
  });

  it('throws ApiError from { error } on non-OK', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          new Response(JSON.stringify({ error: 'Webtoon has episodes' }), { status: 409 }),
        ),
    );

    await expect(apiRequest('/api/webtoons/1', { method: 'DELETE' })).rejects.toMatchObject({
      name: 'ApiError',
      status: 409,
      message: 'Webtoon has episodes',
    });
  });

  it('does not call the blob catalog contract', async () => {
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      expect(String(url)).not.toContain('/api/data');
      expect(String(url)).not.toContain('/api/settings');
      const body =
        url.includes('/authors') || url.includes('/genres') || url.includes('/webtoons')
          ? { authors: [], genres: [], webtoons: [] }
          : { episodes: [] };
      return Promise.resolve(
        new Response(JSON.stringify(body), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    });
    vi.stubGlobal('fetch', fetchMock);

    await loadCatalog();
    const paths = fetchMock.mock.calls.map((call) => String(call[0]));
    expect(paths).toEqual(
      expect.arrayContaining(['/api/authors', '/api/genres', '/api/webtoons', '/api/episodes']),
    );
    expect(paths.some((path) => path.includes('/api/data'))).toBe(false);
  });

  it('logs in with credentials include', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          user: {
            id: '1',
            email: 'admin@test.com',
            displayName: 'Admin',
            role: 'super_admin',
            createdAt: '2026-08-24T00:00:00.000Z',
          },
        }),
        { status: 200 },
      ),
    );
    vi.stubGlobal('fetch', fetchMock);

    await loginStaff('admin@test.com', 'password1');
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    expect(fetchMock.mock.calls[0][0]).toBe('/api/staff/login');
    expect(init.credentials).toBe('include');
    expect(init.method).toBe('POST');
  });

  it('prefers ApiError message in apiMessage', () => {
    expect(apiMessage(new ApiError(403, 'Forbidden'), 'fallback')).toBe('Forbidden');
  });

  it('uploads FormData without a JSON content-type', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          file: {
            id: 'm1',
            name: 'dot.png',
            type: 'image',
            url: 'http://localhost:3000/uploads/dot.png',
            size: 8,
            uploadedAt: '2026-08-24T00:00:00.000Z',
            category: 'covers',
          },
        }),
        { status: 201, headers: { 'Content-Type': 'application/json' } },
      ),
    );
    vi.stubGlobal('fetch', fetchMock);

    const file = new File([new Uint8Array([1, 2, 3])], 'dot.png', { type: 'image/png' });
    const result = await uploadMedia(file, 'covers');

    expect(result.file.name).toBe('dot.png');
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('/api/media');
    expect(init.method).toBe('POST');
    expect(init.credentials).toBe('include');
    expect(init.body).toBeInstanceOf(FormData);
    expect(new Headers(init.headers).get('Content-Type')).toBeNull();
  });
});
