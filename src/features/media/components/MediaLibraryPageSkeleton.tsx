import { Card, Skeleton, SkeletonSection } from '../../../components';

const MediaLibraryPageSkeleton = () => (
  <SkeletonSection className="space-y-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-48" />
      </div>
      <Skeleton className="h-10 w-28 rounded-lg" />
    </div>

    <Card>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row">
        <Skeleton className="h-10 flex-1 rounded-lg" />
        <Skeleton className="h-10 w-32 rounded-lg" />
        <Skeleton className="h-10 w-40 rounded-lg" />
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-lg border border-line">
            <Skeleton variant="rectangular" className="h-32 w-full rounded-none" />
            <div className="space-y-2 p-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-12" />
            </div>
          </div>
        ))}
      </div>
    </Card>
  </SkeletonSection>
);

export default MediaLibraryPageSkeleton;
