export type CommentRecord = {
  id: string;
  episodeKey: string;
  userId: string;
  content: string;
  parentId?: string;
  spoiler: boolean;
  reported: boolean;
  isEdited: boolean;
  createdAt: string;
};

export type CommentWrite = {
  id?: string;
  episodeKey: string;
  userId: string;
  content: string;
  parentId?: string;
  spoiler?: boolean;
  reported?: boolean;
  isEdited?: boolean;
  createdAt?: string;
};

export type CommentStore = {
  list: (filter?: { reported?: boolean }) => Promise<CommentRecord[]>;
  findById: (id: string) => Promise<CommentRecord | null>;
  create: (input: CommentWrite) => Promise<CommentRecord>;
  updateReported: (id: string, reported: boolean) => Promise<CommentRecord | null>;
  delete: (id: string) => Promise<boolean>;
};

export function publicComment(row: CommentRecord): CommentRecord {
  const next: CommentRecord = {
    id: row.id,
    episodeKey: row.episodeKey,
    userId: row.userId,
    content: row.content,
    spoiler: row.spoiler,
    reported: row.reported,
    isEdited: row.isEdited,
    createdAt: row.createdAt,
  };
  if (row.parentId) next.parentId = row.parentId;
  return next;
}
