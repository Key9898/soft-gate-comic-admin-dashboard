import type { Comment } from '@softgate/shared';
import { apiRequest } from './http';

export type CommentStatusBody = {
  status: Comment['status'];
};

export function listComments() {
  return apiRequest<{ comments: Comment[] }>('/api/comments');
}

export function updateCommentStatus(id: string, body: CommentStatusBody) {
  return apiRequest<{ comment: Comment }>(`/api/comments/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export function deleteComment(id: string) {
  return apiRequest<{ ok: true }>(`/api/comments/${id}`, { method: 'DELETE' });
}
