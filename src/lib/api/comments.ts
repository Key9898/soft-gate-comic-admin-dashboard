import type { ReaderComment } from '@softgate/shared';
import { apiRequest } from './http';

export type CommentReportedBody = {
  reported: boolean;
};

export function listComments() {
  return apiRequest<{ comments: ReaderComment[] }>('/api/comments');
}

export function updateCommentReported(id: string, body: CommentReportedBody) {
  return apiRequest<{ comment: ReaderComment }>(`/api/comments/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export function deleteComment(id: string) {
  return apiRequest<{ ok: true }>(`/api/comments/${id}`, { method: 'DELETE' });
}
