import { Card, Skeleton, SkeletonSection, SkeletonTable } from '../../../components';

const TeamPageSkeleton = () => (
  <SkeletonSection className="space-y-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-2">
        <Skeleton className="h-8 w-28" />
        <Skeleton className="h-4 w-56" />
      </div>
      <Skeleton className="h-10 w-36 rounded-lg" />
    </div>

    <Card>
      <SkeletonTable columnCount={5} rows={4} leading="avatar" />
    </Card>
    <Card>
      <Skeleton className="mb-4 h-5 w-36" />
      <SkeletonTable columnCount={4} rows={3} />
    </Card>
    <Card>
      <Skeleton className="mb-4 h-5 w-16" />
      <div className="space-y-3">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="space-y-1.5">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-full" />
          </div>
        ))}
      </div>
    </Card>
  </SkeletonSection>
);

export default TeamPageSkeleton;
