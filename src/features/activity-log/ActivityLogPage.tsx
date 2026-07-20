import { useState } from 'react';
import {
  Search,
  Download,
  User,
  BookOpen,
  FileText,
  MessageSquare,
  Settings,
  LogIn,
  LogOut,
} from 'lucide-react';
import { Card, Button, Input, PageSEO } from '../../components';

import type { ActivityLog } from '../../types';

const mockActivityLogs: ActivityLog[] = [
  {
    id: '1',
    adminId: 'a1',
    adminName: 'Admin User',
    action: 'create',
    targetType: 'webtoon',
    targetId: 'w1',
    targetName: { en: 'Shadow Knight', mm: 'အရိပ်သူရဲကောင်း' },
    details: { en: 'Created new webtoon', mm: 'ဝက်ဘ်တွန်းအသစ် ဖန်တီးခဲ့သည်' },
    createdAt: '2026-04-27T10:30:00',
  },
  {
    id: '2',
    adminId: 'a1',
    adminName: 'Admin User',
    action: 'update',
    targetType: 'episode',
    targetId: 'e1',
    targetName: { en: 'Episode 5', mm: 'အပိုင်း ၅' },
    details: { en: 'Updated episode content', mm: 'အပိုင်းအကြောင်းအရာကို အပ်ဒိတ်လုပ်ခဲ့သည်' },
    createdAt: '2026-04-27T09:15:00',
  },
  {
    id: '3',
    adminId: 'a2',
    adminName: 'Super Admin',
    action: 'ban',
    targetType: 'user',
    targetId: 'u1',
    targetName: { en: 'spammer123', mm: 'စပမ်းမာ ၁၂၃' },
    details: {
      en: 'Banned user for spam',
      mm: 'စပမ်းပို့ခြင်းကြောင့် အသုံးပြုသူအား ပိတ်ပင်ခဲ့သည်',
    },
    createdAt: '2026-04-26T16:45:00',
  },
  {
    id: '4',
    adminId: 'a1',
    adminName: 'Admin User',
    action: 'delete',
    targetType: 'comment',
    targetId: 'c1',
    targetName: { en: 'Comment on Episode 3', mm: 'အပိုင်း ၃ မှ မှတ်ချက်' },
    details: { en: 'Deleted inappropriate comment', mm: 'မသင့်လျော်သော မှတ်ချက်ကို ဖျက်ခဲ့သည်' },
    createdAt: '2026-04-26T14:00:00',
  },
  {
    id: '5',
    adminId: 'a1',
    adminName: 'Admin User',
    action: 'login',
    targetType: 'auth',
    targetId: 'auth',
    targetName: { en: 'Authentication', mm: 'အကောင့်ဝင်ခြင်း' },
    details: { en: 'User logged in', mm: 'အသုံးပြုသူ အကောင့်ဝင်ခဲ့သည်' },
    createdAt: '2026-04-26T08:00:00',
  },
  {
    id: '6',
    adminId: 'a2',
    adminName: 'Super Admin',
    action: 'update',
    targetType: 'settings',
    targetId: 'settings',
    targetName: { en: 'Site Settings', mm: 'ဆိုဒ်ဆက်တင်များ' },
    details: { en: 'Updated site settings', mm: 'ဆိုဒ်ဆက်တင်များကို အပ်ဒိတ်လုပ်ခဲ့သည်' },
    createdAt: '2026-04-25T11:30:00',
  },
];

const ActivityLogPage = () => {
  const [logs] = useState<ActivityLog[]>(mockActivityLogs);
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
      episode: <FileText className="h-4 w-4 text-blue-500" />,
      user: <User className="h-4 w-4 text-orange-500" />,
      comment: <MessageSquare className="h-4 w-4 text-green-500" />,
      settings: <Settings className="h-4 w-4 text-gray-500" />,
    };
    return icons[type] || null;
  };

  const getActionBadge = (action: string) => {
    const styles: Record<string, string> = {
      create: 'bg-green-100 text-green-700',
      update: 'bg-blue-100 text-blue-700',
      delete: 'bg-red-100 text-red-700',
      ban: 'bg-red-100 text-red-700',
      unban: 'bg-green-100 text-green-700',
      suspend: 'bg-yellow-100 text-yellow-700',
      activate: 'bg-green-100 text-green-700',
      login: 'bg-blue-100 text-blue-700',
      logout: 'bg-gray-100 text-gray-700',
    };
    return (
      <span
        className={`rounded-full px-2 py-1 text-xs font-medium ${styles[action] || 'bg-gray-100 text-gray-700'}`}
      >
        {action.charAt(0).toUpperCase() + action.slice(1)}
      </span>
    );
  };

  return (
    <>
      <PageSEO.ActivityLog />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Activity Log</h1>
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>

        <Card className="p-4">
          <div className="mb-4 flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
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
              className="rounded-lg border px-4 py-2"
            >
              <option value="all">All Types</option>
              <option value="webtoon">Webtoons</option>
              <option value="episode">Episodes</option>
              <option value="user">Users</option>
              <option value="comment">Comments</option>
              <option value="settings">Settings</option>
              <option value="auth">Auth</option>
            </select>
            <select
              aria-label="Filter by action"
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="rounded-lg border px-4 py-2"
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
                    <span className="font-medium text-gray-900">{log.adminName}</span>
                    {getActionBadge(log.action)}
                    <span className="text-sm text-gray-500">
                      {log.targetType}
                      {log.targetName && `: ${log.targetName.en}`}
                    </span>
                  </div>
                  {log.details && <p className="mt-1 text-sm text-gray-500">{log.details.en}</p>}
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">
                    {new Date(log.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(log.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {filteredLogs.length === 0 && (
            <div className="py-12 text-center text-gray-500">
              <p>No activity logs found</p>
            </div>
          )}
        </Card>
      </div>
    </>
  );
};

export default ActivityLogPage;
