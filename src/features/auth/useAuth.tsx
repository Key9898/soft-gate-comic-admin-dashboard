import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { AdminUser } from '@softgate/shared';
import {
  consumeInvite,
  generateBackupCodes,
  generateTotpSecret,
  getAccountByEmail,
  getAccountByUsername,
  hashBackupCode,
  hasStaffAccount as readHasStaffAccount,
  hashPassword,
  migrateLegacyEmail,
  MIN_PASSWORD_LENGTH,
  nextStaffId,
  normalizeEmailOnLogin,
  peekInvite,
  persistSession,
  readSession,
  seedAccountFromSessionIfNeeded,
  toPublicUser,
  totpOtpauthUrl,
  upsertAccount,
  verifyPassword,
  verifyTotpCode,
  writeCredential,
  type StaffAccount,
} from '@/lib/auth';
import { ApiError, isMockApi, mapStaffUser } from '@/lib/api/http';
import {
  acceptStaffInvite,
  completeStaffMfa,
  confirmStaffTotp,
  disableStaffTotp,
  getStaffAuthOptions,
  getStaffMe,
  loginStaff,
  logoutStaff,
  requestStaffForgot,
  resetStaffPassword,
  setupStaff,
  startStaffTotp,
} from '@/lib/api/staff';

export { hashPassword, verifyPassword, migrateLegacyEmail };

interface RegisterData {
  username: string;
  displayName: string;
  email: string;
  password: string;
}

interface AcceptInviteData {
  username: string;
  displayName: string;
  password: string;
}

interface AuthContextType {
  user: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasStaffAccount: boolean;
  ssoEnabled: boolean;
  login: (email: string, password: string) => Promise<void>;
  completeMfa: (code: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  acceptInvite: (token: string, data: AcceptInviteData) => Promise<void>;
  resetPassword: (email: string, password: string) => Promise<void>;
  requestForgot: (email: string) => Promise<void>;
  resetPasswordWithToken: (token: string, password: string) => Promise<void>;
  startTotp: () => Promise<{ secret: string; otpauthUrl: string }>;
  confirmTotp: (code: string) => Promise<string[]>;
  disableTotp: (password: string) => Promise<void>;
  logout: () => void;
  updateUser: (patch: Partial<AdminUser>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function registerErrorCode(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 403) return 'STAFF_LOCKED';
    if (err.status === 400 && /password/i.test(err.message)) return 'PASSWORD_TOO_SHORT';
  }
  return 'REGISTER_FAILED';
}

function acceptErrorCode(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 409) return 'ALREADY_STAFF';
    if (err.status === 400 && /password/i.test(err.message)) return 'PASSWORD_TOO_SHORT';
    if (err.status === 400) return 'INVITE_INVALID';
  }
  return 'INVITE_INVALID';
}

