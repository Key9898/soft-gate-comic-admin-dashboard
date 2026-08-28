import { Card, Skeleton, SkeletonSection } from '../../../components';

const ActivityLogPageSkeleton = () => (
  <SkeletonSection className="space-y-6">
    <div className="flex items-center justify-between">
      <Skeleton className="h-8 w-36" />
      <Skeleton className="h-10 w-32 rounded-lg" />
    </div>

    <Card className="p-4">
      <div className="mb-4 flex gap-4">
        <Skeleton className="h-10 flex-1 rounded-lg" />
        <Skeleton className="h-10 w-36 rounded-lg" />
        <Skeleton className="h-10 w-36 rounded-lg" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 rounded-lg bg-gray-50 p-4">
            <Skeleton variant="circular" className="h-10 w-10 flex-shrink-0" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-64" />
            </div>
            <div className="space-y-1">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        ))}
      </div>
    </Card>
  </SkeletonSection>
);

export default ActivityLogPageSkeleton;
