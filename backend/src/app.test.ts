import request from 'supertest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createApp } from './app.js';

describe('GET /health', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns ok, an ISO timestamp, and db down without DATABASE_URL', async () => {
    const res = await request(createApp()).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(typeof res.body.timestamp).toBe('string');
    expect(Number.isNaN(Date.parse(res.body.timestamp))).toBe(false);
    expect(res.body.db).toBe('down');
  });

  it('does not expose a blob PUT /api/data contract', async () => {
    const res = await request(createApp()).put('/api/data').send({ data: true });
    expect(res.status).toBe(404);
  });

  it('echoes an allowed Origin and credentials', async () => {
    const res = await request(createApp()).get('/health').set('Origin', 'http://localhost:5173');
    expect(res.status).toBe(200);
    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:5173');
    expect(res.headers['access-control-allow-credentials']).toBe('true');
  });

  it('keeps 200 without ACAO for a disallowed Origin', async () => {
    vi.stubEnv('CORS_ORIGINS', 'http://localhost:5173');
    const res = await request(createApp()).get('/health').set('Origin', 'https://evil.example');
    expect(res.status).toBe(200);
    expect(res.headers['access-control-allow-origin']).toBeUndefined();
  });
});
