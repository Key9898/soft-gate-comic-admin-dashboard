import { Card, Skeleton, SkeletonSection, SkeletonStatCard } from '../../../components';

const DashboardPageSkeleton = () => (
  <SkeletonSection className="space-y-6">
    <div className="space-y-2">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-4 w-64" />
    </div>

    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <SkeletonStatCard key={i} />
      ))}
    </div>

    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <SkeletonStatCard key={i} />
      ))}
    </div>

    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card>
        <Skeleton className="mb-4 h-5 w-40" />
        <Skeleton variant="rectangular" className="h-80 w-full" />
      </Card>
      <Card>
        <Skeleton className="mb-4 h-5 w-32" />
        <Skeleton variant="rectangular" className="h-80 w-full" />
      </Card>
    </div>

    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card>
        <Skeleton className="mb-4 h-5 w-40" />
        <Skeleton variant="rectangular" className="h-80 w-full" />
      </Card>
      <Card>
        <Skeleton className="mb-4 h-5 w-44" />
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
              <div className="flex items-center gap-3">
                <Skeleton variant="circular" className="h-6 w-6" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  </SkeletonSection>
);

export default DashboardPageSkeleton;
