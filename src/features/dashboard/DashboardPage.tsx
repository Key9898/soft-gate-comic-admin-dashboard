import { Users, BookOpen, FileText, Eye, TrendingUp, DollarSign, Activity } from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, PageSEO } from '../../components';
import { useData } from '@/lib/DataContext';
import { readSgVar, useTheme } from '@/lib/theme';
import DashboardPageSkeleton from './components/DashboardPageSkeleton';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
}

const StatCard = ({ title, value, icon, change, changeType = 'neutral' }: StatCardProps) => {
  const changeColors = {
    positive: 'text-green-600',
    negative: 'text-red-600',
    neutral: 'text-fg-muted',
  };

  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-fg-muted">{title}</p>
          <p className="mt-1 text-2xl font-bold text-fg">{value}</p>
          {change && <p className={`mt-1 text-sm ${changeColors[changeType]}`}>{change}</p>}
        </div>
        <div className="rounded-lg bg-primary-50 p-3 text-primary-600">{icon}</div>
      </div>
    </Card>
  );
};

const DashboardPage = () => {
  const { resolvedTheme } = useTheme();
  const gridStroke = readSgVar('--sg-border', '#d1d5db');
  const tickStroke = readSgVar('--sg-text-muted', '#4b5563');
  // Subscribe to theme so chart strokes refresh when preference changes.
  void resolvedTheme;
  const {
    revenueData,
    userGrowthData,
    popularWebtoons,
    webtoons,
    episodes,
    users,
    comments,
    transactions,
    isLoading,
  } = useData();

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const formatCurrency = (num: number) => {
    return `$${num.toLocaleString()}`;
  };

  const totalViews = webtoons.reduce((sum, item) => sum + (item.viewCount || 0), 0);
  const totalRevenue = transactions
    .filter((tx) => tx.type === 'purchase' && tx.status === 'completed')
    .reduce((sum, tx) => sum + tx.amount, 0);
  const activeUsers = users.filter((u) => u.status === 'active').length;
  const visibleComments = comments.filter((c) => c.status === 'visible').length;
  const growthRate =
    userGrowthData.length >= 2
      ? (
          ((userGrowthData[userGrowthData.length - 1].users - userGrowthData[0].users) /
            Math.max(userGrowthData[0].users, 1)) *
          100
        ).toFixed(1)
      : '0.0';

  return (
    <>
      <PageSEO.Dashboard />
      {isLoading ? (
        <DashboardPageSkeleton />
      ) : (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-fg">Dashboard</h1>
            <p className="mt-1 text-fg-muted">Welcome back! Here's what's happening today.</p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Users"
              value={formatNumber(users.length)}
              icon={<Users className="h-6 w-6" />}
              change={`${activeUsers} active`}
              changeType="positive"
            />
            <StatCard
              title="Total Webtoons"
              value={webtoons.length}
              icon={<BookOpen className="h-6 w-6" />}
            />
            <StatCard
              title="Total Episodes"
              value={formatNumber(episodes.length)}
              icon={<FileText className="h-6 w-6" />}
              change={`${visibleComments} visible comments`}
              changeType="neutral"
            />
            <StatCard
              title="Total Views"
              value={formatNumber(totalViews)}
              icon={<Eye className="h-6 w-6" />}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <StatCard
              title="Total Revenue"
              value={formatCurrency(totalRevenue)}
              icon={<DollarSign className="h-6 w-6" />}
              change="From completed purchases"
              changeType="positive"
            />
            <StatCard
              title="Active Users"
              value={formatNumber(activeUsers)}
              icon={<Activity className="h-6 w-6" />}
              changeType="positive"
            />
            <StatCard
              title="Growth Rate"
              value={`${growthRate}%`}
              icon={<TrendingUp className="h-6 w-6" />}
              change="Across user-growth series"
              changeType="positive"
            />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <h3 className="mb-4 text-lg font-semibold text-fg">Revenue Overview</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0E9494" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#0E9494" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(value) => value.split('-')[2]}
                      stroke={tickStroke}
                      fontSize={12}
                    />
                    <YAxis stroke={tickStroke} fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: `1px solid ${gridStroke}`,
                        borderRadius: '8px',
                      }}
                      formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#0E9494"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card>
              <h3 className="mb-4 text-lg font-semibold text-fg">User Growth</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={userGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                    <XAxis dataKey="date" stroke={tickStroke} fontSize={12} />
                    <YAxis stroke={tickStroke} fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: `1px solid ${gridStroke}`,
                        borderRadius: '8px',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="users"
                      stroke="#0E9494"
                      strokeWidth={2}
                      dot={{ fill: '#0E9494', strokeWidth: 2 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="activeUsers"
                      stroke="#22C55E"
                      strokeWidth={2}
                      dot={{ fill: '#22C55E', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <h3 className="mb-4 text-lg font-semibold text-fg">Popular Webtoons</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={popularWebtoons} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                    <XAxis type="number" stroke={tickStroke} fontSize={12} />
                    <YAxis
                      dataKey="title.en"
                      type="category"
                      stroke={tickStroke}
                      fontSize={12}
                      width={100}
                      tickFormatter={(value) =>
                        value.length > 12 ? `${value.slice(0, 12)}...` : value
                      }
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: `1px solid ${gridStroke}`,
                        borderRadius: '8px',
                      }}
                      formatter={(value: number) => [formatNumber(value), 'Views']}
                    />
                    <Bar dataKey="views" fill="#0E9494" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card>
              <h3 className="mb-4 text-lg font-semibold text-fg">Top Revenue Webtoons</h3>
              <div className="space-y-4">
                {popularWebtoons.map((webtoon, index) => (
                  <div
                    key={webtoon.id}
                    className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-100 text-sm font-medium text-primary-700">
                        {index + 1}
                      </span>
                      <span className="font-medium text-fg">{webtoon.title.en}</span>
                    </div>
                    <span className="font-semibold text-fg">{formatCurrency(webtoon.revenue)}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}
    </>
  );
};

export default DashboardPage;
