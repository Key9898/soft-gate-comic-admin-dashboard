export const COMMENT_STATUSES = ['visible', 'hidden', 'deleted'] as const;

export type CommentStatus = (typeof COMMENT_STATUSES)[number];

export type CommentUserSnapshot = {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatar?: string;
  bio?: string;
  coinBalance: number;
  status: 'active' | 'banned' | 'suspended';
  createdAt: string;
  lastLoginAt?: string;
};

export type CommentRecord = {
  id: string;
  userId: string;
  user: CommentUserSnapshot;
  webtoonId: string;
  episodeId: string;
  content: { en: string; mm: string };
  likeCount: number;
  status: CommentStatus;
  createdAt: string;
};

export type CommentWrite = {
  userId: string;
  user: CommentUserSnapshot;
  webtoonId: string;
  episodeId: string;
  content: { en: string; mm: string };
  likeCount?: number;
  status?: CommentStatus;
};

export type CommentStore = {
  list: () => Promise<CommentRecord[]>;
  findById: (id: string) => Promise<CommentRecord | null>;
  create: (input: CommentWrite) => Promise<CommentRecord>;
  updateStatus: (id: string, status: CommentStatus) => Promise<CommentRecord | null>;
};

export function isCommentStatus(value: unknown): value is CommentStatus {
  return value === 'visible' || value === 'hidden' || value === 'deleted';
}

export function publicComment(row: CommentRecord): CommentRecord {
  const user: CommentUserSnapshot = {
    id: row.user.id,
    email: row.user.email,
    username: row.user.username,
    displayName: row.user.displayName,
    coinBalance: row.user.coinBalance,
    status: row.user.status,
    createdAt: row.user.createdAt,
  };
  if (row.user.avatar) user.avatar = row.user.avatar;
  if (row.user.bio) user.bio = row.user.bio;
  if (row.user.lastLoginAt) user.lastLoginAt = row.user.lastLoginAt;
  return {
    id: row.id,
    userId: row.userId,
    user,
    webtoonId: row.webtoonId,
    episodeId: row.episodeId,
    content: { en: row.content.en, mm: row.content.mm },
    likeCount: row.likeCount,
    status: row.status,
    createdAt: row.createdAt,
  };
}

export function readUserSnapshot(value: unknown): CommentUserSnapshot | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const row = value as Record<string, unknown>;
  const id = typeof row.id === 'string' ? row.id : '';
  const email = typeof row.email === 'string' ? row.email : '';
  const username = typeof row.username === 'string' ? row.username : '';
  const displayName = typeof row.displayName === 'string' ? row.displayName : '';
  const createdAt = typeof row.createdAt === 'string' ? row.createdAt : '';
  const coinBalance =
    typeof row.coinBalance === 'number' && Number.isFinite(row.coinBalance) ? row.coinBalance : 0;
  const status =
    row.status === 'banned' || row.status === 'suspended' || row.status === 'active'
      ? row.status
      : 'active';
  if (!id || !email || !username || !displayName || !createdAt) return null;
  const user: CommentUserSnapshot = {
    id,
    email,
    username,
    displayName,
    coinBalance,
    status,
    createdAt,
  };
  if (typeof row.avatar === 'string' && row.avatar) user.avatar = row.avatar;
  if (typeof row.bio === 'string' && row.bio) user.bio = row.bio;
  if (typeof row.lastLoginAt === 'string' && row.lastLoginAt) user.lastLoginAt = row.lastLoginAt;
  return user;
}

export function readCommentContent(value: unknown): { en: string; mm: string } | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const row = value as { en?: unknown; mm?: unknown };
  const en = typeof row.en === 'string' ? row.en : '';
  const mm = typeof row.mm === 'string' ? row.mm : '';
  return { en, mm };
}
