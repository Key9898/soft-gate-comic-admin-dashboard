import { Card, Skeleton, SkeletonSection } from '../../../components';

const LegalPageSkeleton = () => (
  <SkeletonSection className="space-y-6">
    <div className="space-y-2">
      <Skeleton className="h-8 w-24" />
      <Skeleton className="h-4 w-80" />
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

export default LegalPageSkeleton;
