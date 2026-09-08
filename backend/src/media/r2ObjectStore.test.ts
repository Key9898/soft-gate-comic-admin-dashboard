import { DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { describe, expect, it, vi } from 'vitest';
import { createR2ObjectStore } from './r2ObjectStore.js';

const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
);

const env = {
  R2_ACCOUNT_ID: 'acct123',
  R2_ACCESS_KEY_ID: 'akid',
  R2_SECRET_ACCESS_KEY: 'secret',
  R2_BUCKET: 'media',
  R2_PUBLIC_BASE_URL: 'https://pub.example',
};

describe('r2ObjectStore', () => {
  it('puts and deletes with the prefixed object key and ContentType', async () => {
    const send = vi.fn(async () => ({}));
    const store = createR2ObjectStore({ env, client: { send } });
    const key = '11111111-1111-1111-1111-111111111111.png';

    const put = await store.put({ key, body: PNG, contentType: 'image/png' });
    expect(put.url).toBe(`https://pub.example/admin/${key}`);
    expect(send).toHaveBeenCalledTimes(1);
    const putCmd = send.mock.calls[0][0] as PutObjectCommand;
    expect(putCmd).toBeInstanceOf(PutObjectCommand);
    expect(putCmd.input.Bucket).toBe('media');
    expect(putCmd.input.Key).toBe(`admin/${key}`);
    expect(putCmd.input.ContentType).toBe('image/png');
    expect(putCmd.input.Body).toEqual(PNG);

    await store.delete(key);
    expect(send).toHaveBeenCalledTimes(2);
    const deleteCmd = send.mock.calls[1][0] as DeleteObjectCommand;
    expect(deleteCmd).toBeInstanceOf(DeleteObjectCommand);
    expect(deleteCmd.input.Key).toBe(`admin/${key}`);
  });

  it('swallows missing-object deletes', async () => {
    const send = vi.fn(async () => {
      const err = new Error('missing');
      err.name = 'NoSuchKey';
      throw err;
    });
    const store = createR2ObjectStore({ env, client: { send } });
    await expect(store.delete('gone.png')).resolves.toBeUndefined();
  });

  it('rethrows unexpected delete errors', async () => {
    const send = vi.fn(async () => {
      throw new Error('boom');
    });
    const store = createR2ObjectStore({ env, client: { send } });
    await expect(store.delete('gone.png')).rejects.toThrow('boom');
  });
});
