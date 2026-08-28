import { Card, Skeleton, SkeletonSection, SkeletonStatCard } from '../../../components';

const RevenuePageSkeleton = () => (
  <SkeletonSection className="space-y-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-2">
        <Skeleton className="h-8 w-52" />
        <Skeleton className="h-4 w-64" />
      </div>
      <Skeleton className="h-10 w-36 rounded-lg" />
    </div>

    <div className="flex gap-2 border-b border-line">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="mb-2 h-8 w-24" />
      ))}
    </div>

    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <SkeletonStatCard key={i} />
      ))}
    </div>

    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {Array.from({ length: 2 }).map((_, card) => (
        <Card key={card} padding="none">
          <div className="border-b border-line p-4">
            <Skeleton className="h-5 w-40" />
          </div>
          <div className="divide-y divide-gray-100">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <Skeleton variant="circular" className="h-10 w-10" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-3 w-36" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Skeleton className="ml-auto h-4 w-16" />
                  <Skeleton className="ml-auto h-3 w-12" />
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-line p-4">
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        </Card>
      ))}
    </div>
  </SkeletonSection>
);

export default RevenuePageSkeleton;
