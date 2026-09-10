import { Card, Skeleton, SkeletonSection } from '../../../components';

const PressPageSkeleton = () => (
  <SkeletonSection className="space-y-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-2">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-4 w-80" />
      </div>
      <Skeleton className="h-10 w-36 rounded-lg" />
    </div>
    <Card>
      <Skeleton className="h-6 w-32" />
      <Skeleton className="mt-4 h-24 w-full rounded-lg" />
    </Card>
    <Card>
      <Skeleton className="h-6 w-24" />
      <Skeleton className="mt-4 h-24 w-full rounded-lg" />
    </Card>
  </SkeletonSection>
);

export default PressPageSkeleton;
