import { useState } from 'react';
import {
  Search,
  Download,
  User,
  BookOpen,
  PenTool,
  LayoutGrid,
  Coins,
  FileText,
  MessageSquare,
  Settings,
  LogIn,
  LogOut,
  UserPlus,
} from 'lucide-react';
import { Card, Button, Input, PageSEO, EmptyState } from '../../components';
import { useData } from '@/lib/DataContext';
import ActivityLogPageSkeleton from './components/ActivityLogPageSkeleton';

const ActivityLogPage = () => {
  const { activityLogs: logs, isLoading } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterAction, setFilterAction] = useState('all');

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.adminName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.targetName?.en.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
      (log.details?.en.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    const matchesType = filterType === 'all' || log.targetType === filterType;
    const matchesAction = filterAction === 'all' || log.action === filterAction;
    return matchesSearch && matchesType && matchesAction;
  });

  const exportToCSV = () => {
    const headers = ['Date', 'Action', 'Type', 'Target', 'Admin', 'Details'];
    const rows = filteredLogs.map((log) => [
      new Date(log.createdAt).toLocaleString(),
      log.action,
      log.targetType,
      log.targetName?.en || '-',
      log.adminName,
      log.details?.en || '-',
    ]);
    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `activity-log-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const getActionIcon = (action: string, type: string) => {
    if (type === 'auth') {
      return action === 'login' ? (
        <LogIn className="h-4 w-4 text-green-500" />
      ) : (
        <LogOut className="h-4 w-4 text-red-500" />
      );
    }
    const icons: Record<string, React.ReactNode> = {
      webtoon: <BookOpen className="h-4 w-4 text-primary-500" />,
      author: <PenTool className="h-4 w-4 text-primary-500" />,
      genre: <LayoutGrid className="h-4 w-4 text-primary-500" />,
      'coin-package': <Coins className="h-4 w-4 text-primary-500" />,
      episode: <FileText className="h-4 w-4 text-blue-500" />,
      user: <User className="h-4 w-4 text-orange-500" />,
      comment: <MessageSquare className="h-4 w-4 text-green-500" />,
      settings: <Settings className="h-4 w-4 text-fg-muted" />,
      staff: <UserPlus className="h-4 w-4 text-primary-500" />,
    };
    return icons[type] || null;
  };

  const getActionBadge = (action: string) => {
    const styles: Record<string, string> = {
      create: 'bg-green-100 text-green-800',
      update: 'bg-blue-100 text-blue-800',
      delete: 'bg-red-100 text-red-800',
      ban: 'bg-red-100 text-red-800',
      unban: 'bg-green-100 text-green-800',
      suspend: 'bg-yellow-100 text-yellow-800',
      activate: 'bg-green-100 text-green-800',
      login: 'bg-blue-100 text-blue-800',
      logout: 'bg-gray-100 text-fg-secondary',
    };
    return (
      <span
        className={`rounded-full px-2 py-1 text-xs font-medium ${styles[action] || 'bg-gray-100 text-fg-secondary'}`}
      >
        {action.charAt(0).toUpperCase() + action.slice(1)}
      </span>
    );
  };

  return (
    <>
      <PageSEO.ActivityLog />
      {isLoading ? (
        <ActivityLogPageSkeleton />
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-fg">Activity Log</h1>
            <Button variant="outline" onClick={exportToCSV}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>

          <Card className="p-4">
            <div className="mb-4 flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-muted" />
                <Input
                  placeholder="Search activities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                aria-label="Filter by type"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="rounded-lg border border-line-strong px-4 py-2"
              >
                <option value="all">All Types</option>
                <option value="webtoon">Webtoons</option>
                <option value="author">Authors</option>
                <option value="genre">Genres</option>
                <option value="coin-package">Coin packages</option>
                <option value="episode">Episodes</option>
                <option value="user">Users</option>
                <option value="comment">Comments</option>
                <option value="settings">Settings</option>
                <option value="auth">Auth</option>
                <option value="staff">Staff</option>
              </select>
              <select
                aria-label="Filter by action"
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
                className="rounded-lg border border-line-strong px-4 py-2"
              >
                <option value="all">All Actions</option>
                <option value="create">Create</option>
                <option value="update">Update</option>
                <option value="delete">Delete</option>
                <option value="ban">Ban</option>
                <option value="login">Login</option>
                <option value="logout">Logout</option>
              </select>
            </div>

            <div className="space-y-2">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center gap-4 rounded-lg bg-gray-50 p-4 hover:bg-gray-100"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white">
                    {getActionIcon(log.action, log.targetType)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-fg">{log.adminName}</span>
                      {getActionBadge(log.action)}
                      <span className="text-sm text-fg-muted">
                        {log.targetType}
                        {log.targetName && `: ${log.targetName.en}`}
                      </span>
                    </div>
                    {log.details && <p className="mt-1 text-sm text-fg-muted">{log.details.en}</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-fg-muted">
                      {new Date(log.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-fg-muted">
                      {new Date(log.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {logs.length === 0 ? (
              <EmptyState
                title="No activity yet"
                description="Admin actions will appear in this log."
              />
            ) : filteredLogs.length === 0 ? (
              <EmptyState
                title="No activity logs found"
                description="Try a different search or filter."
                action={{
                  label: 'Clear Filters',
                  onClick: () => {
                    setSearchQuery('');
                    setFilterType('all');
                    setFilterAction('all');
                  },
                }}
              />
            ) : null}
          </Card>
        </div>
      )}
    </>
  );
};

export default ActivityLogPage;
