/** Humanize admin role slugs for UI (e.g. super_admin → Super Admin). */
export const formatAdminRole = (role?: string | null): string => {
  if (!role) return 'Admin';
  return role
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
};
