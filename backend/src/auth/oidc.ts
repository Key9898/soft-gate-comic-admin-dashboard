import { createHash, randomBytes } from 'node:crypto';
import type { EnvMap } from './corsOrigins.js';
import { adminAppUrl } from '../mail/mailer.js';

function read(env: EnvMap, key: string): string {
  return (env[key] ?? '').trim();
}

function isFake(value: string): boolean {
  return value.toLowerCase() === 'fake';
}

export function isOidcConfigured(env: EnvMap = process.env): boolean {
  const issuer = read(env, 'OIDC_ISSUER');
  const clientId = read(env, 'OIDC_CLIENT_ID');
  const clientSecret = read(env, 'OIDC_CLIENT_SECRET');
  if (!issuer || !clientId || !clientSecret) return false;
  if (isFake(issuer) || isFake(clientId) || isFake(clientSecret)) return false;
  return true;
}

export function oidcRedirectUri(env: EnvMap = process.env): string {
  return `${adminAppUrl(env)}/api/staff/oidc/callback`;
}

export function createPkceVerifier(): string {
  return randomBytes(32).toString('base64url');
}

export function pkceChallenge(verifier: string): string {
  return createHash('sha256').update(verifier).digest('base64url');
}

export function createOidcState(): string {
  return randomBytes(24).toString('hex');
}

type OidcDiscovery = {
  authorization_endpoint: string;
  token_endpoint: string;
};

export async function fetchOidcDiscovery(env: EnvMap = process.env): Promise<OidcDiscovery> {
  const issuer = read(env, 'OIDC_ISSUER').replace(/\/+$/, '');
  const response = await fetch(`${issuer}/.well-known/openid-configuration`);
  if (!response.ok) {
    throw new Error('OIDC discovery failed');
  }
  const body = (await response.json()) as Partial<OidcDiscovery>;
  if (!body.authorization_endpoint || !body.token_endpoint) {
    throw new Error('OIDC discovery incomplete');
  }
  return {
    authorization_endpoint: body.authorization_endpoint,
    token_endpoint: body.token_endpoint,
  };
}

export function buildAuthorizeUrl(input: {
  authorizationEndpoint: string;
  clientId: string;
  redirectUri: string;
  state: string;
  nonce: string;
  challenge: string;
}): string {
  const url = new URL(input.authorizationEndpoint);
  url.searchParams.set('client_id', input.clientId);
  url.searchParams.set('redirect_uri', input.redirectUri);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', 'openid email profile');
  url.searchParams.set('state', input.state);
  url.searchParams.set('nonce', input.nonce);
  url.searchParams.set('code_challenge', input.challenge);
  url.searchParams.set('code_challenge_method', 'S256');
  return url.toString();
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const parts = token.split('.');
  if (parts.length < 2) return null;
  try {
    const json = Buffer.from(parts[1], 'base64url').toString('utf8');
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export async function exchangeOidcCode(
  input: {
    code: string;
    redirectUri: string;
    verifier: string;
    nonce: string;
  },
  env: EnvMap = process.env,
): Promise<{ email: string } | null> {
  const discovery = await fetchOidcDiscovery(env);
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code: input.code,
    redirect_uri: input.redirectUri,
    client_id: read(env, 'OIDC_CLIENT_ID'),
    client_secret: read(env, 'OIDC_CLIENT_SECRET'),
    code_verifier: input.verifier,
  });
  const response = await fetch(discovery.token_endpoint, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body,
  });
  if (!response.ok) return null;
  const tokenBody = (await response.json()) as { id_token?: string };
  if (!tokenBody.id_token) return null;
  const payload = decodeJwtPayload(tokenBody.id_token);
  if (!payload) return null;
  if (typeof payload.nonce === 'string' && payload.nonce !== input.nonce) return null;
  const email = typeof payload.email === 'string' ? payload.email.trim().toLowerCase() : '';
  if (!email || !email.includes('@')) return null;
  if (payload.email_verified === false) return null;
  return { email };
}
