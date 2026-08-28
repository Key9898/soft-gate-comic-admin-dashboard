import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from './app.js';

describe('GET /health', () => {
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
});
