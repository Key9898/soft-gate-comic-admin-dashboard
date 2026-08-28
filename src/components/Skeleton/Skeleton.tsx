import type { CSSProperties, ReactNode } from 'react';
import Card from '../Card/Card';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string;
  height?: string;
}

const variantClasses = {
  text: 'rounded h-4',
  circular: 'rounded-full',
  rectangular: 'rounded-lg',
};

const Skeleton = ({ className = '', variant = 'text', width, height }: SkeletonProps) => {
  const style: CSSProperties = {};
  if (width) style.width = width;
  if (height) style.height = height;

  return (
    <div
      aria-hidden
      className={`skeleton-sheen bg-gray-200 ${variantClasses[variant]} ${className}`}
      style={style}
    />
  );
};

export const SkeletonSection = ({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) => (
  <div
    role="status"
    aria-busy="true"
    aria-label="Loading"
    className={`skeleton-appear ${className}`}
  >
    {children}
  </div>
);

export const coverSheenClass = 'pointer-events-none absolute inset-0 skeleton-sheen bg-gray-200';

export const SkeletonText = ({
  lines = 3,
  className = '',
}: {
  lines?: number;
  className?: string;
}) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton key={i} className={i === lines - 1 ? 'w-3/4' : 'w-full'} />
    ))}
  </div>
);

export const SkeletonStatCard = () => (
  <Card>
    <div className="flex items-start justify-between">
      <div className="space-y-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-3 w-16" />
      </div>
      <Skeleton variant="rectangular" className="h-12 w-12 rounded-lg" />
    </div>
  </Card>
);

export const SkeletonTable = ({
  columnCount,
  rows = 8,
  leading,
}: {
  columnCount: number;
  rows?: number;
  leading?: 'cover' | 'avatar';
}) => (
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead>
        <tr className="border-b border-line">
          {Array.from({ length: columnCount }).map((_, i) => (
            <th key={i} className="table-header">
              <Skeleton className="h-3 w-16" />
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-line">
        {Array.from({ length: rows }).map((_, row) => (
          <tr key={row}>
            {Array.from({ length: columnCount }).map((_, col) => (
              <td key={col} className="table-cell">
                {col === 0 && leading === 'cover' ? (
                  <div className="flex items-center gap-3">
                    <Skeleton variant="rectangular" className="h-16 w-12 flex-shrink-0" />
                    <Skeleton className="h-4 w-28" />
                  </div>
                ) : col === 0 && leading === 'avatar' ? (
                  <div className="flex items-center gap-3">
                    <Skeleton variant="circular" className="h-10 w-10 flex-shrink-0" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                ) : (
                  <Skeleton className="h-4 w-16" />
                )}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export const TableSkeleton = ({ rows = 5 }: { rows?: number }) => (
  <SkeletonTable columnCount={5} rows={rows} />
);

export const CardSkeleton = () => (
  <Card>
    <div className="mb-4 flex items-center gap-4">
      <Skeleton variant="circular" className="h-12 w-12" />
      <div className="flex-1">
        <Skeleton className="mb-2 w-3/4" />
        <Skeleton className="w-1/2" />
      </div>
    </div>
    <Skeleton className="h-24 w-full" variant="rectangular" />
  </Card>
);

export const StatsSkeleton = () => <SkeletonStatCard />;

export const ImageSkeleton = ({ className = '' }: { className?: string }) => (
  <Skeleton variant="rectangular" className={className} />
);

export const TextSkeleton = SkeletonText;

export default Skeleton;
