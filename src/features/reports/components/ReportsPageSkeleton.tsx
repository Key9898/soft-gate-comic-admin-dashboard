import { Card, Skeleton, SkeletonSection, SkeletonTable } from '../../../components';

const ReportsPageSkeleton = () => (
  <SkeletonSection className="space-y-6">
    <div className="flex items-center justify-between">
      <Skeleton className="h-8 w-28" />
      <Skeleton className="h-4 w-24" />
    </div>

    <Card className="p-4">
      <div className="mb-4 flex gap-4">
        <Skeleton className="h-10 flex-1 rounded-lg" />
        <Skeleton className="h-10 w-36 rounded-lg" />
        <Skeleton className="h-10 w-36 rounded-lg" />
      </div>
      <SkeletonTable columnCount={8} rows={8} />
    </Card>
  </SkeletonSection>
);

export default ReportsPageSkeleton;
