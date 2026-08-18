import { useState } from 'react';
import { Search, Eye, CheckCircle, XCircle, Flag } from 'lucide-react';
import { Card, Button, Input, Modal, PageSEO } from '../../components';
import { useToast } from '../../components/Toast/Toast';
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog';
import { useAuth } from '@/features/auth/useAuth';
import { appendActivityLog } from '@/lib/activityLog';
import { useData } from '@/lib/DataContext';

import type { Report } from '../../types';

const ReportsPage = () => {
  const { user } = useAuth();
  const { reports, setReports, setActivityLogs } = useData();
  const { addToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [actionDialog, setActionDialog] = useState<{
    isOpen: boolean;
    action: 'resolve' | 'dismiss' | '';
    reportId: string;
  }>({
    isOpen: false,
    action: '',
    reportId: '',
  });

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.targetName.en.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.description.en.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || report.type === filterType;
    const matchesStatus = filterStatus === 'all' || report.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleAction = () => {
    const report = reports.find((item) => item.id === actionDialog.reportId);
    if (!report) return;
    const nextStatus = actionDialog.action === 'resolve' ? 'resolved' : 'dismissed';
    setReports((prev) =>
      prev.map((item) =>
        item.id === actionDialog.reportId ? { ...item, status: nextStatus } : item,
      ),
    );
    appendActivityLog(setActivityLogs, {
      action: 'update',
      targetType: 'report',
      targetId: report.id,
      targetName: report.targetName,
      details: `Report ${nextStatus}`,
      admin: user,
    });
    addToast(`Report ${nextStatus} successfully`, 'success');
    setActionDialog({ isOpen: false, action: '', reportId: '' });
    setSelectedReport(null);
  };

  const getStatusBadge = (status: Report['status']) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      reviewed: 'bg-blue-100 text-blue-800',
      resolved: 'bg-green-100 text-green-800',
      dismissed: 'bg-gray-100 text-fg-secondary',
    };
    return (
      <span className={`rounded-full px-2 py-1 text-xs font-medium ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getPriorityBadge = (priority: Report['priority']) => {
    const styles = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-gray-100 text-fg-secondary',
    };
    return (
      <span className={`rounded-full px-2 py-1 text-xs font-medium ${styles[priority]}`}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </span>
    );
  };

  const getTypeIcon = (type: Report['type']) => {
    const icons = {
      webtoon: '📚',
      episode: '📄',
      comment: '💬',
      user: '👤',
    };
    return icons[type];
  };

  return (
    <>
      <PageSEO.Reports />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-fg">Reports</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-fg-muted">
              {reports.filter((r) => r.status === 'pending').length} pending
            </span>
          </div>
        </div>

        <Card className="p-4">
          <div className="mb-4 flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-muted" />
              <Input
                placeholder="Search reports..."
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
              <option value="episode">Episodes</option>
              <option value="comment">Comments</option>
              <option value="user">Users</option>
            </select>
            <select
              aria-label="Filter by status"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-lg border border-line-strong px-4 py-2"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="reviewed">Reviewed</option>
              <option value="resolved">Resolved</option>
              <option value="dismissed">Dismissed</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-3 text-left text-sm font-medium text-fg-muted">Type</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-fg-muted">Target</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-fg-muted">Reason</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-fg-muted">
                    Priority
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-fg-muted">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-fg-muted">
                    Reported By
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-fg-muted">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-fg-muted">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.map((report) => (
                  <tr key={report.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className="text-lg">{getTypeIcon(report.type)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-fg">{report.targetName.en}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm capitalize">{report.reason}</span>
                    </td>
                    <td className="px-4 py-3">{getPriorityBadge(report.priority)}</td>
                    <td className="px-4 py-3">{getStatusBadge(report.status)}</td>
                    <td className="table-cell text-sm text-fg-secondary">{report.reporterName}</td>
                    <td className="px-4 py-3 text-sm text-fg-muted">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" onClick={() => setSelectedReport(report)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        {report.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                setActionDialog({
                                  isOpen: true,
                                  action: 'resolve',
                                  reportId: report.id,
                                })
                              }
                            >
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                setActionDialog({
                                  isOpen: true,
                                  action: 'dismiss',
                                  reportId: report.id,
                                })
                              }
                            >
                              <XCircle className="h-4 w-4 text-red-500" />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredReports.length === 0 && (
            <div className="py-12 text-center text-fg-muted">
              <Flag className="mx-auto mb-4 h-12 w-12 text-fg-muted" />
              <p>No reports found</p>
            </div>
          )}
        </Card>

        <Modal
          isOpen={!!selectedReport}
          onClose={() => setSelectedReport(null)}
          title="Report Details"
          size="lg"
        >
          {selectedReport && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-fg-muted">Type</label>
                  <p className="font-medium capitalize">{selectedReport.type}</p>
                </div>
                <div>
                  <label className="text-sm text-fg-muted">Target</label>
                  <p className="font-medium">{selectedReport.targetName.en}</p>
                </div>
                <div>
                  <label className="text-sm text-fg-muted">Reason</label>
                  <p className="font-medium capitalize">{selectedReport.reason}</p>
                </div>
                <div>
                  <label className="text-sm text-fg-muted">Priority</label>
                  <p>{getPriorityBadge(selectedReport.priority)}</p>
                </div>
                <div>
                  <label className="text-sm text-fg-muted">Status</label>
                  <p>{getStatusBadge(selectedReport.status)}</p>
                </div>
                <div>
                  <label className="text-sm text-fg-muted">Reported By</label>
                  <p className="font-medium">{selectedReport.reporterName}</p>
                </div>
              </div>
              <div>
                <label className="text-sm text-fg-muted">Description</label>
                <p className="mt-1 text-fg-secondary">{selectedReport.description.en}</p>
              </div>
              {selectedReport.status === 'pending' && (
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={() =>
                      setActionDialog({
                        isOpen: true,
                        action: 'resolve',
                        reportId: selectedReport.id,
                      })
                    }
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Resolve
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() =>
                      setActionDialog({
                        isOpen: true,
                        action: 'dismiss',
                        reportId: selectedReport.id,
                      })
                    }
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Dismiss
                  </Button>
                </div>
              )}
            </div>
          )}
        </Modal>

        <ConfirmDialog
          isOpen={actionDialog.isOpen}
          title={`${actionDialog.action === 'resolve' ? 'Resolve' : 'Dismiss'} Report`}
          message={`Are you sure you want to ${actionDialog.action} this report?`}
          confirmText={actionDialog.action === 'resolve' ? 'Resolve' : 'Dismiss'}
          variant={actionDialog.action === 'resolve' ? 'info' : 'warning'}
          onConfirm={handleAction}
          onCancel={() => setActionDialog({ isOpen: false, action: '', reportId: '' })}
        />
      </div>
    </>
  );
};

export default ReportsPage;