function loginErrorCode(err: unknown): string {
  if (err instanceof ApiError && err.message === 'MFA_REQUIRED') return 'MFA_REQUIRED';
  return 'INVALID_CREDENTIALS';
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasStaffAccount, setHasStaffAccount] = useState(false);
  const [ssoEnabled, setSsoEnabled] = useState(false);
  const [pendingMfaEmail, setPendingMfaEmail] = useState<string | null>(null);

  const refreshStaffFlag = useCallback(() => {
    setHasStaffAccount(readHasStaffAccount());
  }, []);

  const persistUser = useCallback((next: AdminUser | null) => {
    setUser(next);
    persistSession(next);
  }, []);

  useEffect(() => {
    if (!isMockApi()) {
      let cancelled = false;
      void getStaffAuthOptions()
        .then((options) => {
          if (cancelled) return;
          setHasStaffAccount(!options.setupRequired);
          setSsoEnabled(options.ssoEnabled);
        })
        .catch(() => {
          if (cancelled) return;
          setHasStaffAccount(false);
          setSsoEnabled(false);
        });
      getStaffMe()
        .then((payload) => {
          if (cancelled) return;
          setUser(mapStaffUser(payload.user));
          setHasStaffAccount(true);
        })
        .catch(() => {
          if (cancelled) return;
          setUser(null);
        })
        .finally(() => {
          if (!cancelled) setIsLoading(false);
        });
      return () => {
        cancelled = true;
      };
    }

    seedAccountFromSessionIfNeeded();
    const session = readSession();
    if (session) {
      const account = getAccountByEmail(session.email);
      const next = account ? toPublicUser(account) : session;
      setUser(next);
      persistSession(next);
    }
    refreshStaffFlag();
    setSsoEnabled(false);
    setIsLoading(false);
    return undefined;
  }, [refreshStaffFlag]);

  const login = async (email: string, password: string) => {
    if (!isMockApi()) {
      try {
        const payload = await loginStaff(email, password);
        setUser(mapStaffUser(payload.user));
        setHasStaffAccount(true);
        setPendingMfaEmail(null);
      } catch (err) {
        throw new Error(loginErrorCode(err));
      }
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 500));

    if (!email || !password) {
      throw new Error('INVALID_CREDENTIALS');
    }

    const normalizedEmail = normalizeEmailOnLogin(email);
    const account = getAccountByEmail(normalizedEmail);
    if (!account?.passwordHash || !verifyPassword(password, account.passwordHash)) {
      throw new Error('INVALID_CREDENTIALS');
    }
    if (account.totpEnabled && account.totpSecret) {
      setPendingMfaEmail(normalizedEmail);
      throw new Error('MFA_REQUIRED');
    }

    persistUser(toPublicUser(account));
  };

  const completeMfa = async (code: string) => {
    if (!isMockApi()) {
      try {
        const payload = await completeStaffMfa(code);
        setUser(mapStaffUser(payload.user));
        setHasStaffAccount(true);
        setPendingMfaEmail(null);
      } catch {
        throw new Error('INVALID_MFA');
      }
      return;
    }
    if (!pendingMfaEmail) {
      throw new Error('INVALID_MFA');
    }
    const account = getAccountByEmail(pendingMfaEmail);
    if (!account?.totpSecret) {
      throw new Error('INVALID_MFA');
    }
    const totpOk = await verifyTotpCode(account.totpSecret, code);
    const backupHash = hashBackupCode(code);
    const backupIndex = (account.totpBackupHashes ?? []).indexOf(backupHash);
    if (!totpOk && backupIndex < 0) {
      throw new Error('INVALID_MFA');
    }
    if (backupIndex >= 0) {
      const nextHashes = (account.totpBackupHashes ?? []).filter(
        (_, index) => index !== backupIndex,
      );
      upsertAccount({ ...account, totpBackupHashes: nextHashes });
    }
    setPendingMfaEmail(null);
    persistUser(toPublicUser(account));
  };

  const register = async (data: RegisterData) => {
    if (!isMockApi()) {
      try {
        const payload = await setupStaff({
          email: data.email,
          password: data.password,
          displayName: data.displayName.trim(),
        });
        setUser(mapStaffUser(payload.user));
        setHasStaffAccount(true);
      } catch (err) {
        const code = registerErrorCode(err);
        if (code === 'STAFF_LOCKED') setHasStaffAccount(true);
        throw new Error(code);
      }
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 300));
    if (readHasStaffAccount()) {
      throw new Error('STAFF_LOCKED');
    }
    const email = normalizeEmailOnLogin(data.email);
    const username = data.username.trim();
    if (getAccountByEmail(email)) {
      throw new Error('EMAIL_TAKEN');
    }
    if (getAccountByUsername(username)) {
      throw new Error('USERNAME_TAKEN');
    }
    if (data.password.length < MIN_PASSWORD_LENGTH) {
      throw new Error('PASSWORD_TOO_SHORT');
    }
    const passwordHash = hashPassword(data.password);
    const account: StaffAccount = {
      id: '1',
      email,
      username,
      displayName: data.displayName.trim(),
      role: 'super_admin',
      createdAt: new Date().toISOString().split('T')[0],
      passwordHash,
    };
    upsertAccount(account);
    writeCredential(email, passwordHash);
    persistUser(toPublicUser(account));
    refreshStaffFlag();
  };

  const acceptInvite = async (token: string, data: AcceptInviteData) => {
    if (!isMockApi()) {
      try {
        const payload = await acceptStaffInvite({
          token,
          password: data.password,
          displayName: data.displayName.trim(),
        });
        setUser(mapStaffUser(payload.user));
        setHasStaffAccount(true);
      } catch (err) {
        throw new Error(acceptErrorCode(err));
      }
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 300));
    const invite = peekInvite(token);
    if (!invite) {
      throw new Error('INVITE_INVALID');
    }
    const session = readSession();
    if (session && session.email.trim().toLowerCase() !== invite.email) {
      throw new Error('INVITE_INVALID');
    }
    const username = data.username.trim();
    const displayName = data.displayName.trim();
    if (!username || username.length < 3) {
      throw new Error('USERNAME_INVALID');
    }
    if (!displayName) {
      throw new Error('DISPLAY_NAME_REQUIRED');
    }
    if (getAccountByEmail(invite.email)) {
      throw new Error('ALREADY_STAFF');
    }
    if (getAccountByUsername(username)) {
      throw new Error('USERNAME_TAKEN');
    }
    if (data.password.length < MIN_PASSWORD_LENGTH) {
      throw new Error('PASSWORD_TOO_SHORT');
    }
    consumeInvite(token);
    const passwordHash = hashPassword(data.password);
    const account: StaffAccount = {
      id: nextStaffId(),
      email: invite.email,
      username,
      displayName,
      role: invite.role,
      createdAt: new Date().toISOString().split('T')[0],
      passwordHash,
    };
    upsertAccount(account);
    writeCredential(invite.email, passwordHash);
    persistUser(toPublicUser(account));
    refreshStaffFlag();
  };

  const requestForgot = async (email: string) => {
    if (!isMockApi()) {
      await requestStaffForgot(email);
    }
  };

  const resetPassword = async (email: string, password: string) => {
    const normalized = normalizeEmailOnLogin(email);
    const account = getAccountByEmail(normalized);
    if (!account) return;
    const passwordHash = hashPassword(password);
    upsertAccount({ ...account, passwordHash });
    writeCredential(normalized, passwordHash);
  };

  const resetPasswordWithToken = async (token: string, password: string) => {
    if (!isMockApi()) {
      await resetStaffPassword(token, password);
    }
  };

  const startTotp = async () => {
    if (!isMockApi()) {
      return startStaffTotp();
    }
    const session = readSession();
    if (!session) throw new Error('UNAUTHORIZED');
    const account = getAccountByEmail(session.email);
    if (!account) throw new Error('UNAUTHORIZED');
    if (account.totpEnabled) throw new Error('MFA_ALREADY_ENABLED');
    const secret = generateTotpSecret();
    upsertAccount({ ...account, totpSecret: secret, totpEnabled: false });
    return { secret, otpauthUrl: totpOtpauthUrl(account.email, secret) };
  };

  const confirmTotp = async (code: string) => {
    if (!isMockApi()) {
      const { backupCodes } = await confirmStaffTotp(code);
      setUser((prev) => (prev ? { ...prev, totpEnabled: true } : prev));
      return backupCodes;
    }
    const session = readSession();
    if (!session) throw new Error('UNAUTHORIZED');
    const account = getAccountByEmail(session.email);
    if (!account?.totpSecret) throw new Error('MFA_NOT_STARTED');
    if (!(await verifyTotpCode(account.totpSecret, code))) {
      throw new Error('INVALID_MFA');
    }
    const backupCodes = generateBackupCodes();
    const next = {
      ...account,
      totpEnabled: true,
      totpBackupHashes: backupCodes.map(hashBackupCode),
    };
    upsertAccount(next);
    persistUser(toPublicUser(next));
    return backupCodes;
  };

  const disableTotp = async (password: string) => {
    if (!isMockApi()) {
      await disableStaffTotp(password);
      setUser((prev) => (prev ? { ...prev, totpEnabled: false } : prev));
      return;
    }
    const session = readSession();
    if (!session) throw new Error('UNAUTHORIZED');
    const account = getAccountByEmail(session.email);
    if (!account?.passwordHash || !verifyPassword(password, account.passwordHash)) {
      throw new Error('INVALID_CREDENTIALS');
    }
    const next = {
      ...account,
      totpEnabled: false,
      totpSecret: undefined,
      totpBackupHashes: [],
    };
    upsertAccount(next);
    persistUser(toPublicUser(next));
  };

  const logout = () => {
    if (!isMockApi()) {
      void logoutStaff().catch(() => undefined);
      setUser(null);
      return;
    }
    persistUser(null);
  };

  const updateUser = (patch: Partial<AdminUser>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = migrateLegacyEmail({ ...prev, ...patch });
      if (!isMockApi()) {
        return next;
      }
      if (patch.passwordHash) {
        writeCredential(next.email, patch.passwordHash);
        const existing = getAccountByEmail(next.email);
        if (existing) {
          upsertAccount({ ...existing, ...next, passwordHash: patch.passwordHash });
        }
      } else {
        const existing = getAccountByEmail(prev.email);
        if (existing) {
          const nextEmail = next.email.trim().toLowerCase();
          upsertAccount({
            ...existing,
            ...next,
            email: nextEmail,
            passwordHash: existing.passwordHash,
          });
        }
      }
      persistSession(next);
      return next;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        hasStaffAccount,
        ssoEnabled,
        login,
        completeMfa,
        register,
        acceptInvite,
        resetPassword,
        requestForgot,
        resetPasswordWithToken,
        startTotp,
        confirmTotp,
        disableTotp,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
