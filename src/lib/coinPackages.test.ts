import { describe, expect, it } from 'vitest';
import type { CoinPackage } from '@softgate/shared';
import { mockCoinPackages } from '@softgate/shared';
import {
  isValidBonus,
  isValidCoinAmount,
  isValidPrice,
  nextCoinPackageId,
  parsePackInt,
  packageLabel,
  toPersistedPackage,
  withExclusiveBadges,
} from './coinPackages';

const pack = (overrides: Partial<CoinPackage> & Pick<CoinPackage, 'id'>): CoinPackage => ({
  coins: 10,
  price: 100,
  ...overrides,
});

describe('nextCoinPackageId', () => {
  it('returns the next numeric id and ignores non-numeric leftovers', () => {
    expect(nextCoinPackageId(mockCoinPackages)).toBe('7');
    expect(nextCoinPackageId([pack({ id: '2' }), pack({ id: 's1' }), pack({ id: '9' })])).toBe(
      '10',
    );
  });
});

describe('parse and validate', () => {
  it('accepts whole non-negative integers with the documented floors', () => {
    expect(parsePackInt(' 300 ')).toBe(300);
    expect(parsePackInt('3.5')).toBeNull();
    expect(parsePackInt('-1')).toBeNull();
    expect(isValidCoinAmount(1)).toBe(true);
    expect(isValidCoinAmount(0)).toBe(false);
    expect(isValidPrice(1)).toBe(true);
    expect(isValidPrice(0)).toBe(false);
    expect(isValidBonus(0)).toBe(true);
    expect(isValidBonus(-1)).toBe(false);
  });
});

describe('withExclusiveBadges', () => {
  it('keeps one popular and one bestValue, never both on the same pack', () => {
    const list = [
      pack({ id: '1', popular: true }),
      pack({ id: '2', bestValue: true }),
      pack({ id: '3' }),
    ];
    const popularOn3 = withExclusiveBadges(list, '3', 'popular');
    expect(popularOn3.find((item) => item.id === '3')?.popular).toBe(true);
    expect(popularOn3.find((item) => item.id === '3')?.bestValue).toBeUndefined();
    expect(popularOn3.find((item) => item.id === '1')?.popular).toBeUndefined();
    expect(popularOn3.find((item) => item.id === '2')?.bestValue).toBe(true);

    const bothCleared = withExclusiveBadges(popularOn3, '3', 'bestValue');
    expect(bothCleared.find((item) => item.id === '3')?.bestValue).toBe(true);
    expect(bothCleared.find((item) => item.id === '3')?.popular).toBeUndefined();
    expect(bothCleared.find((item) => item.id === '2')?.bestValue).toBeUndefined();
  });
});

describe('packageLabel', () => {
  it('uses an English label and leaves mm empty', () => {
    expect(packageLabel({ coins: 300 })).toEqual({ en: '300 coins', mm: '' });
  });
});

describe('toPersistedPackage', () => {
  it('drops zero bonus and false flags', () => {
    expect(
      toPersistedPackage(
        pack({ id: '1', coins: 50, price: 1000, bonus: 0, popular: false, bestValue: false }),
      ),
    ).toEqual({ id: '1', coins: 50, price: 1000 });
    expect(
      toPersistedPackage(pack({ id: '3', coins: 300, price: 5000, bonus: 30, popular: true })),
    ).toEqual({
      id: '3',
      coins: 300,
      price: 5000,
      bonus: 30,
      popular: true,
    });
  });
});
