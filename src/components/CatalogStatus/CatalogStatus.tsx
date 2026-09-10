import { useEffect, useState } from 'react';
import { useData } from '@/lib/DataContext';
import Button from '../Button/Button';
import LaneStatus from '../LaneStatus/LaneStatus';

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
    return <LaneStatus message="Catalog request failed." onRetry={retry} />;
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
