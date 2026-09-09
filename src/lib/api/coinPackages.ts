import type { CoinPackage } from '@softgate/shared';
import { apiRequest } from './http';

export type CoinPackageWriteBody = {
  coins: number;
  price: number;
  bonus?: number;
  popular?: boolean;
  bestValue?: boolean;
};

export function listCoinPackages() {
  return apiRequest<{ coinPackages: CoinPackage[] }>('/api/coin-packages');
}

export function createCoinPackage(body: CoinPackageWriteBody) {
  return apiRequest<{ coinPackage: CoinPackage }>('/api/coin-packages', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function updateCoinPackage(id: string, body: CoinPackageWriteBody) {
  return apiRequest<{ coinPackage: CoinPackage }>(`/api/coin-packages/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export function deleteCoinPackage(id: string) {
  return apiRequest<{ ok: true }>(`/api/coin-packages/${id}`, { method: 'DELETE' });
}
