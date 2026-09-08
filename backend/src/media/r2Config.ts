export type EnvMap = Record<string, string | undefined>;

function read(env: EnvMap, key: string): string {
  return (env[key] ?? '').trim();
}

function isFake(value: string): boolean {
  return value.toLowerCase() === 'fake';
}

export function trimBaseUrl(url: string): string {
  return url.replace(/\/+$/, '');
}

export function isR2Configured(env: EnvMap = process.env): boolean {
  const accessKey = read(env, 'R2_ACCESS_KEY_ID');
  const secretKey = read(env, 'R2_SECRET_ACCESS_KEY');
  const bucket = read(env, 'R2_BUCKET');
  const publicBase = read(env, 'R2_PUBLIC_BASE_URL');
  const accountId = read(env, 'R2_ACCOUNT_ID');
  const endpoint = read(env, 'R2_ENDPOINT');
  if (!accessKey || isFake(accessKey)) return false;
  if (!secretKey || isFake(secretKey)) return false;
  if (!bucket || !publicBase) return false;
  return Boolean(accountId || endpoint);
}

export function r2KeyPrefix(env: EnvMap = process.env): string {
  const raw = read(env, 'R2_KEY_PREFIX') || 'admin';
  return raw.replace(/^\/+|\/+$/g, '') || 'admin';
}

export function assertAssetKey(key: string): void {
  if (!key || key.includes('..') || key.includes('/') || key.includes('\\') || key.includes('\0')) {
    throw new Error('Invalid object key');
  }
}

export function r2ObjectKey(key: string, env: EnvMap = process.env): string {
  assertAssetKey(key);
  return `${r2KeyPrefix(env)}/${key}`;
}

export function r2Endpoint(env: EnvMap = process.env): string {
  const explicit = read(env, 'R2_ENDPOINT');
  if (explicit) return trimBaseUrl(explicit);
  const accountId = read(env, 'R2_ACCOUNT_ID');
  return `https://${accountId}.r2.cloudflarestorage.com`;
}

export function r2Bucket(env: EnvMap = process.env): string {
  return read(env, 'R2_BUCKET');
}

export function r2Credentials(env: EnvMap = process.env): {
  accessKeyId: string;
  secretAccessKey: string;
} {
  return {
    accessKeyId: read(env, 'R2_ACCESS_KEY_ID'),
    secretAccessKey: read(env, 'R2_SECRET_ACCESS_KEY'),
  };
}

export function publicMediaUrl(key: string, env: EnvMap = process.env): string {
  if (isR2Configured(env)) {
    return `${trimBaseUrl(read(env, 'R2_PUBLIC_BASE_URL'))}/${r2ObjectKey(key, env)}`;
  }
  const base = trimBaseUrl(read(env, 'MEDIA_PUBLIC_BASE_URL') || 'http://localhost:3000');
  return `${base}/uploads/${key}`;
}
