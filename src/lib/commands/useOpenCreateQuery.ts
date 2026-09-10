import { useEffect, useRef } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';

const pendingCreateByPath = new Set<string>();

export const useOpenCreateQuery = (onOpen: () => void, enabled = true, kind = '1') => {
  const { pathname } = useLocation();
  const [params, setParams] = useSearchParams();
  const onOpenRef = useRef(onOpen);
  onOpenRef.current = onOpen;
  const openedThisMount = useRef(false);

  useEffect(() => {
    if (!enabled) return;

    const pendingKey = `${pathname}::${kind}`;
    const fromQuery = params.get('new') === kind;
    const fromPending = pendingCreateByPath.has(pendingKey);
    if (!fromQuery && !fromPending) return;

    if (!openedThisMount.current) {
      onOpenRef.current();
      openedThisMount.current = true;
    }

    if (fromQuery) {
      pendingCreateByPath.add(pendingKey);
      const next = new URLSearchParams(params);
      next.delete('new');
      setParams(next, { replace: true });
      return;
    }

    pendingCreateByPath.delete(pendingKey);
  }, [enabled, kind, params, pathname, setParams]);
};
