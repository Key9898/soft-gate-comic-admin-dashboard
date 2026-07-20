import { useState } from 'react';
import {
  Bell,
  X,
  Check,
  CheckCheck,
  AlertTriangle,
  Info,
  DollarSign,
  FileText,
  Settings,
  Trash2,
} from 'lucide-react';
import { Card, Button, Modal, PageSEO } from '../../components';

import type { Notification } from '../../types';

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'report',
    title: { en: 'New Report Submitted', mm: 'အစီရင်ခံစာသစ် တင်သွင်းပြီး' },
    message: {
      en: 'A user has reported inappropriate content in "Fantasy World" Episode 15',
      mm: 'အသုံးပြုသူတစ်ဦးမှ "Fantasy World" အပိုင်း ၁၅ တွင် မသင့်လျော်သော အကြောင်းအရာများကို အစီရင်ခံထားပါသည်',
    },
    isRead: false,
    createdAt: '2026-04-27 14:30',
    actionUrl: '/reports/1',
  },
  {
    id: '2',
    type: 'payment',
    title: { en: 'Payout Request', mm: 'ငွေထုတ်ယူရန် တောင်းဆိုချက်' },
    message: {
      en: 'Author "John Doe" has requested a payout of $150.00',
      mm: 'စာရေးသူ "John Doe" မှ ဒေါ်လာ ၁၅၀.၀၀ ထုတ်ယူရန် တောင်းဆိုထားပါသည်',
    },
    isRead: false,
    createdAt: '2026-04-27 12:00',
    actionUrl: '/revenue',
  },
  {
    id: '3',
    type: 'system',
    title: { en: 'System Maintenance', mm: 'စနစ် ပြုပြင်ထိန်းသိမ်းမှု' },
    message: {
      en: 'Scheduled maintenance will occur on April 30th from 2:00 AM to 4:00 AM UTC',
      mm: 'ဧပြီလ ၃၀ ရက်နေ့ နံနက် ၂:၀၀ မှ ၄:၀၀ အထိ စနစ်ပြုပြင်ထိန်းသိမ်းမှု ပြုလုပ်ပါမည်',
    },
    isRead: true,
    createdAt: '2026-04-26 18:00',
  },
  {
    id: '4',
    type: 'content',
    title: { en: 'New Webtoon Pending Review', mm: 'စစ်ဆေးရန် စောင့်ဆိုင်းနေသော ဝက်ဘ်တွန်းအသစ်' },
    message: {
      en: 'A new webtoon "Mystery Tales" is waiting for approval',
      mm: '"Mystery Tales" ဝက်ဘ်တွန်းအသစ်အား အတည်ပြုရန် စောင့်ဆိုင်းနေပါသည်',
    },
    isRead: false,
    createdAt: '2026-04-26 15:30',
    actionUrl: '/webtoons',
  },
  {
    id: '5',
    type: 'report',
    title: { en: 'Report Resolved', mm: 'အစီရင်ခံစာ ဖြေရှင်းပြီး' },
    message: {
      en: 'The report on "Adventure Quest" has been resolved',
      mm: '"Adventure Quest" နှင့် ပတ်သက်သော အစီရင်ခံစာကို ဖြေရှင်းပြီးပါပြီ',
    },
    isRead: true,
    createdAt: '2026-04-25 10:00',
  },
  {
    id: '6',
    type: 'payment',
    title: { en: 'Payment Processed', mm: 'ငွေပေးချေမှု လုပ်ဆောင်ပြီး' },
    message: {
      en: 'Monthly payout of $2,500.00 has been processed successfully',
      mm: 'လစဉ် ဒေါ်လာ ၂,၅၀၀.၀၀ ပေးချေမှုကို အောင်မြင်စွာ လုပ်ဆောင်ပြီးပါပြီ',
    },
    isRead: true,
    createdAt: '2026-04-24 09:00',
  },
  {
    id: '7',
    type: 'system',
    title: { en: 'New Admin Account', mm: 'အက်ဒမင်အကောင့်အသစ်' },
    message: {
      en: 'A new admin account has been created for "admin@example.com"',
      mm: '"admin@example.com" အတွက် အက်ဒမင်အကောင့်အသစ် ဖန်တီးပြီးပါပြီ',
    },
    isRead: true,
    createdAt: '2026-04-23 14:00',
  },
  {
    id: '8',
    type: 'content',
    title: { en: 'Episode Published', mm: 'အပိုင်း အသစ်တင်ပြီး' },
    message: {
      en: 'Episode 20 of "Romance Story" has been automatically published',
      mm: '"Romance Story" အပိုင်း ၂၀ ကို အလိုအလျောက် တင်ပြီးပါပြီ',
    },
    isRead: true,
    createdAt: '2026-04-22 08:00',
  },
];

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const filteredNotifications = notifications.filter((n) => {
    const matchesRead = filter === 'all' || !n.isRead;
    const matchesType = typeFilter === 'all' || n.type === typeFilter;
    return matchesRead && matchesType;
  });

  const getTypeIcon = (type: Notification['type']) => {
    switch (type) {
      case 'system':
        return <Settings className="h-5 w-5 text-blue-500" />;
      case 'report':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case 'payment':
        return <DollarSign className="h-5 w-5 text-green-500" />;
      case 'content':
        return <FileText className="h-5 w-5 text-burst-600" />;
      default:
        return <Info className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTypeBadge = (type: Notification['type']) => {
    const styles: Record<string, string> = {
      system: 'bg-blue-100 text-blue-700',
      report: 'bg-orange-100 text-orange-700',
      payment: 'bg-green-100 text-green-700',
      content: 'bg-burst-100 text-burst-700',
    };
    return styles[type] || 'bg-gray-100 text-gray-700';
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const deleteSelected = () => {
    setNotifications((prev) => prev.filter((n) => !selectedNotifications.includes(n.id)));
    setSelectedNotifications([]);
    setIsDeleteModalOpen(false);
  };

  const toggleSelect = (id: string) => {
    setSelectedNotifications((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const selectAll = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications.map((n) => n.id));
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return dateStr;
  };

  return (
    <>
      <PageSEO.Notifications />
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            <p className="mt-1 text-gray-500">
              {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
            </p>
          </div>
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button variant="outline" onClick={markAllAsRead}>
                <CheckCheck className="mr-2 h-4 w-4" />
                Mark All Read
              </Button>
            )}
            {selectedNotifications.length > 0 && (
              <Button variant="danger" onClick={() => setIsDeleteModalOpen(true)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete ({selectedNotifications.length})
              </Button>
            )}
          </div>
        </div>

        <Card>
          <div className="border-b border-gray-200 p-4">
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <div className="flex gap-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                    filter === 'all'
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter('unread')}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                    filter === 'unread'
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Unread {unreadCount > 0 && `(${unreadCount})`}
                </button>
              </div>
              <select
                aria-label="Filter by type"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="all">All Types</option>
                <option value="system">System</option>
                <option value="report">Reports</option>
                <option value="payment">Payments</option>
                <option value="content">Content</option>
              </select>
            </div>
          </div>

          {filteredNotifications.length > 0 && (
            <div className="border-b border-gray-100 bg-gray-50 p-3">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={selectedNotifications.length === filteredNotifications.length}
                  onChange={selectAll}
                  className="h-4 w-4 rounded border-gray-300"
                />
                Select all
              </label>
            </div>
          )}

          <div className="divide-y divide-gray-100">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 transition-colors hover:bg-gray-50 ${
                  !notification.isRead ? 'bg-blue-50/50' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  <input
                    type="checkbox"
                    aria-label={`Select notification: ${notification.title.en}`}
                    checked={selectedNotifications.includes(notification.id)}
                    onChange={() => toggleSelect(notification.id)}
                    className="mt-1 h-4 w-4 rounded border-gray-300"
                  />
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gray-100">
                    {getTypeIcon(notification.type)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3
                            className={`font-medium ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}
                          >
                            {notification.title.en}
                          </h3>
                          {!notification.isRead && (
                            <span className="h-2 w-2 rounded-full bg-burst-600" />
                          )}
                        </div>
                        <p className="mt-1 text-sm text-gray-600">{notification.message.en}</p>
                        <div className="mt-2 flex items-center gap-3">
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs ${getTypeBadge(notification.type)}`}
                          >
                            {notification.type}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatTime(notification.createdAt)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {!notification.isRead && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                            title="Mark as read"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
                          title="Delete"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    {notification.actionUrl && (
                      <a
                        href={notification.actionUrl}
                        className="mt-2 inline-block text-sm text-primary-600 hover:text-primary-700"
                      >
                        View details →
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredNotifications.length === 0 && (
            <div className="py-12 text-center">
              <Bell className="mx-auto mb-4 h-12 w-12 text-gray-300" />
              <p className="text-gray-500">No notifications found</p>
            </div>
          )}
        </Card>

        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title="Delete Notifications"
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              Are you sure you want to delete {selectedNotifications.length} notification(s)? This
              action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={deleteSelected}>
                Delete
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </>
  );
};

export default NotificationsPage;
