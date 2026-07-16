interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string;
  height?: string;
}

const Skeleton = ({ className = '', variant = 'text', width, height }: SkeletonProps) => {
  const baseClasses = 'animate-pulse bg-gray-200';

  const variantClasses = {
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  const widthClass = width ? `w-[${width}]` : '';
  const heightClass = height ? `h-[${height}]` : '';

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${widthClass} ${heightClass} ${className}`}
    />
  );
};

export const TableSkeleton = ({ rows = 5 }: { rows?: number }) => (
  <div className="space-y-3">
    <div className="flex gap-4 rounded-lg bg-gray-50 p-4">
      <Skeleton width="40px" />
      <Skeleton className="flex-1" />
      <Skeleton width="100px" />
      <Skeleton width="80px" />
      <Skeleton width="60px" />
    </div>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex gap-4 p-4">
        <Skeleton width="40px" />
        <Skeleton className="flex-1" />
        <Skeleton width="100px" />
        <Skeleton width="80px" />
        <Skeleton width="60px" />
      </div>
    ))}
  </div>
);

export const CardSkeleton = () => (
  <div className="rounded-xl bg-white p-6 shadow-sm">
    <div className="mb-4 flex items-center gap-4">
      <Skeleton variant="circular" width="48px" height="48px" />
      <div className="flex-1">
        <Skeleton className="mb-2 w-3/4" />
        <Skeleton className="w-1/2" />
      </div>
    </div>
    <Skeleton className="h-24 w-full" variant="rectangular" />
  </div>
);

export const StatsSkeleton = () => (
  <div className="rounded-xl bg-white p-6 shadow-sm">
    <div className="mb-4 flex items-center justify-between">
      <Skeleton className="w-1/2" />
      <Skeleton variant="circular" width="40px" height="40px" />
    </div>
    <Skeleton className="mb-2 h-8 w-3/4" />
    <Skeleton className="w-1/2" />
  </div>
);

export const ImageSkeleton = ({ className = '' }: { className?: string }) => (
  <Skeleton variant="rectangular" className={className} />
);

export const TextSkeleton = ({ lines = 3 }: { lines?: number }) => (
  <div className="space-y-2">
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton key={i} className={i === lines - 1 ? 'w-3/4' : 'w-full'} />
    ))}
  </div>
);

export default Skeleton;
