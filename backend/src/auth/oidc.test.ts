import { afterEach, describe, expect, it, vi } from 'vitest';
import { exchangeOidcCode, isOidcConfigured, oidcRedirectUri } from './oidc.js';

describe('oidc config', () => {
  it('treats missing and fake values as unset', () => {
    expect(isOidcConfigured({})).toBe(false);
    expect(
      isOidcConfigured({
        OIDC_ISSUER: 'fake',
        OIDC_CLIENT_ID: 'id',
        OIDC_CLIENT_SECRET: 'secret',
      }),
    ).toBe(false);
    expect(
      isOidcConfigured({
        OIDC_ISSUER: 'https://idp.example.com',
        OIDC_CLIENT_ID: 'id',
        OIDC_CLIENT_SECRET: 'secret',
      }),
    ).toBe(true);
  });

  it('builds the callback on the Admin origin', () => {
    expect(oidcRedirectUri({ ADMIN_APP_URL: 'https://admin.example.com/' })).toBe(
      'https://admin.example.com/api/staff/oidc/callback',
    );
  });
});

describe('exchangeOidcCode', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('reads a verified email from the id_token payload', async () => {
    const payload = Buffer.from(
      JSON.stringify({ email: 'Owner@Softgate.com', email_verified: true, nonce: 'n1' }),
    ).toString('base64url');
    const idToken = `hdr.${payload}.sig`;
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => {
        if (String(url).includes('openid-configuration')) {
          return new Response(
            JSON.stringify({
              authorization_endpoint: 'https://idp.example.com/auth',
              token_endpoint: 'https://idp.example.com/token',
            }),
          );
        }
        return new Response(JSON.stringify({ id_token: idToken }));
      }),
    );
    const identity = await exchangeOidcCode(
      { code: 'c', redirectUri: 'https://admin.example.com/cb', verifier: 'v', nonce: 'n1' },
      {
        OIDC_ISSUER: 'https://idp.example.com',
        OIDC_CLIENT_ID: 'id',
        OIDC_CLIENT_SECRET: 'secret',
      },
    );
    expect(identity).toEqual({ email: 'owner@softgate.com' });
  });
});
