import { describe, it, expect } from 'vitest';
import { render, screen } from '../../test/utils';
import Skeleton, { SkeletonSection } from './Skeleton';
import DashboardPageSkeleton from '../../features/dashboard/components/DashboardPageSkeleton';
import WebtoonsPageSkeleton from '../../features/webtoons/components/WebtoonsPageSkeleton';
import AuthorsPageSkeleton from '../../features/authors/components/AuthorsPageSkeleton';
import GenresPageSkeleton from '../../features/genres/components/GenresPageSkeleton';
import CoinPackagesPageSkeleton from '../../features/coin-packages/components/CoinPackagesPageSkeleton';
import EpisodesPageSkeleton from '../../features/episodes/components/EpisodesPageSkeleton';
import UsersPageSkeleton from '../../features/users/components/UsersPageSkeleton';
import CommentsPageSkeleton from '../../features/comments/components/CommentsPageSkeleton';
import AnalyticsPageSkeleton from '../../features/analytics/components/AnalyticsPageSkeleton';
import MediaLibraryPageSkeleton from '../../features/media/components/MediaLibraryPageSkeleton';
import ReportsPageSkeleton from '../../features/reports/components/ReportsPageSkeleton';
import ActivityLogPageSkeleton from '../../features/activity-log/components/ActivityLogPageSkeleton';
import RevenuePageSkeleton from '../../features/revenue/components/RevenuePageSkeleton';
import NotificationsPageSkeleton from '../../features/notifications/components/NotificationsPageSkeleton';
import SchedulePageSkeleton from '../../features/schedule/components/SchedulePageSkeleton';
import TeamPageSkeleton from '../../features/team/components/TeamPageSkeleton';
import SettingsPageSkeleton from '../../features/settings/components/SettingsPageSkeleton';
import ProfilePageSkeleton from '../../features/profile/components/ProfilePageSkeleton';

const pages = [
  ['Dashboard', DashboardPageSkeleton],
  ['Webtoons', WebtoonsPageSkeleton],
  ['Authors', AuthorsPageSkeleton],
  ['Genres', GenresPageSkeleton],
  ['Coin packages', CoinPackagesPageSkeleton],
  ['Episodes', EpisodesPageSkeleton],
  ['Users', UsersPageSkeleton],
  ['Comments', CommentsPageSkeleton],
  ['Analytics', AnalyticsPageSkeleton],
  ['Media', MediaLibraryPageSkeleton],
  ['Reports', ReportsPageSkeleton],
  ['Activity', ActivityLogPageSkeleton],
  ['Revenue', RevenuePageSkeleton],
  ['Notifications', NotificationsPageSkeleton],
  ['Schedule', SchedulePageSkeleton],
  ['Team', TeamPageSkeleton],
  ['Settings', SettingsPageSkeleton],
  ['Profile', ProfilePageSkeleton],
] as const;

describe('page skeletons', () => {
  it.each(pages)('%s skeleton is a busy status region without product copy', (_name, Component) => {
    render(<Component />);
    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('aria-busy', 'true');
    expect(status).toHaveAttribute('aria-label', 'Loading');
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
    expect(screen.queryByText('Webtoons')).not.toBeInTheDocument();
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });

  it('bones are aria-hidden', () => {
    render(<Skeleton className="h-4 w-10" />);
    expect(document.querySelector('[aria-hidden]')).toBeInTheDocument();
  });

  it('SkeletonSection exposes loading semantics', () => {
    render(
      <SkeletonSection>
        <Skeleton className="h-4 w-10" />
      </SkeletonSection>,
    );
    expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true');
  });
});
