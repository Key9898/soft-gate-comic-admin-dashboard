import { useState } from 'react'
import { Search, Filter, MoreVertical, UserX, UserCheck, Eye, Coins } from 'lucide-react'
import { Card, Button, Input, Modal, PageSEO } from '../../components'
import { mockUsers } from '../../demo'
import type { User } from '../../types'

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>(mockUsers)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isBanModalOpen, setIsBanModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.displayName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: User['status']) => {
    const styles = {
      active: 'badge-success',
      banned: 'badge-danger',
      suspended: 'badge-warning',
    }
    return styles[status]
  }

  const handleBanUser = () => {
    if (!selectedUser) return
    setUsers(
      users.map((u) =>
        u.id === selectedUser.id ? { ...u, status: u.status === 'banned' ? 'active' : 'banned' } : u
      )
    )
    setIsBanModalOpen(false)
    setSelectedUser(null)
  }

  const handleSuspendUser = (user: User) => {
    setUsers(
      users.map((u) =>
        u.id === user.id ? { ...u, status: u.status === 'suspended' ? 'active' : 'suspended' } : u
      )
    )
    setOpenMenuId(null)
  }

  const openDetailModal = (user: User) => {
    setSelectedUser(user)
    setIsDetailModalOpen(true)
    setOpenMenuId(null)
  }

  const openBanModal = (user: User) => {
    setSelectedUser(user)
    setIsBanModalOpen(true)
    setOpenMenuId(null)
  }

  return (
    <>
      <PageSEO.Users />
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Users</h1>
            <p className="text-gray-500 mt-1">Manage platform users</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-green-50 text-green-600">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter((u) => u.status === 'active').length}
                </p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-red-50 text-red-600">
                <UserX className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Banned Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter((u) => u.status === 'banned').length}
                </p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-yellow-50 text-yellow-600">
                <UserX className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Suspended Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter((u) => u.status === 'suspended').length}
                </p>
              </div>
            </div>
          </Card>
        </div>

        <Card>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="w-5 h-5" />}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                aria-label="Filter by status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="banned">Banned</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="table-header">User</th>
                  <th className="table-header">Email</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Coins</th>
                  <th className="table-header">Joined</th>
                  <th className="table-header">Last Login</th>
                  <th className="table-header text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                          {user.avatar ? (
                            <img
                              src={user.avatar}
                              alt={user.displayName}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-primary-600 font-medium">
                              {user.displayName.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.displayName}</p>
                          <p className="text-xs text-gray-500">@{user.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell text-gray-500">{user.email}</td>
                    <td className="table-cell">
                      <span className={getStatusBadge(user.status)}>{user.status}</span>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-1">
                        <Coins className="w-4 h-4 text-yellow-500" />
                        {user.coinBalance}
                      </div>
                    </td>
                    <td className="table-cell text-gray-500">{user.createdAt}</td>
                    <td className="table-cell text-gray-500">{user.lastLoginAt || 'Never'}</td>
                    <td className="table-cell text-right">
                      <div className="relative inline-block">
                        <button
                          type="button"
                          title="User actions"
                          aria-label="User actions menu"
                          onClick={() => setOpenMenuId(openMenuId === user.id ? null : user.id)}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>
                        {openMenuId === user.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                            <button
                              type="button"
                              onClick={() => openDetailModal(user)}
                              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              <Eye className="w-4 h-4" />
                              View Details
                            </button>
                            {user.status !== 'banned' && (
                              <button
                                type="button"
                                onClick={() => handleSuspendUser(user)}
                                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-yellow-600 hover:bg-yellow-50"
                              >
                                <UserX className="w-4 h-4" />
                                {user.status === 'suspended' ? 'Unsuspend' : 'Suspend'}
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => openBanModal(user)}
                              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                            >
                              <UserX className="w-4 h-4" />
                              {user.status === 'banned' ? 'Unban' : 'Ban'}
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No users found</p>
            </div>
          )}
        </Card>

        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false)
            setSelectedUser(null)
          }}
          title="User Details"
          size="lg"
        >
          {selectedUser && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
                  {selectedUser.avatar ? (
                    <img
                      src={selectedUser.avatar}
                      alt={selectedUser.displayName}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-primary-600 font-bold text-xl">
                      {selectedUser.displayName.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedUser.displayName}
                  </h3>
                  <p className="text-gray-500">@{selectedUser.username}</p>
                  <span className={getStatusBadge(selectedUser.status)}>{selectedUser.status}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-gray-50">
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-gray-900">{selectedUser.email}</p>
                </div>
                <div className="p-4 rounded-lg bg-gray-50">
                  <p className="text-sm text-gray-500">Coin Balance</p>
                  <p className="font-medium text-gray-900 flex items-center gap-1">
                    <Coins className="w-4 h-4 text-yellow-500" />
                    {selectedUser.coinBalance}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-gray-50">
                  <p className="text-sm text-gray-500">Joined</p>
                  <p className="font-medium text-gray-900">{selectedUser.createdAt}</p>
                </div>
                <div className="p-4 rounded-lg bg-gray-50">
                  <p className="text-sm text-gray-500">Last Login</p>
                  <p className="font-medium text-gray-900">{selectedUser.lastLoginAt || 'Never'}</p>
                </div>
              </div>

              {selectedUser.bio && (
                <div className="p-4 rounded-lg bg-gray-50">
                  <p className="text-sm text-gray-500 mb-1">Bio</p>
                  <p className="text-gray-900">{selectedUser.bio}</p>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setIsDetailModalOpen(false)
                    setSelectedUser(null)
                  }}
                >
                  Close
                </Button>
                <Button
                  variant={selectedUser.status === 'banned' ? 'primary' : 'danger'}
                  onClick={() => {
                    setIsDetailModalOpen(false)
                    openBanModal(selectedUser)
                  }}
                >
                  {selectedUser.status === 'banned' ? 'Unban User' : 'Ban User'}
                </Button>
              </div>
            </div>
          )}
        </Modal>

        <Modal
          isOpen={isBanModalOpen}
          onClose={() => {
            setIsBanModalOpen(false)
            setSelectedUser(null)
          }}
          title={selectedUser?.status === 'banned' ? 'Unban User' : 'Ban User'}
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              {selectedUser?.status === 'banned' ? (
                <>
                  Are you sure you want to unban <strong>{selectedUser?.displayName}</strong>?
                </>
              ) : (
                <>
                  Are you sure you want to ban <strong>{selectedUser?.displayName}</strong>? They
                  will not be able to access the platform.
                </>
              )}
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="secondary"
                onClick={() => {
                  setIsBanModalOpen(false)
                  setSelectedUser(null)
                }}
              >
                Cancel
              </Button>
              <Button
                variant={selectedUser?.status === 'banned' ? 'primary' : 'danger'}
                onClick={handleBanUser}
              >
                {selectedUser?.status === 'banned' ? 'Unban' : 'Ban'}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </>
  )
}

export default UsersPage
