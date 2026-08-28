import { Card, Skeleton, SkeletonSection, SkeletonTable } from '../../../components';

const GenresPageSkeleton = () => (
  <SkeletonSection className="space-y-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-2">
        <Skeleton className="h-8 w-28" />
        <Skeleton className="h-4 w-64" />
      </div>
      <Skeleton className="h-10 w-32 rounded-lg" />
    </div>

    <Card>
      <div className="mb-6">
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
      <SkeletonTable columnCount={5} rows={8} />
    </Card>
  </SkeletonSection>
);

export default GenresPageSkeleton;
