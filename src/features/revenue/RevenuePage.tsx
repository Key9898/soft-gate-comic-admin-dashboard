import { useState } from 'react';
import {
  DollarSign,
  Coins,
  CreditCard,
  Download,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  MoreVertical,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';
import { Card, Button, Input, Modal, PageSEO } from '../../components';
import { useAuth } from '@/features/auth/useAuth';
import { appendActivityLog } from '@/lib/activityLog';
import { useData } from '@/lib/DataContext';

import type { Transaction } from '../../types';

const RevenuePage = () => {
  const { user: admin } = useAuth();
  const { transactions, setTransactions, setActivityLogs } = useData();
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'payouts'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [selectedPayout, setSelectedPayout] = useState<Transaction | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const completedPurchases = transactions.filter(
    (transaction) => transaction.type === 'purchase' && transaction.status === 'completed',
  );
  const payoutRequests = transactions.filter((transaction) => transaction.type === 'payout');
  const pendingPayouts = payoutRequests.filter((payout) => payout.status === 'pending');
  const stats = {
    totalRevenue: completedPurchases.reduce((total, transaction) => total + transaction.amount, 0),
    pendingPayouts: pendingPayouts.reduce((total, payout) => total + payout.amount, 0),
    pendingPayoutCount: pendingPayouts.length,
    totalCoinsSold: completedPurchases.reduce((total, transaction) => total + transaction.coins, 0),
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getStatusBadge = (status: Transaction['status']) => {
    const styles: Record<string, string> = {
      completed: 'badge-success',
      pending: 'badge-warning',
      failed: 'badge-danger',
      cancelled: 'bg-gray-100 text-fg',
    };
    return styles[status] || 'bg-gray-100 text-fg';
  };

  const getTypeIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'purchase':
        return <ArrowUpRight className="h-4 w-4 text-green-500" />;
      case 'payout':
        return <ArrowDownRight className="h-4 w-4 text-orange-500" />;
      case 'refund':
        return <ArrowDownRight className="h-4 w-4 text-red-500" />;
      case 'deposit':
        return <ArrowUpRight className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      tx.userName.en.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.description.en.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || tx.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || tx.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const handlePayoutAction = (payoutId: string, action: 'approve' | 'reject') => {
    const payout = payoutRequests.find((transaction) => transaction.id === payoutId);
    if (!payout) return;

    const status: Transaction['status'] = action === 'approve' ? 'completed' : 'cancelled';
    setTransactions((prev) =>
      prev.map((transaction) =>
        transaction.id === payoutId
          ? {
              ...transaction,
              status,
              description: {
                en: `Payout ${action === 'approve' ? 'approved' : 'rejected'}`,
                mm: `Payout ${action === 'approve' ? 'approved' : 'rejected'}`,
              },
            }
          : transaction,
      ),
    );
    appendActivityLog(setActivityLogs, {
      action: 'update',
      targetType: 'transaction',
      targetId: payout.id,
      targetName: payout.userName,
      details: `${action === 'approve' ? 'Approved' : 'Rejected'} payout of ${formatCurrency(payout.amount)}`,
      admin,
    });
    setIsPayoutModalOpen(false);
    setSelectedPayout(null);
    setOpenMenuId(null);
  };

  const openPayoutModal = (payout: Transaction) => {
    setSelectedPayout(payout);
    setIsPayoutModalOpen(true);
    setOpenMenuId(null);
  };

  const exportTransactions = () => {
    const csv = [
      ['ID', 'Type', 'User', 'Amount', 'Coins', 'Status', 'Description', 'Date'].join(','),
      ...filteredTransactions.map((tx) =>
        [
          tx.id,
          tx.type,
          tx.userName.en,
          tx.amount,
          tx.coins,
          tx.status,
          `"${tx.description.en}"`,
          tx.createdAt,
        ].join(','),
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <>
      <PageSEO.Revenue />
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-fg">Revenue & Payments</h1>
            <p className="mt-1 text-fg-muted">Track revenue, manage transactions and payouts</p>
          </div>
          <Button
            leftIcon={<Download className="h-4 w-4" />}
            variant="outline"
            onClick={exportTransactions}
          >
            Export Report
          </Button>
        </div>

        <div className="flex gap-2 border-b border-line">
          {(['overview', 'transactions', 'payouts'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-fg-muted hover:text-fg-secondary'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-fg-muted">Total Revenue</p>
                    <p className="text-2xl font-bold text-fg">
                      {formatCurrency(stats.totalRevenue)}
                    </p>
                    <p className="mt-1 text-sm text-fg-muted">Completed purchases</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-fg-muted">Completed Purchases</p>
                    <p className="text-2xl font-bold text-fg">{completedPurchases.length}</p>
                    <p className="mt-1 text-sm text-fg-muted">Successful transactions</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                    <CreditCard className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-fg-muted">Pending Payouts</p>
                    <p className="text-2xl font-bold text-fg">
                      {formatCurrency(stats.pendingPayouts)}
                    </p>
                    <p className="mt-1 text-sm text-orange-600">
                      {stats.pendingPayoutCount}{' '}
                      {stats.pendingPayoutCount === 1 ? 'request' : 'requests'} pending
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100">
                    <Clock className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-fg-muted">Coins Sold</p>
                    <p className="text-2xl font-bold text-fg">
                      {formatNumber(stats.totalCoinsSold)}
                    </p>
                    <p className="mt-1 text-sm text-fg-muted">From completed purchases</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-burst-100">
                    <Coins className="h-6 w-6 text-burst-600" />
                  </div>
                </div>
              </Card>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Card>
                <div className="border-b border-line p-4">
                  <h3 className="font-semibold text-fg">Recent Transactions</h3>
                </div>
                <div className="divide-y divide-gray-100">
                  {transactions.slice(0, 5).map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                          {getTypeIcon(tx.type)}
                        </div>
                        <div>
                          <p className="font-medium text-fg">{tx.userName.en}</p>
                          <p className="text-sm text-fg-muted">{tx.description.en}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`font-medium ${tx.type === 'purchase' || tx.type === 'deposit' ? 'text-green-600' : 'text-red-600'}`}
                        >
                          {tx.type === 'purchase' || tx.type === 'deposit' ? '+' : '-'}
                          {formatCurrency(tx.amount)}
                        </p>
                        <p className="text-xs text-fg-muted">{tx.createdAt}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-line p-4">
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={() => setActiveTab('transactions')}
                  >
                    View All Transactions
                  </Button>
                </div>
              </Card>

              <Card>
                <div className="border-b border-line p-4">
                  <h3 className="font-semibold text-fg">Pending Payout Requests</h3>
                </div>
                <div className="divide-y divide-gray-100">
                  {payoutRequests
                    .filter((p) => p.status === 'pending')
                    .slice(0, 5)
                    .map((payout) => (
                      <div key={payout.id} className="flex items-center justify-between p-4">
                        <div>
                          <p className="font-medium text-fg">{payout.userName.en}</p>
                          <p className="text-sm text-fg-muted">
                            Payment: {payout.paymentMethod || 'Not provided'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-fg">{formatCurrency(payout.amount)}</p>
                          <p className="text-xs text-fg-muted">{payout.createdAt}</p>
                        </div>
                      </div>
                    ))}
                </div>
                <div className="border-t border-line p-4">
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={() => setActiveTab('payouts')}
                  >
                    View All Payouts
                  </Button>
                </div>
              </Card>
            </div>
          </>
        )}

        {activeTab === 'transactions' && (
          <Card>
            <div className="space-y-4 border-b border-line p-4">
              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="flex-1">
                  <Input
                    placeholder="Search transactions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    leftIcon={<Search className="h-5 w-5" />}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="h-5 w-5 text-fg-muted" />
                  <select
                    aria-label="Filter by type"
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="rounded-lg border border-line-strong px-3 py-2 text-sm"
                  >
                    <option value="all">All Types</option>
                    <option value="purchase">Purchase</option>
                    <option value="payout">Payout</option>
                    <option value="refund">Refund</option>
                    <option value="deposit">Deposit</option>
                  </select>
                  <select
                    aria-label="Filter by status"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="rounded-lg border border-line-strong px-3 py-2 text-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-line">
                    <th className="table-header">Transaction</th>
                    <th className="table-header">User</th>
                    <th className="table-header">Type</th>
                    <th className="table-header">Amount</th>
                    <th className="table-header">Coins</th>
                    <th className="table-header">Status</th>
                    <th className="table-header">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {filteredTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-gray-50">
                      <td className="table-cell">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(tx.type)}
                          <span className="font-medium text-fg">{tx.id}</span>
                        </div>
                      </td>
                      <td className="table-cell">{tx.userName.en}</td>
                      <td className="table-cell">
                        <span className="capitalize">{tx.type}</span>
                      </td>
                      <td className="table-cell font-medium">
                        <span
                          className={
                            tx.type === 'purchase' || tx.type === 'deposit'
                              ? 'text-green-600'
                              : 'text-red-600'
                          }
                        >
                          {tx.type === 'purchase' || tx.type === 'deposit' ? '+' : '-'}
                          {formatCurrency(tx.amount)}
                        </span>
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center gap-1">
                          <Coins className="h-4 w-4 text-yellow-500" />
                          {tx.coins}
                        </div>
                      </td>
                      <td className="table-cell">
                        <span className={getStatusBadge(tx.status)}>{tx.status}</span>
                      </td>
                      <td className="table-cell text-fg-muted">{tx.createdAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredTransactions.length === 0 && (
              <div className="py-12 text-center">
                <p className="text-fg-muted">No transactions found</p>
              </div>
            )}
          </Card>
        )}

        {activeTab === 'payouts' && (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-line">
                    <th className="table-header">Author</th>
                    <th className="table-header">Amount</th>
                    <th className="table-header">Payment Method</th>
                    <th className="table-header">Status</th>
                    <th className="table-header">Requested</th>
                    <th className="table-header text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {payoutRequests.map((payout) => (
                    <tr key={payout.id} className="hover:bg-gray-50">
                      <td className="table-cell font-medium">{payout.userName.en}</td>
                      <td className="table-cell font-medium text-fg">
                        {formatCurrency(payout.amount)}
                      </td>
                      <td className="table-cell text-fg-muted">
                        {payout.paymentMethod || 'Not provided'}
                      </td>
                      <td className="table-cell">
                        <span className={getStatusBadge(payout.status)}>{payout.status}</span>
                      </td>
                      <td className="table-cell text-fg-muted">{payout.createdAt}</td>
                      <td className="table-cell text-right">
                        {payout.status === 'pending' && (
                          <div className="relative inline-block">
                            <button
                              type="button"
                              title="Payout actions"
                              onClick={() =>
                                setOpenMenuId(openMenuId === payout.id ? null : payout.id)
                              }
                              className="rounded-lg p-2 text-fg-muted hover:bg-gray-100 hover:text-fg-secondary"
                            >
                              <MoreVertical className="h-5 w-5" />
                            </button>
                            {openMenuId === payout.id && (
                              <div className="absolute right-0 z-10 mt-2 w-40 rounded-lg border border-line bg-white py-1 shadow-lg">
                                <button
                                  type="button"
                                  onClick={() => openPayoutModal(payout)}
                                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-fg-secondary hover:bg-gray-50"
                                >
                                  <Eye className="h-4 w-4" />
                                  View Details
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handlePayoutAction(payout.id, 'approve')}
                                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-green-600 hover:bg-green-50"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                  Approve
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handlePayoutAction(payout.id, 'reject')}
                                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                >
                                  <XCircle className="h-4 w-4" />
                                  Reject
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                        {payout.status !== 'pending' && (
                          <span className="text-sm text-fg-muted">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        <Modal
          isOpen={isPayoutModalOpen}
          onClose={() => {
            setIsPayoutModalOpen(false);
            setSelectedPayout(null);
          }}
          title="Payout Details"
          size="md"
        >
          {selectedPayout && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-fg-muted">Author</p>
                  <p className="font-medium">{selectedPayout.userName.en}</p>
                </div>
                <div>
                  <p className="text-sm text-fg-muted">Amount</p>
                  <p className="text-lg font-medium">{formatCurrency(selectedPayout.amount)}</p>
                </div>
                <div>
                  <p className="text-sm text-fg-muted">Payment Method</p>
                  <p className="font-medium">{selectedPayout.paymentMethod || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm text-fg-muted">Requested</p>
                  <p className="font-medium">{selectedPayout.createdAt}</p>
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t pt-4">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setIsPayoutModalOpen(false);
                    setSelectedPayout(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  onClick={() => handlePayoutAction(selectedPayout.id, 'reject')}
                >
                  Reject
                </Button>
                <Button onClick={() => handlePayoutAction(selectedPayout.id, 'approve')}>
                  Approve
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </>
  );
};

export default RevenuePage;
