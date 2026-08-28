import { Card, Skeleton, SkeletonSection } from '../../../components';

const ProfilePageSkeleton = () => (
  <SkeletonSection className="mx-auto max-w-4xl space-y-6">
    <Skeleton className="h-8 w-32" />

    <Card className="p-6">
      <div className="flex items-start gap-6">
        <Skeleton variant="circular" className="h-24 w-24" />
        <div className="flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-6">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-36" />
          </div>
        </div>
      </div>
    </Card>

    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-10 w-16 rounded-lg" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
    </Card>

    <Card className="p-6">
      <div className="mb-2 flex items-center justify-between gap-4">
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-10 w-24 rounded-lg" />
      </div>
      <Skeleton className="h-4 w-64" />
    </Card>
  </SkeletonSection>
);

export default ProfilePageSkeleton;
