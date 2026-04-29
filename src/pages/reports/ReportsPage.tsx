import { useState } from 'react'
import { Search, Eye, CheckCircle, XCircle, Flag } from 'lucide-react'
import { Card, Button, Input, Modal, PageSEO } from '../../components'
import { useToast } from '../../components/Toast/Toast'
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog'

import type { Report } from '../../types'

const mockReports: Report[] = [
  {
    id: '1',
    type: 'comment',
    targetId: 'c1',
    targetName: { en: 'Comment on Episode 5', mm: 'အပိုင်း ၅ မှ မှတ်ချက်' },
    reason: 'inappropriate',
    description: { en: 'This comment contains offensive language.', mm: 'ဤမှတ်ချက်တွင် မသင့်လျော်သော စကားလုံးများ ပါဝင်နေသည်။' },
    status: 'pending',
    priority: 'high',
    reporterId: 'u1',
    reporterName: 'user123',
    createdAt: '2026-04-27T10:30:00',
  },
  {
    id: '2',
    type: 'webtoon',
    targetId: 'w1',
    targetName: { en: 'Shadow Knight', mm: 'အရိပ်သူရဲကောင်း' },
    reason: 'copyright',
    description: { en: 'This webtoon appears to be a copy of another work.', mm: 'ဤဝက်ဘ်တွန်းသည် အခြားလက်ရာတစ်ခုအား ကူးယူထားခြင်းဖြစ်ပုံရသည်။' },
    status: 'pending',
    priority: 'high',
    reporterId: 'u2',
    reporterName: 'author456',
    createdAt: '2026-04-26T15:45:00',
  },
  {
    id: '3',
    type: 'user',
    targetId: 'u3',
    targetName: { en: 'spammer_account', mm: 'စပမ်းအကောင့်' },
    reason: 'spam',
    description: { en: 'This user is posting spam comments.', mm: 'ဤအသုံးပြုသူသည် စပမ်းမှတ်ချက်များကို ပိုစ့်တင်နေသည်။' },
    status: 'reviewed',
    priority: 'medium',
    reporterId: 'u4',
    reporterName: 'reader789',
    createdAt: '2026-04-25T09:00:00',
  },
]

const ReportsPage = () => {
  const { addToast } = useToast()
  const [reports, setReports] = useState<Report[]>(mockReports)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [actionDialog, setActionDialog] = useState<{
    isOpen: boolean
    action: string
    reportId: string
  }>({
    isOpen: false,
    action: '',
    reportId: '',
  })

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.targetName.en.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.description.en.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = filterType === 'all' || report.type === filterType
    const matchesStatus = filterStatus === 'all' || report.status === filterStatus
    return matchesSearch && matchesType && matchesStatus
  })

  const handleAction = () => {
    setReports((prev) =>
      prev.map((r) =>
        r.id === actionDialog.reportId
          ? { ...r, status: actionDialog.action === 'resolve' ? 'resolved' : 'dismissed' }
          : r
      )
    )
    addToast(`Report ${actionDialog.action}d successfully`, 'success')
    setActionDialog({ isOpen: false, action: '', reportId: '' })
    setSelectedReport(null)
  }

  const getStatusBadge = (status: Report['status']) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-700',
      reviewed: 'bg-blue-100 text-blue-700',
      resolved: 'bg-green-100 text-green-700',
      dismissed: 'bg-gray-100 text-gray-700',
    }
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  const getPriorityBadge = (priority: Report['priority']) => {
    const styles = {
      high: 'bg-red-100 text-red-700',
      medium: 'bg-yellow-100 text-yellow-700',
      low: 'bg-gray-100 text-gray-700',
    }
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[priority]}`}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </span>
    )
  }

  const getTypeIcon = (type: Report['type']) => {
    const icons = {
      webtoon: '📚',
      episode: '📄',
      comment: '💬',
      user: '👤',
    }
    return icons[type]
  }

  return (
    <>
      <PageSEO.Reports />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">
              {reports.filter((r) => r.status === 'pending').length} pending
            </span>
          </div>
        </div>

        <Card className="p-4">
          <div className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
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
              className="px-4 py-2 border rounded-lg"
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
              className="px-4 py-2 border rounded-lg"
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
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Type</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Target</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Reason</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                    Priority
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                    Reported By
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.map((report) => (
                  <tr key={report.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <span className="text-lg">{getTypeIcon(report.type)}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-gray-900">{report.targetName.en}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="capitalize text-sm">{report.reason}</span>
                    </td>
                    <td className="py-3 px-4">{getPriorityBadge(report.priority)}</td>
                    <td className="py-3 px-4">{getStatusBadge(report.status)}</td>
                    <td className="table-cell text-sm text-gray-600">
                      {report.reporterName}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" onClick={() => setSelectedReport(report)}>
                          <Eye className="w-4 h-4" />
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
                              <CheckCircle className="w-4 h-4 text-green-500" />
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
                              <XCircle className="w-4 h-4 text-red-500" />
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
            <div className="text-center py-12 text-gray-500">
              <Flag className="w-12 h-12 mx-auto mb-4 text-gray-300" />
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
                  <label className="text-sm text-gray-500">Type</label>
                  <p className="font-medium capitalize">{selectedReport.type}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Target</label>
                  <p className="font-medium">{selectedReport.targetName.en}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Reason</label>
                  <p className="font-medium capitalize">{selectedReport.reason}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Priority</label>
                  <p>{getPriorityBadge(selectedReport.priority)}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Status</label>
                  <p>{getStatusBadge(selectedReport.status)}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Reported By</label>
                  <p className="font-medium">{selectedReport.reporterName}</p>
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-500">Description</label>
                <p className="mt-1 text-gray-700">{selectedReport.description.en}</p>
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
                    <CheckCircle className="w-4 h-4 mr-2" />
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
                    <XCircle className="w-4 h-4 mr-2" />
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
  )
}

export default ReportsPage
