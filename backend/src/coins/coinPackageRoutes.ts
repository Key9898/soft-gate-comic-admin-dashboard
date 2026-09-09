import type { Express, NextFunction, Response } from 'express';
import { Router } from 'express';
import { canWriteBusiness } from '../auth/rbac.js';
import { createRequireStaff, type AuthedRequest } from '../auth/requireStaff.js';
import type { StaffStore } from '../auth/staffStore.js';
import { hasOwn } from '../catalog/parse.js';
import {
  persistedPack,
  type CoinPackagePatch,
  type CoinPackageStore,
  type CoinPackageWrite,
} from './coinPackageStore.js';

function requireBusinessWrite(req: AuthedRequest, res: Response, next: NextFunction) {
  if (!canWriteBusiness(req.staff?.role)) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }
  next();
}

function readPositiveInt(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 1) return null;
  return value;
}

function readBonus(value: unknown): number | null {
  if (value === undefined || value === null) return 0;
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 0) return null;
  return value;
}

function readOptionalBool(value: unknown): boolean | null {
  if (value === undefined) return false;
  if (typeof value !== 'boolean') return null;
  return value;
}

function publicPack(pack: ReturnType<typeof persistedPack>) {
  return persistedPack(pack);
}

function parseWrite(
  body: unknown,
  partial: boolean,
): { ok: true; patch: CoinPackagePatch } | { ok: false; error: string } {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { ok: false, error: 'Invalid body' };
  }
  const row = body as Record<string, unknown>;
  const patch: CoinPackagePatch = {};

  if (!partial || hasOwn(row, 'coins')) {
    const coins = readPositiveInt(row.coins);
    if (coins == null) return { ok: false, error: 'coins must be an integer of at least 1' };
    patch.coins = coins;
  }
  if (!partial || hasOwn(row, 'price')) {
    const price = readPositiveInt(row.price);
    if (price == null) return { ok: false, error: 'price must be an integer of at least 1' };
    patch.price = price;
  }
  if (!partial || hasOwn(row, 'bonus')) {
    const bonus = readBonus(row.bonus);
    if (bonus == null) return { ok: false, error: 'bonus must be an integer of 0 or more' };
    patch.bonus = bonus;
  }
  if (!partial || hasOwn(row, 'popular')) {
    const popular = readOptionalBool(row.popular);
    if (popular == null) return { ok: false, error: 'popular must be a boolean' };
    patch.popular = popular;
  }
  if (!partial || hasOwn(row, 'bestValue')) {
    const bestValue = readOptionalBool(row.bestValue);
    if (bestValue == null) return { ok: false, error: 'bestValue must be a boolean' };
    patch.bestValue = bestValue;
  }
  if (patch.popular && patch.bestValue) {
    return { ok: false, error: 'popular and bestValue cannot both be true' };
  }
  return { ok: true, patch };
}

export function mountCoinPackageRoutes(app: Express, staff: StaffStore, packs: CoinPackageStore) {
  const requireStaff = createRequireStaff(staff);
  const router = Router();
  router.use(requireStaff);

  router.get('/', async (_req, res) => {
    const list = await packs.list();
    res.json({ coinPackages: list.map(publicPack) });
  });

  router.post('/', requireBusinessWrite, async (req: AuthedRequest, res) => {
    const parsed = parseWrite(req.body, false);
    if (!parsed.ok) {
      res.status(400).json({ error: parsed.error });
      return;
    }
    const created = await packs.create(parsed.patch as CoinPackageWrite);
    res.status(201).json({ coinPackage: publicPack(created) });
  });

  router.patch('/:id', requireBusinessWrite, async (req: AuthedRequest, res) => {
    const parsed = parseWrite(req.body, true);
    if (!parsed.ok) {
      res.status(400).json({ error: parsed.error });
      return;
    }
    if (parsed.patch.popular && parsed.patch.bestValue) {
      res.status(400).json({ error: 'popular and bestValue cannot both be true' });
      return;
    }
    const current = await packs.findById(String(req.params.id));
    if (!current) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    const merged = { ...current, ...parsed.patch };
    if (merged.popular && merged.bestValue) {
      res.status(400).json({ error: 'popular and bestValue cannot both be true' });
      return;
    }
    const updated = await packs.update(String(req.params.id), parsed.patch);
    if (!updated) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    res.json({ coinPackage: publicPack(updated) });
  });

  router.delete('/:id', requireBusinessWrite, async (req: AuthedRequest, res) => {
    const ok = await packs.delete(String(req.params.id));
    if (!ok) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    res.json({ ok: true });
  });

  app.use('/api/coin-packages', router);
}
