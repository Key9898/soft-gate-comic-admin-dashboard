import type { PortalSettings } from '@softgate/shared';
import { apiRequest } from './http';

export function getPlatformSettings() {
  return apiRequest<{ settings: PortalSettings }>('/api/settings');
}

export function updatePlatformSettings(body: PortalSettings) {
  return apiRequest<{ settings: PortalSettings }>('/api/settings', {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}
