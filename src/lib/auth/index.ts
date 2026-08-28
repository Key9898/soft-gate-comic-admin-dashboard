export type { StaffAccount, StaffAccountsStore } from './types';
export {
  AUTH_SCHEMA_VERSION,
  ACCOUNTS_STORAGE_KEY,
  SESSION_STORAGE_KEY,
  CREDENTIALS_STORAGE_KEY,
} from './types';
export { hashPassword, verifyPassword } from './passwordHash';
export { MIN_PASSWORD_LENGTH } from './passwordPolicy';
export { DEMO_PASSWORD_RESET_OTP, isDemoOtp } from './passwordResetMock';
export { safeReturnTo, type ReturnFrom } from './safeReturnTo';
export {
  migrateLegacyEmail,
  normalizeEmailOnLogin,
  persistSession,
  readSession,
  readAccounts,
  writeAccounts,
  upsertAccount,
  getAccountByEmail,
  getAccountByUsername,
  hasStaffAccount,
  toPublicUser,
  writeCredential,
  removeCredential,
  readCredentials,
  seedAccountFromSessionIfNeeded,
  listStaffAccounts,
  nextStaffId,
} from './storage';
export {
  INVITE_ROLES,
  ROLE_BLURBS,
  SUPER_ADMIN_BLURB,
  STAFF_ROLE_GUIDE,
  canWriteCatalog,
  canWriteCommunity,
  canWriteBusiness,
  canWriteSettings,
  canManageTeam,
  canInviteRole,
  canRemoveStaff,
  inviteRolesFor,
  type InviteRole,
  type StaffRole,
} from './staffAccess';
export {
  INVITES_STORAGE_KEY,
  INVITE_SCHEMA_VERSION,
  INVITE_TTL_MS,
  hashInviteToken,
  createInviteToken,
  createInvite,
  peekInvite,
  resendInvite,
  revokeInvite,
  consumeInvite,
  listInvites,
  listPendingInvites,
  deleteStaffAccount,
  type StaffInviteRecord,
  type PublicStaffInvite,
  type StaffInviteStatus,
} from './staffInvite';
