import { describe, expect, it } from 'vitest';
import { isR2Configured, publicMediaUrl, r2Endpoint, r2ObjectKey } from './r2Config.js';

const r2Env = {
  R2_ACCOUNT_ID: 'acct123',
  R2_ACCESS_KEY_ID: 'akid',
  R2_SECRET_ACCESS_KEY: 'secret',
  R2_BUCKET: 'media',
  R2_PUBLIC_BASE_URL: 'https://pub.example/',
};

describe('r2Config', () => {
  it('treats missing, blank, and fake credentials as not configured', () => {
    expect(isR2Configured({})).toBe(false);
    expect(isR2Configured({ R2_ACCESS_KEY_ID: 'fake', R2_SECRET_ACCESS_KEY: 'fake' })).toBe(false);
    expect(
      isR2Configured({
        ...r2Env,
        R2_ACCESS_KEY_ID: 'FAKE',
      }),
    ).toBe(false);
    expect(
      isR2Configured({
        ...r2Env,
        R2_PUBLIC_BASE_URL: '',
      }),
    ).toBe(false);
  });

  it('is configured with account id or an explicit endpoint', () => {
    expect(isR2Configured(r2Env)).toBe(true);
    expect(
      isR2Configured({
        ...r2Env,
        R2_ACCOUNT_ID: '',
        R2_ENDPOINT: 'https://acct123.r2.cloudflarestorage.com',
      }),
    ).toBe(true);
  });

  it('builds disk and R2 public URLs from the key', () => {
    expect(publicMediaUrl('a.png', { MEDIA_PUBLIC_BASE_URL: 'http://localhost:3000/' })).toBe(
      'http://localhost:3000/uploads/a.png',
    );
    expect(publicMediaUrl('a.png', r2Env)).toBe('https://pub.example/admin/a.png');
    expect(publicMediaUrl('a.png', { ...r2Env, R2_KEY_PREFIX: '/covers/' })).toBe(
      'https://pub.example/covers/a.png',
    );
  });

  it('prefixes R2 object keys and defaults the endpoint from the account id', () => {
    expect(r2ObjectKey('a.png', r2Env)).toBe('admin/a.png');
    expect(r2Endpoint(r2Env)).toBe('https://acct123.r2.cloudflarestorage.com');
    expect(r2Endpoint({ R2_ENDPOINT: 'https://custom.example/' })).toBe('https://custom.example');
    expect(() => r2ObjectKey('../escape.png', r2Env)).toThrow('Invalid object key');
  });
});
