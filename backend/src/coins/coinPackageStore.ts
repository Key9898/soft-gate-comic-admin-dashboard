export type CoinPackageRecord = {
  id: string;
  coins: number;
  price: number;
  bonus?: number;
  popular?: boolean;
  bestValue?: boolean;
};

export type CoinPackageWrite = {
  coins: number;
  price: number;
  bonus?: number;
  popular?: boolean;
  bestValue?: boolean;
};

export type CoinPackagePatch = Partial<CoinPackageWrite>;

export type CoinPackageStore = {
  list: () => Promise<CoinPackageRecord[]>;
  findById: (id: string) => Promise<CoinPackageRecord | null>;
  create: (input: CoinPackageWrite) => Promise<CoinPackageRecord>;
  update: (id: string, patch: CoinPackagePatch) => Promise<CoinPackageRecord | null>;
  delete: (id: string) => Promise<boolean>;
};

export function persistedPack(pack: CoinPackageRecord): CoinPackageRecord {
  const next: CoinPackageRecord = { id: pack.id, coins: pack.coins, price: pack.price };
  if (pack.bonus && pack.bonus > 0) next.bonus = pack.bonus;
  if (pack.popular) next.popular = true;
  if (pack.bestValue) next.bestValue = true;
  return next;
}

export function exclusiveFlag(
  pack: Pick<CoinPackageRecord, 'popular' | 'bestValue'>,
): 'popular' | 'bestValue' | null {
  if (pack.popular) return 'popular';
  if (pack.bestValue) return 'bestValue';
  return null;
}
