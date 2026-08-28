import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { AdminUser } from '@softgate/shared';
import {
  consumeInvite,
  getAccountByEmail,
  getAccountByUsername,
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
  upsertAccount,
  verifyPassword,
  writeCredential,
  type StaffAccount,
} from '@/lib/auth';
import { ApiError, isMockApi, mapStaffUser } from '@/lib/api/http';
import {
  acceptStaffInvite,
  getStaffMe,
  loginStaff,
  logoutStaff,
  registerStaff,
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
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  acceptInvite: (token: string, data: AcceptInviteData) => Promise<void>;
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

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasStaffAccount, setHasStaffAccount] = useState(false);

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
      getStaffMe()
        .then((payload) => {
          if (cancelled) return;
          setUser(mapStaffUser(payload.user));
          setHasStaffAccount(true);
        })
        .catch(() => {
          if (cancelled) return;
          setUser(null);
          setHasStaffAccount(false);
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
      setUser(session);
      persistSession(session);
    }
    refreshStaffFlag();
    setIsLoading(false);
    return undefined;
  }, [refreshStaffFlag]);

  const login = async (email: string, password: string) => {
    if (!isMockApi()) {
      try {
        const payload = await loginStaff(email, password);
        setUser(mapStaffUser(payload.user));
        setHasStaffAccount(true);
      } catch {
        throw new Error('INVALID_CREDENTIALS');
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

    persistUser(toPublicUser(account));
  };

  const register = async (data: RegisterData) => {
    if (!isMockApi()) {
      try {
        const payload = await registerStaff({
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
        login,
        register,
        acceptInvite,
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
