export type BroadcastAudience = { all: true } | { userIds: string[] };

export type ReaderHit = {
  id: string;
  email: string;
  displayName: string;
};

export type BroadcastPreview = {
  readers: number;
  withEmail: number;
  withPush: number;
};

export type BroadcastSendInput = {
  campaignId: string;
  type: 'system' | 'promotion';
  title: { en: string; mm: string };
  message: { en: string; mm: string };
  href?: string;
  audience: BroadcastAudience;
};

export type BroadcastSendResult = {
  campaignId: string;
  inbox: number;
  emailed: number;
  pushed: number;
  skippedPref: number;
};

export type WebsiteBroadcastClient = {
  configured: boolean;
  searchReaders: (q: string) => Promise<ReaderHit[]>;
  preview: (audience: BroadcastAudience) => Promise<BroadcastPreview>;
  send: (input: BroadcastSendInput) => Promise<BroadcastSendResult>;
};

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

export function isWebsiteBroadcastConfigured(env: EnvMap = process.env): boolean {
  const base = read(env, 'WEBSITE_API_BASE_URL');
  const token = read(env, 'WEBSITE_SERVICE_TOKEN');
  if (!base) return false;
  if (!token || isFake(token)) return false;
  return true;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function readError(body: unknown, fallback: string): string {
  const row = asRecord(body);
  if (!row) return fallback;
  const error = row.error;
  if (typeof error === 'string' && error.trim()) return error;
  const nested = asRecord(error);
  if (nested && typeof nested.message === 'string' && nested.message.trim()) {
    return nested.message;
  }
  if (nested && typeof nested.code === 'string' && nested.code.trim()) return nested.code;
  return fallback;
}

function readHits(value: unknown): ReaderHit[] {
  if (!Array.isArray(value)) return [];
  const hits: ReaderHit[] = [];
  for (const item of value) {
    const row = asRecord(item);
    if (!row) continue;
    const id = typeof row.id === 'string' ? row.id.trim() : '';
    const email = typeof row.email === 'string' ? row.email.trim() : '';
    const displayName = typeof row.displayName === 'string' ? row.displayName.trim() : '';
    if (!id) continue;
    hits.push({ id, email, displayName });
  }
  return hits;
}

function readCount(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : 0;
}

async function websiteJson(
  url: string,
  token: string,
  init: RequestInit,
): Promise<{ status: number; body: unknown }> {
  const headers = new Headers(init.headers);
  headers.set('Authorization', `Bearer ${token}`);
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  const response = await fetch(url, { ...init, headers });
  const text = await response.text();
  let body: unknown = null;
  if (text) {
    try {
      body = JSON.parse(text) as unknown;
    } catch {
      body = null;
    }
  }
  return { status: response.status, body };
}

export function unconfiguredWebsiteClient(): WebsiteBroadcastClient {
  return {
    configured: false,
    async searchReaders() {
      throw new Error('Reader broadcast is not configured');
    },
    async preview() {
      throw new Error('Reader broadcast is not configured');
    },
    async send() {
      throw new Error('Reader broadcast is not configured');
    },
  };
}

export function createWebsiteBroadcastClientFromEnv(
  env: EnvMap = process.env,
): WebsiteBroadcastClient {
  if (!isWebsiteBroadcastConfigured(env)) return unconfiguredWebsiteClient();
  const base = trimBaseUrl(read(env, 'WEBSITE_API_BASE_URL'));
  const token = read(env, 'WEBSITE_SERVICE_TOKEN');

  return {
    configured: true,
    async searchReaders(q: string) {
      const query = new URLSearchParams();
      if (q.trim()) query.set('q', q.trim());
      const suffix = query.toString() ? `?${query.toString()}` : '';
      const { status, body } = await websiteJson(`${base}/api/internal/readers${suffix}`, token, {
        method: 'GET',
      });
      if (status < 200 || status >= 300) {
        throw new Error(readError(body, 'Could not search readers'));
      }
      const row = asRecord(body);
      const data = asRecord(row?.data);
      return readHits(data?.readers ?? row?.readers);
    },
    async preview(audience) {
      const { status, body } = await websiteJson(`${base}/api/internal/broadcasts/preview`, token, {
        method: 'POST',
        body: JSON.stringify({ audience }),
      });
      if (status < 200 || status >= 300) {
        throw new Error(readError(body, 'Could not preview audience'));
      }
      const row = asRecord(body);
      const data = asRecord(row?.data) ?? row;
      return {
        readers: readCount(data?.readers),
        withEmail: readCount(data?.withEmail),
        withPush: readCount(data?.withPush),
      };
    },
    async send(input) {
      const { status, body } = await websiteJson(`${base}/api/internal/broadcasts`, token, {
        method: 'POST',
        body: JSON.stringify(input),
      });
      if (status < 200 || status >= 300) {
        throw new Error(readError(body, 'Could not send broadcast'));
      }
      const row = asRecord(body);
      const data = asRecord(row?.data) ?? row;
      return {
        campaignId: typeof data?.campaignId === 'string' ? data.campaignId : input.campaignId,
        inbox: readCount(data?.inbox),
        emailed: readCount(data?.emailed),
        pushed: readCount(data?.pushed),
        skippedPref: readCount(data?.skippedPref),
      };
    },
  };
}
