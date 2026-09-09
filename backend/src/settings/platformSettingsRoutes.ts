import type { Express, NextFunction, Response } from 'express';
import { Router } from 'express';
import { canWriteSettings } from '../auth/rbac.js';
import { createRequireStaff, type AuthedRequest } from '../auth/requireStaff.js';
import type { StaffStore } from '../auth/staffStore.js';
import {
  publicSettings,
  readPlatformLanguage,
  type PlatformSettingsRecord,
  type PlatformSettingsStore,
} from './platformSettingsStore.js';

function requireSettingsWrite(req: AuthedRequest, res: Response, next: NextFunction) {
  if (!canWriteSettings(req.staff?.role)) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }
  next();
}

function readBoolean(value: unknown): boolean | null {
  if (typeof value !== 'boolean') return null;
  return value;
}

function readWrite(
  body: unknown,
): { ok: true; settings: PlatformSettingsRecord } | { ok: false; error: string } {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { ok: false, error: 'Invalid body' };
  }
  const row = body as Record<string, unknown>;
  const maintenanceMode = readBoolean(row.maintenanceMode);
  const allowRegistration = readBoolean(row.allowRegistration);
  const contactEmail = typeof row.contactEmail === 'string' ? row.contactEmail : null;
  const defaultLanguage = readPlatformLanguage(row.defaultLanguage);
  if (maintenanceMode === null) {
    return { ok: false, error: 'maintenanceMode must be a boolean' };
  }
  if (allowRegistration === null) {
    return { ok: false, error: 'allowRegistration must be a boolean' };
  }
  if (contactEmail === null) {
    return { ok: false, error: 'contactEmail must be a string' };
  }
  if (!defaultLanguage) {
    return { ok: false, error: 'defaultLanguage must be en or mm' };
  }
  return {
    ok: true,
    settings: publicSettings({
      maintenanceMode,
      allowRegistration,
      contactEmail,
      defaultLanguage,
    }),
  };
}

export function mountPlatformSettingsRoutes(
  app: Express,
  staff: StaffStore,
  settings: PlatformSettingsStore,
) {
  const requireStaff = createRequireStaff(staff);
  const router = Router();
  router.use(requireStaff);

  router.get('/', async (_req, res) => {
    const current = await settings.get();
    res.json({ settings: publicSettings(current) });
  });

  router.patch('/', requireSettingsWrite, async (req: AuthedRequest, res) => {
    const parsed = readWrite(req.body);
    if (!parsed.ok) {
      res.status(400).json({ error: parsed.error });
      return;
    }
    const updated = await settings.upsert(parsed.settings);
    res.json({ settings: publicSettings(updated) });
  });

  app.use('/api/settings', router);
}
