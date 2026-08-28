import type { Dispatch, SetStateAction } from 'react';

export function markIdLoaded(setLoaded: Dispatch<SetStateAction<Set<string>>>, id: string) {
  setLoaded((prev) => {
    if (prev.has(id)) return prev;
    const next = new Set(prev);
    next.add(id);
    return next;
  });
}
