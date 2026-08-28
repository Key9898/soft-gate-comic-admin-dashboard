import type { CoinPackage } from '@softgate/shared';

export type CoinPackageBadge = 'popular' | 'bestValue';

const numericId = (id: string): number | null => {
  if (!/^\d+$/.test(id)) return null;
  const n = Number(id);
  return Number.isFinite(n) ? n : null;
};

export const nextCoinPackageId = (packages: CoinPackage[]): string => {
  let max = 0;
  for (const pack of packages) {
    const n = numericId(pack.id);
    if (n != null && n > max) max = n;
  }
  return String(max + 1);
};

export const parsePackInt = (value: string): number | null => {
  const trimmed = value.trim();
  if (!/^\d+$/.test(trimmed)) return null;
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : null;
};

export const isValidCoinAmount = (coins: number): boolean => Number.isInteger(coins) && coins >= 1;

export const isValidPrice = (price: number): boolean => Number.isInteger(price) && price >= 1;

export const isValidBonus = (bonus: number): boolean => Number.isInteger(bonus) && bonus >= 0;

export const withExclusiveBadges = (
  packages: CoinPackage[],
  id: string,
  flag: CoinPackageBadge | null,
): CoinPackage[] =>
  packages.map((pack) => {
    if (pack.id === id) {
      return {
        ...pack,
        popular: flag === 'popular' ? true : undefined,
        bestValue: flag === 'bestValue' ? true : undefined,
      };
    }
    if (flag === 'popular') return { ...pack, popular: undefined };
    if (flag === 'bestValue') return { ...pack, bestValue: undefined };
    return pack;
  });

export const toPersistedPackage = (pack: CoinPackage): CoinPackage => {
  const next: CoinPackage = {
    id: pack.id,
    coins: pack.coins,
    price: pack.price,
  };
  if (pack.bonus && pack.bonus > 0) next.bonus = pack.bonus;
  if (pack.popular) next.popular = true;
  if (pack.bestValue) next.bestValue = true;
  return next;
};

export const packageLabel = (pack: Pick<CoinPackage, 'coins'>): { en: string; mm: string } => ({
  en: `${pack.coins} coins`,
  mm: '',
});
