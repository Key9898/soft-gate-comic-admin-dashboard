import { Users, BookOpen, FileText, Eye, TrendingUp, DollarSign, Activity } from 'lucide-react'
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
} from 'recharts'
import { Card, PageSEO } from '../../components'
import {
  mockDashboardStats,
  mockRevenueData,
  mockUserGrowthData,
  mockPopularWebtoons,
} from '../../demo'

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
}

const StatCard = ({ title, value, icon, change, changeType = 'neutral' }: StatCardProps) => {
  const changeColors = {
    positive: 'text-green-600',
    negative: 'text-red-600',
    neutral: 'text-gray-500',
  }

  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {change && <p className={`text-sm mt-1 ${changeColors[changeType]}`}>{change}</p>}
        </div>
        <div className="p-3 rounded-lg bg-primary-50 text-primary-600">{icon}</div>
      </div>
    </Card>
  )
}

const DashboardPage = () => {
  const stats = mockDashboardStats

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`
    }
    return num.toString()
  }

  const formatCurrency = (num: number) => {
    return `$${num.toLocaleString()}`
  }

  return (
    <>
      <PageSEO.Dashboard />
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back! Here's what's happening today.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Users"
            value={formatNumber(stats.totalUsers)}
            icon={<Users className="w-6 h-6" />}
            change={`+${stats.newUsersToday} today`}
            changeType="positive"
          />
          <StatCard
            title="Total Webtoons"
            value={stats.totalWebtoons}
            icon={<BookOpen className="w-6 h-6" />}
          />
          <StatCard
            title="Total Episodes"
            value={formatNumber(stats.totalEpisodes)}
            icon={<FileText className="w-6 h-6" />}
            change={`+${stats.newEpisodesToday} today`}
            changeType="positive"
          />
          <StatCard
            title="Total Views"
            value={formatNumber(stats.totalViews)}
            icon={<Eye className="w-6 h-6" />}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <StatCard
            title="Total Revenue"
            value={formatCurrency(stats.totalRevenue)}
            icon={<DollarSign className="w-6 h-6" />}
            change="+12.5% from last month"
            changeType="positive"
          />
          <StatCard
            title="Active Users Today"
            value={formatNumber(stats.activeUsersToday)}
            icon={<Activity className="w-6 h-6" />}
            change="+8.3% from yesterday"
            changeType="positive"
          />
          <StatCard
            title="Growth Rate"
            value="23.5%"
            icon={<TrendingUp className="w-6 h-6" />}
            change="+2.1% from last week"
            changeType="positive"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Overview</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockRevenueData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#9333EA" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#9333EA" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) => value.split('-')[2]}
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
                    stroke="#9333EA"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">User Growth</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockUserGrowthData}>
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
                  <Line
                    type="monotone"
                    dataKey="users"
                    stroke="#9333EA"
                    strokeWidth={2}
                    dot={{ fill: '#9333EA', strokeWidth: 2 }}
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Webtoons</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockPopularWebtoons} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis type="number" stroke="#9CA3AF" fontSize={12} />
                  <YAxis
                    dataKey="title.en"
                    type="category"
                    stroke="#9CA3AF"
                    fontSize={12}
                    width={100}
                    tickFormatter={(value) =>
                      value.length > 12 ? `${value.slice(0, 12)}...` : value
                    }
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [formatNumber(value), 'Views']}
                  />
                  <Bar dataKey="views" fill="#9333EA" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Revenue Webtoons</h3>
            <div className="space-y-4">
              {mockPopularWebtoons.map((webtoon, index) => (
                <div
                  key={webtoon.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-600 text-sm font-medium flex items-center justify-center">
                      {index + 1}
                    </span>
                    <span className="font-medium text-gray-900">{webtoon.title.en}</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(webtoon.revenue)}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </>
  )
}

export default DashboardPage
