import { Card, Skeleton, SkeletonSection, SkeletonStatCard } from '../../../components';

const CommentsPageSkeleton = () => (
  <SkeletonSection className="space-y-6">
    <div className="space-y-2">
      <Skeleton className="h-8 w-32" />
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
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-line p-4">
            <div className="flex items-start gap-3">
              <Skeleton variant="circular" className="h-10 w-10 flex-shrink-0" />
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  </SkeletonSection>
);

export default CommentsPageSkeleton;
