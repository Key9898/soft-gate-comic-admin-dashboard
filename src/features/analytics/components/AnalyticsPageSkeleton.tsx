import {
  Card,
  Skeleton,
  SkeletonSection,
  SkeletonStatCard,
  SkeletonTable,
} from '../../../components';

const AnalyticsPageSkeleton = () => (
  <SkeletonSection className="space-y-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-2">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-56" />
      </div>
      <div className="flex overflow-hidden rounded-lg border border-line-strong">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-20 rounded-none" />
        ))}
      </div>
    </div>

    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <SkeletonStatCard key={i} />
      ))}
    </div>

    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card>
        <Skeleton className="mb-4 h-5 w-32" />
        <Skeleton variant="rectangular" className="h-80 w-full" />
      </Card>
      <Card>
        <Skeleton className="mb-4 h-5 w-32" />
        <Skeleton variant="rectangular" className="h-80 w-full" />
      </Card>
    </div>

    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <Skeleton className="mb-4 h-5 w-44" />
        <Skeleton variant="rectangular" className="h-80 w-full" />
      </Card>
      <Card>
        <Skeleton className="mb-4 h-5 w-36" />
        <Skeleton variant="rectangular" className="h-80 w-full" />
        <div className="mt-4 grid grid-cols-2 gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton variant="circular" className="h-3 w-3" />
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </div>
      </Card>
    </div>

    <Card>
      <Skeleton className="mb-4 h-5 w-40" />
      <SkeletonTable columnCount={5} rows={5} />
    </Card>
  </SkeletonSection>
);

export default AnalyticsPageSkeleton;
