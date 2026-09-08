import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import {
  publicMediaUrl,
  r2Bucket,
  r2Credentials,
  r2Endpoint,
  r2ObjectKey,
  type EnvMap,
} from './r2Config.js';
import type { ObjectStore } from './objectStore.js';

export type R2ObjectStoreOptions = {
  env?: EnvMap;
  client?: Pick<S3Client, 'send'>;
};

function isMissingObject(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;
  const named = err as { name?: string; $metadata?: { httpStatusCode?: number } };
  if (named.name === 'NoSuchKey' || named.name === 'NotFound') return true;
  return named.$metadata?.httpStatusCode === 404;
}

export function createR2ObjectStore(options: R2ObjectStoreOptions = {}): ObjectStore {
  const env = options.env ?? process.env;
  const bucket = r2Bucket(env);
  const credentials = r2Credentials(env);
  const client =
    options.client ??
    new S3Client({
      region: 'auto',
      endpoint: r2Endpoint(env),
      credentials,
      requestChecksumCalculation: 'WHEN_REQUIRED',
      responseChecksumValidation: 'WHEN_REQUIRED',
    });

  return {
    async put({ key, body, contentType }) {
      await client.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: r2ObjectKey(key, env),
          Body: body,
          ContentType: contentType,
        }),
      );
      return { url: publicMediaUrl(key, env) };
    },
    async delete(key) {
      try {
        await client.send(
          new DeleteObjectCommand({
            Bucket: bucket,
            Key: r2ObjectKey(key, env),
          }),
        );
      } catch (err) {
        if (!isMissingObject(err)) throw err;
      }
    },
  };
}
