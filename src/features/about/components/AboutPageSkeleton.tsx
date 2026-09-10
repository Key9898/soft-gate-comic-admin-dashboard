import { Card, Skeleton, SkeletonSection } from '../../../components';

const AboutPageSkeleton = () => (
  <SkeletonSection className="space-y-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-2">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-4 w-80" />
      </div>
      <Skeleton className="h-10 w-36 rounded-lg" />
    </div>

    <Card>
      <div className="mb-6">
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-24 w-full rounded-lg" />
      </div>
    </Card>

    <Card>
      <div className="mb-6 space-y-3">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
      <Skeleton className="h-24 w-full rounded-lg" />
    </Card>
  </SkeletonSection>
);

export default AboutPageSkeleton;
