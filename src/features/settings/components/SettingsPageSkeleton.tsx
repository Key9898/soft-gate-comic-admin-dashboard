import { Card, Skeleton, SkeletonSection } from '../../../components';

const ToggleRowBone = () => (
  <div className="flex items-center justify-between gap-4">
    <div className="space-y-1">
      <Skeleton className="h-4 w-36" />
      <Skeleton className="h-3 w-48" />
    </div>
    <Skeleton className="h-6 w-11 rounded-full" />
  </div>
);

const SettingsPageSkeleton = () => (
  <SkeletonSection className="space-y-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-2">
        <Skeleton className="h-8 w-28" />
        <Skeleton className="h-4 w-48" />
      </div>
      <Skeleton className="h-10 w-36 rounded-lg" />
    </div>

    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card>
        <div className="mb-4 flex items-center gap-3">
          <Skeleton variant="rectangular" className="h-9 w-9 rounded-lg" />
          <Skeleton className="h-5 w-40" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton variant="rectangular" className="h-20 w-full" />
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      </Card>

      <Card>
        <div className="mb-4 flex items-center gap-3">
          <Skeleton variant="rectangular" className="h-9 w-9 rounded-lg" />
          <Skeleton className="h-5 w-36" />
        </div>
        <div className="space-y-4">
          <ToggleRowBone />
          <ToggleRowBone />
          <ToggleRowBone />
        </div>
      </Card>

      <Card>
        <div className="mb-4 flex items-center gap-3">
          <Skeleton variant="rectangular" className="h-9 w-9 rounded-lg" />
          <Skeleton className="h-5 w-44" />
        </div>
        <div className="space-y-3">
          <ToggleRowBone />
          <ToggleRowBone />
          <ToggleRowBone />
          <ToggleRowBone />
        </div>
      </Card>

      <Card>
        <div className="mb-4 flex items-center gap-3">
          <Skeleton variant="rectangular" className="h-9 w-9 rounded-lg" />
          <Skeleton className="h-5 w-40" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-3 w-64" />
        </div>
      </Card>
    </div>
  </SkeletonSection>
);

export default SettingsPageSkeleton;
