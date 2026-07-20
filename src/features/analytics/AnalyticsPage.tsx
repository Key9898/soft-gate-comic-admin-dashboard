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
  const { revenueData, userGrowthData, popularWebtoons, genres } = useData();
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

  const genreData = genres.map((genre) => ({
    name: genre.name.en,
    value: genre.webtoonCount,
  }));

  const totalRevenue = revenueData.reduce((sum, item) => sum + item.revenue, 0);

  return (
    <>
      <PageSEO.Analytics />
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
            <p className="mt-1 text-gray-500">Platform performance insights</p>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-gray-400" />
            <div className="flex overflow-hidden rounded-lg border border-gray-300">
              {(['7d', '30d', '90d'] as const).map((range) => (
                <button
                  key={range}
                  type="button"
                  onClick={() => setDateRange(range)}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    dateRange === range
                      ? 'bg-primary-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
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
                <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {formatCurrency(totalRevenue)}
                </p>
                <p className="mt-1 text-sm text-green-600">+12.5% from last period</p>
              </div>
              <div className="rounded-lg bg-green-50 p-3 text-green-600">
                <DollarSign className="h-6 w-6" />
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Views</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">4.57M</p>
                <p className="mt-1 text-sm text-green-600">+8.3% from last period</p>
              </div>
              <div className="rounded-lg bg-blue-50 p-3 text-blue-600">
                <Eye className="h-6 w-6" />
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Active Users</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">8,934</p>
                <p className="mt-1 text-sm text-green-600">+5.2% from last period</p>
              </div>
              <div className="rounded-lg bg-primary-50 p-3 text-primary-600">
                <Users className="h-6 w-6" />
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Growth Rate</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">23.5%</p>
                <p className="mt-1 text-sm text-green-600">+2.1% from last period</p>
              </div>
              <div className="rounded-lg bg-yellow-50 p-3 text-yellow-600">
                <TrendingUp className="h-6 w-6" />
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Revenue Trend</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorRevenueAnalytics" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0E9494" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#0E9494" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value: string) => value.split('-')[2]}
                    stroke="#9CA3AF"
                    fontSize={12}
                  />
                  <YAxis stroke="#9CA3AF" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #E5E7EB',
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
            <h3 className="mb-4 text-lg font-semibold text-gray-900">User Growth</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={userGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
                  <YAxis stroke="#9CA3AF" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #E5E7EB',
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
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Top Performing Webtoons</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={popularWebtoons}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis
                    dataKey="title.en"
                    stroke="#9CA3AF"
                    fontSize={12}
                    tickFormatter={(value: string) =>
                      value.length > 10 ? `${value.slice(0, 10)}...` : value
                    }
                  />
                  <YAxis stroke="#9CA3AF" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #E5E7EB',
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
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Genre Distribution</h3>
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
                      border: '1px solid #E5E7EB',
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
                  <span className="text-xs text-gray-600">{genre.name}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card>
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Revenue by Webtoon</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="table-header">Webtoon</th>
                  <th className="table-header">Views</th>
                  <th className="table-header">Likes</th>
                  <th className="table-header">Revenue</th>
                  <th className="table-header">Conversion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {popularWebtoons.map((webtoon, index) => (
                  <tr key={webtoon.id} className="hover:bg-gray-50">
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-100 text-sm font-medium text-primary-600">
                          {index + 1}
                        </span>
                        <span className="font-medium text-gray-900">{webtoon.title.en}</span>
                      </div>
                    </td>
                    <td className="table-cell">{formatNumber(webtoon.views)}</td>
                    <td className="table-cell">{formatNumber(webtoon.likes)}</td>
                    <td className="table-cell font-medium">{formatCurrency(webtoon.revenue)}</td>
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <ProgressBar value={webtoon.revenue} max={popularWebtoons[0].revenue} />
                        <span className="text-xs text-gray-500">
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
