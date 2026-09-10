import type { Express, NextFunction, Response } from 'express';
import { Router } from 'express';
import { canWriteSettings } from '../auth/rbac.js';
import { createRequireStaff, type AuthedRequest } from '../auth/requireStaff.js';
import type { StaffStore } from '../auth/staffStore.js';
import { hasOwn, readBilingual } from '../catalog/parse.js';
import { isMissingTableError } from '../prismaMissingTable.js';
import {
  DEFAULT_FAQ_ITEMS,
  FAQ_CATEGORIES,
  FAQ_RELATED_PATHS,
  isFaqCategory,
  isFaqRelatedPath,
  persistedFaqItem,
  type BilingualText,
  type FaqCategory,
  type FaqItemPatch,
  type FaqItemWrite,
  type FaqRelatedPath,
  type FaqStore,
} from './faqStore.js';

function requireSettingsWrite(req: AuthedRequest, res: Response, next: NextFunction) {
  if (!canWriteSettings(req.staff?.role)) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }
  next();
}

function readRequiredBilingual(
  value: unknown,
  label: string,
): { ok: true; value: BilingualText } | { ok: false; error: string } {
  const text = readBilingual(value, true);
  if (!text) return { ok: false, error: `${label} must include en and mm` };
  const en = text.en.trim();
  const mm = text.mm.trim();
  if (!en || !mm) return { ok: false, error: `${label} must include en and mm` };
  return { ok: true, value: { en, mm } };
}

function parseItemWrite(
  body: unknown,
  partial: boolean,
): { ok: true; patch: FaqItemPatch } | { ok: false; error: string } {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { ok: false, error: 'Invalid body' };
  }
  const input = body as Record<string, unknown>;
  const patch: FaqItemPatch = {};

  if (!partial || hasOwn(input, 'category')) {
    if (typeof input.category !== 'string' || !isFaqCategory(input.category)) {
      return {
        ok: false,
        error: `category must be one of ${FAQ_CATEGORIES.join(', ')}`,
      };
    }
    patch.category = input.category;
  }

  if (!partial || hasOwn(input, 'question')) {
    const question = readRequiredBilingual(input.question, 'question');
    if (!question.ok) return question;
    patch.question = question.value;
  }

  if (!partial || hasOwn(input, 'answer')) {
    const answer = readRequiredBilingual(input.answer, 'answer');
    if (!answer.ok) return answer;
    patch.answer = answer.value;
  }

  if (!partial || hasOwn(input, 'relatedTo') || hasOwn(input, 'relatedLabel')) {
    const relatedToRaw = input.relatedTo;
    if (relatedToRaw === undefined || relatedToRaw === null || relatedToRaw === '') {
      patch.relatedTo = undefined;
      patch.relatedLabel = undefined;
    } else if (typeof relatedToRaw !== 'string' || !isFaqRelatedPath(relatedToRaw)) {
      return {
        ok: false,
        error: `relatedTo must be one of ${FAQ_RELATED_PATHS.join(', ')}`,
      };
    } else {
      const label = readRequiredBilingual(input.relatedLabel, 'relatedLabel');
      if (!label.ok) return label;
      patch.relatedTo = relatedToRaw;
      patch.relatedLabel = label.value;
    }
  }

  if (!partial || hasOwn(input, 'sortOrder')) {
    if (
      typeof input.sortOrder !== 'number' ||
      !Number.isInteger(input.sortOrder) ||
      input.sortOrder < 0
    ) {
      return { ok: false, error: 'sortOrder must be a non-negative integer' };
    }
    patch.sortOrder = input.sortOrder;
  }

  if (!partial || hasOwn(input, 'published')) {
    if (typeof input.published !== 'boolean') {
      return { ok: false, error: 'published must be a boolean' };
    }
    patch.published = input.published;
  }

  return { ok: true, patch };
}

function asItemWrite(patch: FaqItemPatch): FaqItemWrite | null {
  if (
    !patch.category ||
    !patch.question ||
    !patch.answer ||
    patch.sortOrder == null ||
    patch.published == null
  ) {
    return null;
  }
  const body: FaqItemWrite = {
    category: patch.category as FaqCategory,
    question: patch.question,
    answer: patch.answer,
    sortOrder: patch.sortOrder,
    published: patch.published,
  };
  if (patch.relatedTo) {
    body.relatedTo = patch.relatedTo as FaqRelatedPath;
    body.relatedLabel = patch.relatedLabel;
  }
  return body;
}

export function mountFaqRoutes(app: Express, staff: StaffStore, faq: FaqStore) {
  const requireStaff = createRequireStaff(staff);
  const router = Router();
  router.use(requireStaff);

  router.get('/', async (_req, res) => {
    try {
      const items = await faq.listItems();
      res.json({ items: items.map(persistedFaqItem) });
    } catch (err) {
      if (isMissingTableError(err)) {
        res.json({ items: DEFAULT_FAQ_ITEMS.map(persistedFaqItem) });
        return;
      }
      throw err;
    }
  });

  router.post('/', requireSettingsWrite, async (req: AuthedRequest, res) => {
    const parsed = parseItemWrite(req.body, false);
    if (!parsed.ok) {
      res.status(400).json({ error: parsed.error });
      return;
    }
    const body = asItemWrite(parsed.patch);
    if (!body) {
      res.status(400).json({ error: 'Invalid body' });
      return;
    }
    const created = await faq.createItem(body);
    res.status(201).json({ item: persistedFaqItem(created) });
  });

  router.patch('/:id', requireSettingsWrite, async (req: AuthedRequest, res) => {
    const parsed = parseItemWrite(req.body, true);
    if (!parsed.ok) {
      res.status(400).json({ error: parsed.error });
      return;
    }
    const updated = await faq.updateItem(String(req.params.id), parsed.patch);
    if (!updated) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    res.json({ item: persistedFaqItem(updated) });
  });

  router.delete('/:id', requireSettingsWrite, async (req: AuthedRequest, res) => {
    const ok = await faq.deleteItem(String(req.params.id));
    if (!ok) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    res.json({ ok: true });
  });

  app.use('/api/faq', router);
}
