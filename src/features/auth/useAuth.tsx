import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { AdminUser } from '@softgate/shared';

const AUTH_STORAGE_KEY = 'softgate_admin_user';
const CREDENTIALS_STORAGE_KEY = 'softgate_admin_credentials';
const LEGACY_EMAIL_DOMAIN = '@webpad.com';
const SOFTGATE_EMAIL_DOMAIN = '@softgatecomic.com';
const MOCK_HASH_PREFIX = 'sgmock:';

type CredentialMap = Record<string, string>;

const readCredentials = (): CredentialMap => {
  try {
    const raw = localStorage.getItem(CREDENTIALS_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CredentialMap) : {};
  } catch {
    return {};
  }
};

const writeCredential = (email: string, passwordHash: string) => {
  const next = { ...readCredentials(), [email.toLowerCase()]: passwordHash };
  localStorage.setItem(CREDENTIALS_STORAGE_KEY, JSON.stringify(next));
};

interface AuthContextType {
  user: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (patch: Partial<AdminUser>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const hashPassword = (password: string): string => {
  // Mock digest only — not for production auth.
  const encoded = btoa(unescape(encodeURIComponent(`${MOCK_HASH_PREFIX}${password}`)));
  return `${MOCK_HASH_PREFIX}${encoded}`;
};

export const verifyPassword = (password: string, passwordHash?: string): boolean => {
  if (!passwordHash) return true;
  return hashPassword(password) === passwordHash;
};

const persistUser = (adminUser: AdminUser) => {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(adminUser));
};

export const migrateLegacyEmail = (adminUser: AdminUser): AdminUser => {
  const email = adminUser.email.toLowerCase();
  if (!email.endsWith(LEGACY_EMAIL_DOMAIN)) {
    return adminUser;
  }

  const localPart = adminUser.email.split('@')[0];
  const migratedEmail = `${localPart}${SOFTGATE_EMAIL_DOMAIN}`;
  const username = localPart;
  const displayName = localPart.charAt(0).toUpperCase() + localPart.slice(1);

  return {
    ...adminUser,
    email: migratedEmail,
    username,
    displayName:
      adminUser.displayName === 'Admin' ||
      adminUser.displayName.toLowerCase() === localPart.toLowerCase() ||
      adminUser.email.startsWith(adminUser.displayName.toLowerCase())
        ? displayName
        : adminUser.displayName,
  };
};

const normalizeEmailOnLogin = (email: string): string => {
  const trimmed = email.trim();
  if (trimmed.toLowerCase().endsWith(LEGACY_EMAIL_DOMAIN)) {
    return `${trimmed.split('@')[0]}${SOFTGATE_EMAIL_DOMAIN}`;
  }
  return trimmed;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem(AUTH_STORAGE_KEY);
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser) as AdminUser;
        const migrated = migrateLegacyEmail(parsed);
        setUser(migrated);
        if (migrated.email !== parsed.email) {
          persistUser(migrated);
        }
      } catch {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (!email || !password) {
      throw new Error('Invalid credentials');
    }

    const normalizedEmail = normalizeEmailOnLogin(email);
    const storedHash = readCredentials()[normalizedEmail.toLowerCase()];
    if (storedHash && !verifyPassword(password, storedHash)) {
      throw new Error('Invalid credentials');
    }

    const storedRaw = localStorage.getItem(AUTH_STORAGE_KEY);
    let existing: AdminUser | null = null;
    if (storedRaw) {
      try {
        existing = migrateLegacyEmail(JSON.parse(storedRaw) as AdminUser);
      } catch {
        existing = null;
      }
    }

    const sameUser = !!existing && existing.email.toLowerCase() === normalizedEmail.toLowerCase();

    const username = normalizedEmail.split('@')[0];
    const adminUser: AdminUser = {
      id: sameUser && existing ? existing.id : '1',
      email: normalizedEmail,
      username: sameUser && existing ? existing.username : username,
      displayName:
        sameUser && existing
          ? existing.displayName
          : username.charAt(0).toUpperCase() + username.slice(1),
      role: sameUser && existing ? existing.role : 'super_admin',
      createdAt: sameUser && existing ? existing.createdAt : new Date().toISOString().split('T')[0],
      avatar: sameUser && existing ? existing.avatar : undefined,
      passwordHash: storedHash || (sameUser && existing ? existing.passwordHash : undefined),
    };
    setUser(adminUser);
    persistUser(adminUser);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const updateUser = (patch: Partial<AdminUser>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = migrateLegacyEmail({ ...prev, ...patch });
      if (patch.passwordHash) {
        writeCredential(next.email, patch.passwordHash);
      }
      persistUser(next);
      return next;
    });
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, isLoading, login, logout, updateUser }}
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
