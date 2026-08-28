import { Card, Skeleton, SkeletonSection, SkeletonTable } from '../../../components';

const WebtoonsPageSkeleton = () => (
  <SkeletonSection className="space-y-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-2">
        <Skeleton className="h-8 w-36" />
        <Skeleton className="h-4 w-56" />
      </div>
      <Skeleton className="h-10 w-32 rounded-lg" />
    </div>

    <Card>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row">
        <Skeleton className="h-10 flex-1 rounded-lg" />
        <Skeleton className="h-10 w-40 rounded-lg" />
      </div>
      <SkeletonTable columnCount={9} rows={8} leading="cover" />
    </Card>
  </SkeletonSection>
);

export default WebtoonsPageSkeleton;
