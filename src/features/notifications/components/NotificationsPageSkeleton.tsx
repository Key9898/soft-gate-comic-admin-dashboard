import { Card, Skeleton, SkeletonSection } from '../../../components';

const NotificationsPageSkeleton = () => (
  <SkeletonSection className="space-y-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-48" />
      </div>
      <Skeleton className="h-10 w-36 rounded-lg" />
    </div>

    <Card padding="none">
      <div className="border-b border-line p-4">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex gap-2">
            <Skeleton className="h-8 w-16 rounded-lg" />
            <Skeleton className="h-8 w-20 rounded-lg" />
          </div>
          <Skeleton className="h-9 w-36 rounded-lg" />
        </div>
      </div>
      <div className="border-b border-gray-100 bg-gray-50 p-3">
        <Skeleton className="h-4 w-24" />
      </div>
      <div className="divide-y divide-gray-100">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="p-4">
            <div className="flex items-start gap-4">
              <Skeleton variant="rectangular" className="mt-1 h-4 w-4 rounded" />
              <Skeleton variant="circular" className="h-10 w-10 flex-shrink-0" />
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-full" />
                <div className="flex gap-3">
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-3 w-12" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  </SkeletonSection>
);

export default NotificationsPageSkeleton;
