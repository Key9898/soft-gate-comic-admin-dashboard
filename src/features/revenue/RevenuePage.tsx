import { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
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

import type { Transaction } from '../../types';

interface PayoutRequest {
  id: string;
  authorId: string;
  authorName: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  bankAccount: string;
  requestedAt: string;
  processedAt?: string;
}

const mockTransactions: Transaction[] = [
  {
    id: '1',
    type: 'purchase',
    userId: 'u1',
    userName: { en: 'john_doe', mm: 'ကိုဂျွန်' },
    amount: 9.99,
    coins: 100,
    status: 'completed',
    description: { en: 'Coin purchase - 100 coins', mm: 'ဒင်္ဂါးဝယ်ယူမှု - ၁၀၀ ဒင်္ဂါး' },
    createdAt: '2026-04-27 14:30',
    paymentMethod: 'Credit Card',
  },
  {
    id: '2',
    type: 'purchase',
    userId: 'u2',
    userName: { en: 'jane_smith', mm: 'မဂျိန်း' },
    amount: 19.99,
    coins: 220,
    status: 'completed',
    description: { en: 'Coin purchase - 220 coins', mm: 'ဒင်္ဂါးဝယ်ယူမှု - ၂၂၀ ဒင်္ဂါး' },
    createdAt: '2026-04-27 13:15',
    paymentMethod: 'PayPal',
  },
  {
    id: '3',
    type: 'payout',
    userId: 'a1',
    userName: { en: 'Author One', mm: 'စာရေးသူ တစ်ဦး' },
    amount: 150.0,
    coins: 1500,
    status: 'pending',
    description: { en: 'Payout request', mm: 'ငွေထုတ်ယူရန် တောင်းဆိုချက်' },
    createdAt: '2026-04-27 12:00',
  },
  {
    id: '4',
    type: 'refund',
    userId: 'u3',
    userName: { en: 'user_123', mm: 'အသုံးပြုသူ ၁၂၃' },
    amount: 4.99,
    coins: 50,
    status: 'completed',
    description: {
      en: 'Refund for duplicate purchase',
      mm: 'ထပ်နေသော ဝယ်ယူမှုအတွက် ငွေပြန်အမ်းခြင်း',
    },
    createdAt: '2026-04-26 18:45',
    paymentMethod: 'Credit Card',
  },
  {
    id: '5',
    type: 'purchase',
    userId: 'u4',
    userName: { en: 'reader_456', mm: 'စာဖတ်သူ ၄၅၆' },
    amount: 49.99,
    coins: 600,
    status: 'completed',
    description: { en: 'Coin purchase - 600 coins', mm: 'ဒင်္ဂါးဝယ်ယူမှု - ၆၀၀ ဒင်္ဂါး' },
    createdAt: '2026-04-26 15:30',
    paymentMethod: 'Google Pay',
  },
  {
    id: '6',
    type: 'payout',
    userId: 'a2',
    userName: { en: 'Author Two', mm: 'စာရေးသူ နှစ်ဦး' },
    amount: 320.5,
    coins: 3205,
    status: 'completed',
    description: { en: 'Payout approved', mm: 'ငွေထုတ်ယူခွင့် ပြုပြီး' },
    createdAt: '2026-04-26 10:00',
  },
  {
    id: '7',
    type: 'purchase',
    userId: 'u5',
    userName: { en: 'webtoon_fan', mm: 'ဝက်ဘ်တွန်းပရိသတ်' },
    amount: 9.99,
    coins: 100,
    status: 'failed',
    description: { en: 'Coin purchase - 100 coins', mm: 'ဒင်္ဂါးဝယ်ယူမှု - ၁၀၀ ဒင်္ဂါး' },
    createdAt: '2026-04-25 20:00',
    paymentMethod: 'Credit Card',
  },
  {
    id: '8',
    type: 'deposit',
    userId: 'system',
    userName: { en: 'System', mm: 'စနစ်' },
    amount: 1000.0,
    coins: 10000,
    status: 'completed',
    description: { en: 'Promotional coins added', mm: 'အရောင်းမြှင့်တင်ရေး ဒင်္ဂါးများ ထည့်ပြီး' },
    createdAt: '2026-04-25 09:00',
  },
];

const mockPayoutRequests: PayoutRequest[] = [
  {
    id: 'p1',
    authorId: 'a1',
    authorName: 'Author One',
    amount: 150.0,
    status: 'pending',
    bankAccount: '****1234',
    requestedAt: '2026-04-27 12:00',
  },
  {
    id: 'p2',
    authorId: 'a2',
    authorName: 'Author Two',
    amount: 320.5,
    status: 'approved',
    bankAccount: '****5678',
    requestedAt: '2026-04-26 10:00',
  },
  {
    id: 'p3',
    authorId: 'a3',
    authorName: 'Author Three',
    amount: 89.25,
    status: 'pending',
    bankAccount: '****9012',
    requestedAt: '2026-04-25 16:30',
  },
  {
    id: 'p4',
    authorId: 'a4',
    authorName: 'Author Four',
    amount: 450.0,
    status: 'paid',
    bankAccount: '****3456',
    requestedAt: '2026-04-24 11:00',
    processedAt: '2026-04-25 09:00',
  },
  {
    id: 'p5',
    authorId: 'a5',
    authorName: 'Author Five',
    amount: 75.0,
    status: 'rejected',
    bankAccount: '****7890',
    requestedAt: '2026-04-23 14:00',
    processedAt: '2026-04-24 10:00',
  },
];

const RevenuePage = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'payouts'>('overview');
  const [transactions] = useState<Transaction[]>(mockTransactions);
  const [payoutRequests, setPayoutRequests] = useState<PayoutRequest[]>(mockPayoutRequests);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [selectedPayout, setSelectedPayout] = useState<PayoutRequest | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const stats = {
    totalRevenue: 15680.5,
    monthlyRevenue: 3250.0,
    pendingPayouts: 539.75,
    totalCoinsSold: 156805,
    revenueGrowth: 12.5,
    coinsGrowth: 8.3,
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

  const getStatusBadge = (status: Transaction['status'] | PayoutRequest['status']) => {
    const styles: Record<string, string> = {
      completed: 'badge-success',
      paid: 'badge-success',
      pending: 'badge-warning',
      approved: 'badge-info',
      failed: 'badge-danger',
      rejected: 'badge-danger',
      cancelled: 'bg-gray-100 text-gray-800',
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
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

  const handlePayoutAction = (payoutId: string, action: 'approve' | 'reject' | 'pay') => {
    setPayoutRequests((prev) =>
      prev.map((p) =>
        p.id === payoutId
          ? {
              ...p,
              status: action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'paid',
              processedAt: new Date().toISOString().split('T')[0],
            }
          : p,
      ),
    );
    setIsPayoutModalOpen(false);
    setSelectedPayout(null);
  };

  const openPayoutModal = (payout: PayoutRequest) => {
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
            <h1 className="text-2xl font-bold text-gray-900">Revenue & Payments</h1>
            <p className="mt-1 text-gray-500">Track revenue, manage transactions and payouts</p>
          </div>
          <Button
            leftIcon={<Download className="h-4 w-4" />}
            variant="outline"
            onClick={exportTransactions}
          >
            Export Report
          </Button>
        </div>

        <div className="flex gap-2 border-b border-gray-200">
          {(['overview', 'transactions', 'payouts'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
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
                    <p className="text-sm text-gray-500">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(stats.totalRevenue)}
                    </p>
                    <div className="mt-1 flex items-center gap-1">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-600">+{stats.revenueGrowth}%</span>
                    </div>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Monthly Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(stats.monthlyRevenue)}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">This month</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                    <CreditCard className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Pending Payouts</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(stats.pendingPayouts)}
                    </p>
                    <p className="mt-1 text-sm text-orange-600">3 requests pending</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100">
                    <Clock className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Coins Sold</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatNumber(stats.totalCoinsSold)}
                    </p>
                    <div className="mt-1 flex items-center gap-1">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-600">+{stats.coinsGrowth}%</span>
                    </div>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                    <Coins className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </Card>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Card>
                <div className="border-b border-gray-200 p-4">
                  <h3 className="font-semibold text-gray-900">Recent Transactions</h3>
                </div>
                <div className="divide-y divide-gray-100">
                  {transactions.slice(0, 5).map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                          {getTypeIcon(tx.type)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{tx.userName.en}</p>
                          <p className="text-sm text-gray-500">{tx.description.en}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`font-medium ${tx.type === 'purchase' || tx.type === 'deposit' ? 'text-green-600' : 'text-red-600'}`}
                        >
                          {tx.type === 'purchase' || tx.type === 'deposit' ? '+' : '-'}
                          {formatCurrency(tx.amount)}
                        </p>
                        <p className="text-xs text-gray-500">{tx.createdAt}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-200 p-4">
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
                <div className="border-b border-gray-200 p-4">
                  <h3 className="font-semibold text-gray-900">Pending Payout Requests</h3>
                </div>
                <div className="divide-y divide-gray-100">
                  {payoutRequests
                    .filter((p) => p.status === 'pending')
                    .slice(0, 5)
                    .map((payout) => (
                      <div key={payout.id} className="flex items-center justify-between p-4">
                        <div>
                          <p className="font-medium text-gray-900">{payout.authorName}</p>
                          <p className="text-sm text-gray-500">Bank: {payout.bankAccount}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">
                            {formatCurrency(payout.amount)}
                          </p>
                          <p className="text-xs text-gray-500">{payout.requestedAt}</p>
                        </div>
                      </div>
                    ))}
                </div>
                <div className="border-t border-gray-200 p-4">
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
            <div className="space-y-4 border-b border-gray-200 p-4">
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
                  <Filter className="h-5 w-5 text-gray-400" />
                  <select
                    aria-label="Filter by type"
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
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
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
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
                  <tr className="border-b border-gray-200">
                    <th className="table-header">Transaction</th>
                    <th className="table-header">User</th>
                    <th className="table-header">Type</th>
                    <th className="table-header">Amount</th>
                    <th className="table-header">Coins</th>
                    <th className="table-header">Status</th>
                    <th className="table-header">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-gray-50">
                      <td className="table-cell">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(tx.type)}
                          <span className="font-medium text-gray-900">{tx.id}</span>
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
                      <td className="table-cell text-gray-500">{tx.createdAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredTransactions.length === 0 && (
              <div className="py-12 text-center">
                <p className="text-gray-500">No transactions found</p>
              </div>
            )}
          </Card>
        )}

        {activeTab === 'payouts' && (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="table-header">Author</th>
                    <th className="table-header">Amount</th>
                    <th className="table-header">Bank Account</th>
                    <th className="table-header">Status</th>
                    <th className="table-header">Requested</th>
                    <th className="table-header">Processed</th>
                    <th className="table-header text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {payoutRequests.map((payout) => (
                    <tr key={payout.id} className="hover:bg-gray-50">
                      <td className="table-cell font-medium">{payout.authorName}</td>
                      <td className="table-cell font-medium text-gray-900">
                        {formatCurrency(payout.amount)}
                      </td>
                      <td className="table-cell text-gray-500">{payout.bankAccount}</td>
                      <td className="table-cell">
                        <span className={getStatusBadge(payout.status)}>{payout.status}</span>
                      </td>
                      <td className="table-cell text-gray-500">{payout.requestedAt}</td>
                      <td className="table-cell text-gray-500">{payout.processedAt || '-'}</td>
                      <td className="table-cell text-right">
                        {payout.status === 'pending' && (
                          <div className="relative inline-block">
                            <button
                              type="button"
                              title="Payout actions"
                              onClick={() =>
                                setOpenMenuId(openMenuId === payout.id ? null : payout.id)
                              }
                              className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                            >
                              <MoreVertical className="h-5 w-5" />
                            </button>
                            {openMenuId === payout.id && (
                              <div className="absolute right-0 z-10 mt-2 w-40 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                                <button
                                  type="button"
                                  onClick={() => openPayoutModal(payout)}
                                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
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
                        {payout.status === 'approved' && (
                          <Button size="sm" onClick={() => handlePayoutAction(payout.id, 'pay')}>
                            Mark as Paid
                          </Button>
                        )}
                        {payout.status !== 'pending' && payout.status !== 'approved' && (
                          <span className="text-sm text-gray-400">-</span>
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
                  <p className="text-sm text-gray-500">Author</p>
                  <p className="font-medium">{selectedPayout.authorName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Amount</p>
                  <p className="text-lg font-medium">{formatCurrency(selectedPayout.amount)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Bank Account</p>
                  <p className="font-medium">{selectedPayout.bankAccount}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Requested</p>
                  <p className="font-medium">{selectedPayout.requestedAt}</p>
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
