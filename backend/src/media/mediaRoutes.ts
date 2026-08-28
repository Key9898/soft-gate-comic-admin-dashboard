import type { Express, NextFunction, Request, Response } from 'express';
import express, { Router } from 'express';
import multer from 'multer';
import { canWriteCatalog } from '../auth/rbac.js';
import { createRequireStaff, type AuthedRequest } from '../auth/requireStaff.js';
import type { StaffStore } from '../auth/staffStore.js';
import { inspectUpload, MAX_PDF_BYTES, newAssetId, newObjectKey } from './inspectUpload.js';
import type { MediaAssetStore } from './mediaAssetStore.js';
import type { ObjectStore } from './objectStore.js';
import { publicMediaFile } from './serialize.js';

export type MediaServices = {
  assets: MediaAssetStore;
  objects: ObjectStore;
  uploadDir?: string;
};

type UploadedRequest = AuthedRequest & {
  file?: { buffer: Buffer; originalname: string; mimetype: string; size: number };
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_PDF_BYTES },
});

function requireCatalogWrite(req: AuthedRequest, res: Response, next: NextFunction) {
  if (!canWriteCatalog(req.staff?.role)) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }
  next();
}

function readCategory(value: unknown): string {
  if (typeof value !== 'string') return 'general';
  const trimmed = value.trim();
  return trimmed || 'general';
}

function isFileTooLarge(err: unknown): boolean {
  return Boolean(
    err &&
    typeof err === 'object' &&
    'code' in err &&
    (err as { code: unknown }).code === 'LIMIT_FILE_SIZE',
  );
}

function acceptUpload(req: Request, res: Response, next: NextFunction) {
  upload.single('file')(req, res, (err: unknown) => {
    if (isFileTooLarge(err)) {
      res.status(400).json({ error: 'File too large' });
      return;
    }
    if (err) {
      res.status(400).json({ error: 'Invalid upload' });
      return;
    }
    next();
  });
}

export function mountMediaRoutes(app: Express, store: StaffStore, media: MediaServices): void {
  const requireStaff = createRequireStaff(store);
  const router = Router();

  router.use(requireStaff);

  router.get('/', async (_req, res) => {
    const rows = await media.assets.list();
    res.json({ files: rows.map(publicMediaFile) });
  });

  router.post('/', requireCatalogWrite, acceptUpload, async (req: UploadedRequest, res) => {
    const file = req.file;
    if (!file) {
      res.status(400).json({ error: 'file is required' });
      return;
    }
    const inspected = inspectUpload(file);
    if ('error' in inspected) {
      res.status(400).json({ error: inspected.error });
      return;
    }

    const key = newObjectKey(inspected.extension);
    const put = await media.objects.put({
      key,
      body: file.buffer,
      contentType: inspected.contentType,
    });

    try {
      const row = await media.assets.create({
        id: newAssetId(),
        key,
        url: put.url,
        name: file.originalname || key,
        contentType: inspected.contentType,
        kind: inspected.kind,
        size: file.size,
        category: readCategory(req.body?.category),
      });
      res.status(201).json({ file: publicMediaFile(row) });
    } catch (err) {
      await media.objects.delete(key);
      throw err;
    }
  });

  router.delete('/:id', requireCatalogWrite, async (req, res) => {
    const existing = await media.assets.findById(String(req.params.id));
    if (!existing) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    await media.objects.delete(existing.key);
    await media.assets.delete(existing.id);
    res.json({ ok: true });
  });

  app.use('/api/media', router);

  if (media.uploadDir) {
    app.use('/uploads', express.static(media.uploadDir));
  }
}
