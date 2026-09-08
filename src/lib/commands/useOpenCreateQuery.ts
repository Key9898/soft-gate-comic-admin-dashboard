import { useEffect, useRef } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';

const pendingCreateByPath = new Set<string>();

export const useOpenCreateQuery = (onOpen: () => void, enabled = true) => {
  const { pathname } = useLocation();
  const [params, setParams] = useSearchParams();
  const onOpenRef = useRef(onOpen);
  onOpenRef.current = onOpen;
  const openedThisMount = useRef(false);

  useEffect(() => {
    if (!enabled) return;

    const fromQuery = params.get('new') === '1';
    const fromPending = pendingCreateByPath.has(pathname);
    if (!fromQuery && !fromPending) return;

    if (!openedThisMount.current) {
      onOpenRef.current();
      openedThisMount.current = true;
    }

    if (fromQuery) {
      pendingCreateByPath.add(pathname);
      const next = new URLSearchParams(params);
      next.delete('new');
      setParams(next, { replace: true });
      return;
    }

    pendingCreateByPath.delete(pathname);
  }, [enabled, params, pathname, setParams]);
};
