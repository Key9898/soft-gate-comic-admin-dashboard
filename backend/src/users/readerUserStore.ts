export type ReaderUserRecord = {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatar?: string;
  bio: string;
  createdAt: string;
  lastLoginAt?: string;
  coinBalance: number;
};

export type ReaderUserWrite = {
  id?: string;
  email: string;
  username: string;
  displayName: string;
  avatar?: string;
  bio?: string;
  passwordHash?: string;
  createdAt?: string;
  lastLoginAt?: string;
  coinBalance?: number;
};

export type ReaderUserProfilePatch = {
  displayName?: string;
  email?: string;
  bio?: string;
  avatar?: string | null;
};

export type ReaderUserStore = {
  list: () => Promise<ReaderUserRecord[]>;
  findById: (id: string) => Promise<ReaderUserRecord | null>;
  create: (input: ReaderUserWrite) => Promise<ReaderUserRecord>;
  updateProfile: (id: string, patch: ReaderUserProfilePatch) => Promise<ReaderUserRecord | null>;
  delete: (id: string) => Promise<boolean>;
};

export class EmailTakenError extends Error {
  constructor() {
    super('Email taken');
    this.name = 'EmailTakenError';
  }
}

export function publicUser(row: ReaderUserRecord): ReaderUserRecord {
  const next: ReaderUserRecord = {
    id: row.id,
    email: row.email,
    username: row.username,
    displayName: row.displayName,
    bio: row.bio,
    createdAt: row.createdAt,
    coinBalance: row.coinBalance,
  };
  if (row.avatar) next.avatar = row.avatar;
  if (row.lastLoginAt) next.lastLoginAt = row.lastLoginAt;
  return next;
}
