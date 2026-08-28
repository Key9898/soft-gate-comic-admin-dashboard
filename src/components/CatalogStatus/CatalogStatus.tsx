import { useEffect, useState } from 'react';
import { useData } from '@/lib/DataContext';
import Button from '../Button/Button';

const CatalogStatus = () => {
  const { isLoading, error, retry } = useData();
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setSlow(false);
      return;
    }
    const timer = window.setTimeout(() => setSlow(true), 10000);
    return () => window.clearTimeout(timer);
  }, [isLoading]);

  if (error) {
    return (
      <div
        role="alert"
        className="mb-4 flex flex-col gap-3 rounded-lg border border-line bg-surface p-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <p className="text-sm text-fg-secondary">Catalog request failed.</p>
        <Button type="button" size="sm" variant="outline" onClick={retry}>
          Retry
        </Button>
      </div>
    );
  }

  if (isLoading && slow) {
    return (
      <div className="mb-4 flex justify-end">
        <Button type="button" size="sm" variant="outline" onClick={retry}>
          Retry
        </Button>
      </div>
    );
  }

  return null;
};

export default CatalogStatus;
