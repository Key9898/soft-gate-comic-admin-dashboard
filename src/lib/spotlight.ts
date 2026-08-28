import type { Webtoon } from '@softgate/shared';

export const SPOTLIGHT_CAP = 5;
export const SPOTLIGHT_ORDERS = [1, 2, 3, 4, 5] as const;

export type SpotlightOrder = (typeof SPOTLIGHT_ORDERS)[number];

export const isSpotlightFlagged = (webtoon: Pick<Webtoon, 'spotlight' | 'status'>): boolean =>
  Boolean(webtoon.spotlight) && webtoon.status !== 'draft';

export const flaggedSpotlightCount = (webtoons: Webtoon[], excludeId?: string): number =>
  webtoons.filter((webtoon) => webtoon.id !== excludeId && isSpotlightFlagged(webtoon)).length;

export const canFlagSpotlight = (
  webtoons: Webtoon[],
  excludeId?: string,
  nextStatus?: Webtoon['status'],
): boolean => {
  if (nextStatus === 'draft') return true;
  const existing = webtoons.find((webtoon) => webtoon.id === excludeId);
  if (existing && isSpotlightFlagged(existing)) return true;
  return flaggedSpotlightCount(webtoons, excludeId) < SPOTLIGHT_CAP;
};

export const takenSpotlightOrders = (webtoons: Webtoon[], excludeId?: string): Set<number> => {
  const taken = new Set<number>();
  for (const webtoon of webtoons) {
    if (webtoon.id === excludeId) continue;
    if (webtoon.spotlight && webtoon.spotlightOrder != null) {
      taken.add(webtoon.spotlightOrder);
    }
  }
  return taken;
};

export const isSpotlightOrderTaken = (
  webtoons: Webtoon[],
  order: number,
  excludeId?: string,
): boolean => takenSpotlightOrders(webtoons, excludeId).has(order);
