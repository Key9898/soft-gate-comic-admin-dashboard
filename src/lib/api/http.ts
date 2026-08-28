import type { AdminUser } from '@softgate/shared';

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export function isMockApi(): boolean {
  return import.meta.env.VITE_USE_MOCK_API !== 'false';
}

export function apiBaseUrl(): string {
  return import.meta.env.VITE_API_BASE_URL || '';
}

export function apiMessage(err: unknown, fallback: string): string {
  if (err instanceof Error && err.message.trim()) return err.message;
  return fallback;
}

export function usernameFromEmail(email: string): string {
  const local = email.split('@')[0]?.trim();
  return local || 'staff';
}

export function mapStaffUser(user: {
  id: string;
  email: string;
  displayName: string;
  role: AdminUser['role'];
  createdAt: string;
}): AdminUser {
  return {
    id: user.id,
    email: user.email,
    username: usernameFromEmail(user.email),
    displayName: user.displayName,
    role: user.role,
    createdAt: user.createdAt.split('T')[0],
  };
}

function readErrorMessage(body: unknown, fallback: string): string {
  if (body && typeof body === 'object' && 'error' in body) {
    const error = (body as { error: unknown }).error;
    if (typeof error === 'string' && error.trim()) return error;
  }
  return fallback;
}

async function parseApiResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  let body: unknown = null;
  if (text) {
    try {
      body = JSON.parse(text) as unknown;
    } catch {
      body = null;
    }
  }
  if (!response.ok) {
    throw new ApiError(
      response.status,
      readErrorMessage(body, response.statusText || 'Request failed'),
    );
  }
  return body as T;
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  const response = await fetch(`${apiBaseUrl()}${path}`, {
    ...init,
    credentials: 'include',
    headers,
  });
  return parseApiResponse<T>(response);
}

export async function apiUpload<T>(
  path: string,
  body: FormData,
  init: RequestInit = {},
): Promise<T> {
  const headers = new Headers(init.headers);
  headers.delete('Content-Type');
  const response = await fetch(`${apiBaseUrl()}${path}`, {
    ...init,
    method: init.method ?? 'POST',
    credentials: 'include',
    headers,
    body,
  });
  return parseApiResponse<T>(response);
}
