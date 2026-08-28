import { Card, Skeleton, SkeletonSection } from '../../../components';

const SchedulePageSkeleton = () => (
  <SkeletonSection className="space-y-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-10 w-28 rounded-lg" />
        <Skeleton className="h-10 w-40 rounded-lg" />
      </div>
    </div>

    <Card>
      <div className="border-b border-line p-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-40 rounded-lg" />
          <div className="flex items-center gap-2">
            <Skeleton variant="rectangular" className="h-9 w-9 rounded-lg" />
            <Skeleton className="h-6 w-40" />
            <Skeleton variant="rectangular" className="h-9 w-9 rounded-lg" />
          </div>
        </div>
      </div>
      <div className="p-4">
        <div className="mb-2 grid grid-cols-7 gap-1">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="mx-auto h-4 w-8" />
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 42 }).map((_, i) => (
            <Skeleton key={i} variant="rectangular" className="h-24 w-full" />
          ))}
        </div>
      </div>
    </Card>
  </SkeletonSection>
);

export default SchedulePageSkeleton;
