import { useState } from 'react';
import { TrendingUp, Users, Eye, DollarSign, Calendar } from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card, ProgressBar, PageSEO } from '../../components';
import { useData } from '@/lib/DataContext';
import { readSgVar, useTheme } from '@/lib/theme';

const PIE_COLORS = [
  '#0E9494',
  '#22C55E',
  '#3B82F6',
  '#F59E0B',
  '#EF4444',
  '#E63264',
  '#FA326E',
  '#14B8A6',
];

const GENRE_COLORS = [
  'bg-primary-500',
  'bg-green-500',
  'bg-blue-500',
  'bg-amber-500',
  'bg-red-500',
  'bg-burst-600',
  'bg-burst-500',
  'bg-teal-500',
] as const;

const AnalyticsPage = () => {
  const { resolvedTheme } = useTheme();
  const gridStroke = readSgVar('--sg-border', '#d1d5db');
  const tickStroke = readSgVar('--sg-text-muted', '#4b5563');
  // Subscribe to theme so chart strokes refresh when preference changes.
  void resolvedTheme;
  const { revenueData, userGrowthData, popularWebtoons, genres, users, webtoons } = useData();
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d');

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

  const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  const parsePointDate = (value: string) => {
    const parsed = Date.parse(value.includes('T') ? value : value.replace(' ', 'T'));
    return Number.isNaN(parsed) ? Date.parse(value) : parsed;
  };
  const filteredRevenue = revenueData.filter((item) => parsePointDate(item.date) >= cutoff);
  const filteredGrowth = userGrowthData.filter((item) => parsePointDate(item.date) >= cutoff);
  const chartRevenue = filteredRevenue.length ? filteredRevenue : revenueData;
  const chartGrowth = filteredGrowth.length ? filteredGrowth : userGrowthData;

  const genreData = genres.map((genre) => ({
    name: genre.name.en,
    value: genre.webtoonCount,
  }));

  const totalRevenue = chartRevenue.reduce((sum, item) => sum + item.revenue, 0);
  const totalViews = webtoons.reduce((sum, item) => sum + (item.viewCount || 0), 0);
  const activeUsers = users.filter((u) => u.status === 'active').length;
  const growthRate =
    chartGrowth.length >= 2
      ? (
          ((chartGrowth[chartGrowth.length - 1].users - chartGrowth[0].users) /
            Math.max(chartGrowth[0].users, 1)) *
          100
        ).toFixed(1)
      : '0.0';

  return (
    <>
      <PageSEO.Analytics />
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-fg">Analytics</h1>
            <p className="mt-1 text-fg-muted">Platform performance insights</p>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-fg-muted" />
            <div className="flex overflow-hidden rounded-lg border border-line-strong">
              {(['7d', '30d', '90d'] as const).map((range) => (
                <button
                  key={range}
                  type="button"
                  onClick={() => setDateRange(range)}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    dateRange === range
                      ? 'bg-primary-600 text-white'
                      : 'bg-surface text-fg-secondary hover:bg-sg-hover'
                  }`}
                >
                  {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-fg-muted">Total Revenue</p>
                <p className="mt-1 text-2xl font-bold text-fg">{formatCurrency(totalRevenue)}</p>
                <p className="mt-1 text-sm text-fg-muted">In selected range</p>
              </div>
              <div className="rounded-lg bg-green-50 p-3 text-green-600">
                <DollarSign className="h-6 w-6" />
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-fg-muted">Total Views</p>
                <p className="mt-1 text-2xl font-bold text-fg">{formatNumber(totalViews)}</p>
                <p className="mt-1 text-sm text-fg-muted">Across webtoons</p>
              </div>
              <div className="rounded-lg bg-blue-50 p-3 text-blue-600">
                <Eye className="h-6 w-6" />
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-fg-muted">Active Users</p>
                <p className="mt-1 text-2xl font-bold text-fg">{formatNumber(activeUsers)}</p>
                <p className="mt-1 text-sm text-fg-muted">Current roster</p>
              </div>
              <div className="rounded-lg bg-primary-50 p-3 text-primary-600">
                <Users className="h-6 w-6" />
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-fg-muted">Growth Rate</p>
                <p className="mt-1 text-2xl font-bold text-fg">{growthRate}%</p>
                <p className="mt-1 text-sm text-fg-muted">In selected range</p>
              </div>
              <div className="rounded-lg bg-yellow-50 p-3 text-yellow-600">
                <TrendingUp className="h-6 w-6" />
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <h3 className="mb-4 text-lg font-semibold text-fg">Revenue Trend</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartRevenue}>
                  <defs>
                    <linearGradient id="colorRevenueAnalytics" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0E9494" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#0E9494" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value: string) => value.split('-')[2]}
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
                    fill="url(#colorRevenueAnalytics)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card>
            <h3 className="mb-4 text-lg font-semibold text-fg">User Growth</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartGrowth}>
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
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="users"
                    stroke="#0E9494"
                    strokeWidth={2}
                    dot={{ fill: '#0E9494', strokeWidth: 2 }}
                    name="Total Users"
                  />
                  <Line
                    type="monotone"
                    dataKey="activeUsers"
                    stroke="#22C55E"
                    strokeWidth={2}
                    dot={{ fill: '#22C55E', strokeWidth: 2 }}
                    name="Active Users"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <h3 className="mb-4 text-lg font-semibold text-fg">Top Performing Webtoons</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={popularWebtoons}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                  <XAxis
                    dataKey="title.en"
                    stroke={tickStroke}
                    fontSize={12}
                    tickFormatter={(value: string) =>
                      value.length > 10 ? `${value.slice(0, 10)}...` : value
                    }
                  />
                  <YAxis stroke={tickStroke} fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: `1px solid ${gridStroke}`,
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [formatNumber(value), 'Views']}
                  />
                  <Legend />
                  <Bar dataKey="views" fill="#0E9494" radius={[4, 4, 0, 0]} name="Views" />
                  <Bar dataKey="likes" fill="#22C55E" radius={[4, 4, 0, 0]} name="Likes" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card>
            <h3 className="mb-4 text-lg font-semibold text-fg">Genre Distribution</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={genreData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {genreData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: `1px solid ${gridStroke}`,
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [value, 'Webtoons']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {genreData.slice(0, 6).map((genre, index) => (
                <div key={genre.name} className="flex items-center gap-2">
                  <div
                    className={`h-3 w-3 rounded-full ${GENRE_COLORS[index % GENRE_COLORS.length]}`}
                  />
                  <span className="text-xs text-fg-secondary">{genre.name}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card>
          <h3 className="mb-4 text-lg font-semibold text-fg">Revenue by Webtoon</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-line">
                  <th className="table-header">Webtoon</th>
                  <th className="table-header">Views</th>
                  <th className="table-header">Likes</th>
                  <th className="table-header">Revenue</th>
                  <th className="table-header">Conversion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {popularWebtoons.map((webtoon, index) => (
                  <tr key={webtoon.id} className="hover:bg-gray-50">
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-100 text-sm font-medium text-primary-700">
                          {index + 1}
                        </span>
                        <span className="font-medium text-fg">{webtoon.title.en}</span>
                      </div>
                    </td>
                    <td className="table-cell">{formatNumber(webtoon.views)}</td>
                    <td className="table-cell">{formatNumber(webtoon.likes)}</td>
                    <td className="table-cell font-medium">{formatCurrency(webtoon.revenue)}</td>
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <ProgressBar value={webtoon.revenue} max={popularWebtoons[0].revenue} />
                        <span className="text-xs text-fg-muted">
                          {((webtoon.revenue / totalRevenue) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </>
  );
};

export default AnalyticsPage;
