const MOCK_HASH_PREFIX = 'sgmock:';

export const hashPassword = (password: string): string => {
  const encoded = btoa(unescape(encodeURIComponent(`${MOCK_HASH_PREFIX}${password}`)));
  return `${MOCK_HASH_PREFIX}${encoded}`;
};

export const verifyPassword = (password: string, passwordHash?: string): boolean => {
  if (!passwordHash) return false;
  return hashPassword(password) === passwordHash;
};
