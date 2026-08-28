import { useEffect, useState } from 'react';
import { Lock, Plus, UserPlus } from 'lucide-react';
import { Button, Card, ConfirmDialog, Input, Modal, PageSEO } from '../../components';
import { useAuth } from '@/features/auth/useAuth';
import { appendActivityLog } from '@/lib/activityLog';
import { useData } from '@/lib/DataContext';
import { formatAdminRole } from '@/lib/format';
import {
  ROLE_BLURBS,
  STAFF_ROLE_GUIDE,
  createInvite,
  deleteStaffAccount,
  listPendingInvites,
  listStaffAccounts,
  resendInvite,
  revokeInvite,
  type InviteRole,
  type PublicStaffInvite,
  type StaffAccount,
} from '@/lib/auth';
import { useStaffAccess } from '@/lib/auth/staffAccess';
import { ApiError, isMockApi } from '@/lib/api/http';
import {
  createStaffInvite,
  deleteStaffUser,
  listStaffInvites,
  listStaffUsers,
  resendStaffInvite,
  toStaffAccount,
} from '@/lib/api/staff';
import TeamPageSkeleton from './components/TeamPageSkeleton';

const inviteUrl = (rawToken: string) => `${window.location.origin}/invite/${rawToken}`;

const TeamPage = () => {
  const { user } = useAuth();
  const access = useStaffAccess();
  const { isLoading, setActivityLogs } = useData();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<InviteRole>(access.inviteRoles[0] ?? 'member');
  const [inviteError, setInviteError] = useState('');
  const [inviteLink, setInviteLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<StaffAccount | null>(null);
  const [roster, setRoster] = useState(() => ({
    members: isMockApi() ? listStaffAccounts() : ([] as StaffAccount[]),
    pending: isMockApi() ? listPendingInvites() : ([] as PublicStaffInvite[]),
  }));
  const refreshMock = () =>
    setRoster({
      members: listStaffAccounts(),
      pending: listPendingInvites(),
    });
  const refreshApi = async () => {
    const [usersRes, invitesRes] = await Promise.all([listStaffUsers(), listStaffInvites()]);
    setRoster({
      members: usersRes.users.map(toStaffAccount),
      pending: invitesRes.invites.filter((invite) => invite.status === 'pending'),
    });
  };
  const refresh = () => {
    if (isMockApi()) {
      refreshMock();
      return Promise.resolve();
    }
    return refreshApi();
  };

  useEffect(() => {
    if (isMockApi()) return;
    void refreshApi().catch(() => undefined);
  }, []);
  const { members, pending } = roster;

  const openInvite = () => {
    const nextRole = access.inviteRoles[0] ?? 'member';
    setInviteLink('');
    setInviteEmail('');
    setInviteError('');
    setInviteRole(nextRole);
    setCopied(false);
    setInviteOpen(true);
  };

  const closeInvite = () => {
    setInviteOpen(false);
    setInviteEmail('');
    setInviteError('');
    setInviteLink('');
    setCopied(false);
  };

  const copyLink = async (link: string) => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  const handleCreateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !access.canManageTeam || !access.canInviteRole(inviteRole)) return;
    setInviteError('');
    try {
      const created = isMockApi()
        ? createInvite({
            email: inviteEmail,
            inviterId: user.id,
            actorRole: user.role,
            role: inviteRole,
          })
        : await createStaffInvite({ email: inviteEmail, role: inviteRole });
      const rawToken = 'rawToken' in created ? created.rawToken : created.token;
      const link = inviteUrl(rawToken);
      setInviteEmail(created.invite.email);
      setInviteRole(created.invite.role);
      setInviteLink(link);
      setCopied(false);
      appendActivityLog(setActivityLogs, {
        action: 'create',
        targetType: 'staff',
        targetId: created.invite.id,
        targetName: created.invite.email,
        details: 'Staff invite created',
        admin: user,
      });
      await refresh();
    } catch (err) {
      const code =
        err instanceof ApiError
          ? err.status === 409
            ? 'ALREADY_STAFF'
            : err.status === 400
              ? 'INVALID_EMAIL'
              : ''
          : err instanceof Error
            ? err.message
            : '';
      setInviteError(
        code === 'ALREADY_STAFF'
          ? 'That email already has a staff account.'
          : code === 'INVALID_EMAIL'
            ? 'Please enter a valid email.'
            : 'Could not create invite.',
      );
    }
  };

  const handleResend = async (invite: PublicStaffInvite) => {
    if (!user || !access.canInviteRole(invite.role)) return;
    try {
      const resent = isMockApi()
        ? resendInvite(invite.id, user.role)
        : await resendStaffInvite(invite.id);
      const rawToken = 'rawToken' in resent ? resent.rawToken : resent.token;
      const link = inviteUrl(rawToken);
      setInviteEmail(resent.invite.email);
      setInviteRole(resent.invite.role);
      setInviteLink(link);
      setInviteError('');
      setCopied(false);
      setInviteOpen(true);
      appendActivityLog(setActivityLogs, {
        action: 'create',
        targetType: 'staff',
        targetId: resent.invite.id,
        targetName: resent.invite.email,
        details: 'Staff invite resent',
        admin: user,
      });
      await refresh();
    } catch {
      setInviteError('Could not resend invite.');
      setInviteOpen(true);
    }
  };

  const handleRevoke = (invite: PublicStaffInvite) => {
    if (!isMockApi()) return;
    if (!user || !access.canInviteRole(invite.role)) return;
    revokeInvite(invite.id);
    appendActivityLog(setActivityLogs, {
      action: 'delete',
      targetType: 'staff',
      targetId: invite.id,
      targetName: invite.email,
      details: 'Staff invite revoked',
      admin: user,
    });
    refreshMock();
  };

  const handleRemove = async () => {
    if (!removeTarget || !user || !access.canRemoveStaff(removeTarget.role)) return;
    try {
      if (isMockApi()) {
        deleteStaffAccount(removeTarget.email);
      } else {
        await deleteStaffUser(removeTarget.id);
      }
      appendActivityLog(setActivityLogs, {
        action: 'delete',
        targetType: 'staff',
        targetId: removeTarget.id,
        targetName: removeTarget.displayName,
        details: 'Staff account removed',
        admin: user,
      });
      await refresh();
    } catch {
      /* super_admin locked */
    }
    setRemoveTarget(null);
  };

  return (
    <>
      <PageSEO.Team />
      {isLoading ? (
        <TeamPageSkeleton />
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-fg">Team</h1>
              <p className="mt-1 text-fg-muted">Staff who can open this dashboard.</p>
            </div>
            {access.canManageTeam ? (
              <Button type="button" leftIcon={<Plus className="h-4 w-4" />} onClick={openInvite}>
                Invite member
              </Button>
            ) : null}
          </div>

          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-line text-left text-sm text-fg-muted">
                    <th className="pb-3 font-medium">Member</th>
                    <th className="pb-3 font-medium">Email</th>
                    <th className="pb-3 font-medium">Role</th>
                    <th className="pb-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((member) => {
                    const isLocked = member.role === 'super_admin';
                    const canRemove = access.canRemoveStaff(member.role);
                    return (
                      <tr key={member.id} className="border-b border-line last:border-0">
                        <td className="py-3">
                          <div className="flex items-center gap-3">
                            {member.avatar ? (
                              <img
                                src={member.avatar}
                                alt=""
                                className="h-9 w-9 rounded-full object-cover"
                              />
                            ) : (
                              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-50 text-sm font-medium text-primary-700">
                                {member.displayName.charAt(0).toUpperCase()}
                              </span>
                            )}
                            <div>
                              <p className="font-medium text-fg">{member.displayName}</p>
                              <p className="text-xs text-fg-muted">@{member.username}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 text-sm text-fg-secondary">{member.email}</td>
                        <td className="py-3">
                          <span className="inline-flex items-center gap-1 rounded-lg bg-primary-50 px-2 py-1 text-xs font-medium text-primary-800">
                            {isLocked ? <Lock className="h-3 w-3" aria-hidden /> : null}
                            {formatAdminRole(member.role)}
                          </span>
                        </td>
                        <td className="py-3">
                          {canRemove ? (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setRemoveTarget(member)}
                            >
                              Remove
                            </Button>
                          ) : (
                            <span className="text-sm text-fg-muted">
                              {isLocked ? 'Permanent' : '—'}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-fg">Pending invites</h2>
            {pending.length === 0 ? (
              <p className="mt-3 text-sm text-fg-muted">No pending invites</p>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-line text-left text-sm text-fg-muted">
                      <th className="pb-3 font-medium">Email</th>
                      <th className="pb-3 font-medium">Role</th>
                      <th className="pb-3 font-medium">Expires</th>
                      <th className="pb-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pending.map((invite) => {
                      const canAct = access.canInviteRole(invite.role);
                      return (
                        <tr key={invite.id} className="border-b border-line last:border-0">
                          <td className="py-3 text-sm text-fg">{invite.email}</td>
                          <td className="py-3 text-sm text-fg-secondary">
                            {formatAdminRole(invite.role)}
                          </td>
                          <td className="py-3 text-sm text-fg-muted">
                            {new Date(invite.expiresAt).toLocaleString()}
                          </td>
                          <td className="py-3">
                            {canAct ? (
                              <div className="flex flex-wrap gap-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => void handleResend(invite)}
                                >
                                  Resend
                                </Button>
                                {isMockApi() ? (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRevoke(invite)}
                                  >
                                    Revoke
                                  </Button>
                                ) : null}
                              </div>
                            ) : (
                              <span className="text-sm text-fg-muted">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-fg">Roles</h2>
            <ul className="mt-4 space-y-3">
              {STAFF_ROLE_GUIDE.map(({ role, blurb }) => (
                <li key={role}>
                  <p className="text-sm font-medium text-fg">{formatAdminRole(role)}</p>
                  <p className="mt-0.5 text-sm text-fg-muted">{blurb}</p>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}

      <Modal isOpen={inviteOpen} onClose={closeInvite} title="Invite member" size="sm">
        {inviteLink ? (
          <div className="space-y-4">
            <p className="text-sm text-fg">
              Inviting {inviteEmail} as {formatAdminRole(inviteRole)}.
            </p>
            <p className="text-sm text-fg-secondary">
              This demo cannot send email. Copy the link and share it.
            </p>
            <Input id="invite-link" label="Invite link" value={inviteLink} readOnly />
            <div className="flex justify-end gap-3">
              <Button type="button" variant="ghost" onClick={closeInvite}>
                Done
              </Button>
              <Button type="button" onClick={() => copyLink(inviteLink)}>
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleCreateInvite} className="space-y-4">
            <p className="text-sm text-fg-secondary">
              Invite staff to this dashboard. Super Admin is permanent and cannot be invited.
            </p>
            {inviteError ? <p className="text-sm text-red-600">{inviteError}</p> : null}
            <Input
              id="team-invite-email"
              label="Email address"
              type="email"
              placeholder="you@example.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              required
            />
            <div>
              <label
                htmlFor="team-invite-role"
                className="mb-1.5 block text-sm font-medium text-fg-secondary"
              >
                Role
              </label>
              <select
                id="team-invite-role"
                className="w-full rounded-lg border border-line-strong bg-surface px-4 py-2.5 text-fg"
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as InviteRole)}
              >
                {access.inviteRoles.map((role) => (
                  <option key={role} value={role}>
                    {formatAdminRole(role)}
                  </option>
                ))}
              </select>
              <p className="mt-1.5 text-xs text-fg-secondary">{ROLE_BLURBS[inviteRole]}</p>
            </div>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="ghost" onClick={closeInvite}>
                Cancel
              </Button>
              <Button type="submit" leftIcon={<UserPlus className="h-4 w-4" />}>
                Invite
              </Button>
            </div>
          </form>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(removeTarget)}
        title="Remove staff"
        message={`Remove ${removeTarget?.displayName ?? 'this admin'} from the dashboard? They will not be able to sign in.`}
        confirmText="Remove"
        onConfirm={handleRemove}
        onCancel={() => setRemoveTarget(null)}
      />
    </>
  );
};

export default TeamPage;
