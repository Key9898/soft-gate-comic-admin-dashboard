import {
  Card,
  Skeleton,
  SkeletonSection,
  SkeletonStatCard,
  SkeletonTable,
} from '../../../components';

const UsersPageSkeleton = () => (
  <SkeletonSection className="space-y-6">
    <div className="space-y-2">
      <Skeleton className="h-8 w-24" />
      <Skeleton className="h-4 w-48" />
    </div>

    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <SkeletonStatCard key={i} />
      ))}
    </div>

    <Card>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row">
        <Skeleton className="h-10 flex-1 rounded-lg" />
        <Skeleton className="h-10 w-40 rounded-lg" />
      </div>
      <SkeletonTable columnCount={7} rows={8} leading="avatar" />
    </Card>
  </SkeletonSection>
);

export default UsersPageSkeleton;
