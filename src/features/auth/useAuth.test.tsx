import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { AuthProvider, useAuth, migrateLegacyEmail, hashPassword } from './useAuth';

const wrapper = ({ children }: { children: ReactNode }) => <AuthProvider>{children}</AuthProvider>;

describe('migrateLegacyEmail', () => {
  it('rewrites @webpad.com to @softgatecomic.com', () => {
    const migrated = migrateLegacyEmail({
      id: '1',
      email: 'admin@webpad.com',
      username: 'admin',
      displayName: 'Admin',
      role: 'super_admin',
    });

    expect(migrated.email).toBe('admin@softgatecomic.com');
    expect(migrated.username).toBe('admin');
    expect(migrated.displayName).toBe('Admin');
  });

  it('leaves softgate emails unchanged', () => {
    const user = {
      id: '1',
      email: 'admin@softgatecomic.com',
      username: 'admin',
      displayName: 'Admin',
      role: 'super_admin' as const,
    };
    expect(migrateLegacyEmail(user)).toEqual(user);
  });
});

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('throws error when used outside AuthProvider', () => {
    expect(() => {
      renderHook(() => useAuth());
    }).toThrow('useAuth must be used within an AuthProvider');
  });

  it('provides initial unauthenticated state', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it('loads user from localStorage on mount', async () => {
    const storedUser = {
      id: '1',
      email: 'admin@test.com',
      username: 'admin',
      displayName: 'Admin',
      role: 'super_admin' as const,
    };

    localStorage.setItem('softgate_admin_user', JSON.stringify(storedUser));

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual(storedUser);
  });

  it('migrates legacy webpad email when loading from localStorage', async () => {
    localStorage.setItem(
      'softgate_admin_user',
      JSON.stringify({
        id: '1',
        email: 'admin@webpad.com',
        username: 'admin',
        displayName: 'Admin',
        role: 'super_admin',
      }),
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.user?.email).toBe('admin@softgatecomic.com');
    expect(JSON.parse(localStorage.getItem('softgate_admin_user') || '{}').email).toBe(
      'admin@softgatecomic.com',
    );
  });

  it('logs in successfully', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.login('admin@test.com', 'password');
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).not.toBeNull();
    expect(result.current.user?.email).toBe('admin@test.com');
  });

  it('normalizes webpad email on login', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.login('admin@webpad.com', 'password');
    });

    expect(result.current.user?.email).toBe('admin@softgatecomic.com');
  });

  it('updates user and persists to localStorage', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.login('admin@softgatecomic.com', 'password');
    });

    act(() => {
      result.current.updateUser({
        displayName: 'SoftGate Admin',
        avatar: 'data:image/png;base64,abc',
      });
    });

    expect(result.current.user?.displayName).toBe('SoftGate Admin');
    expect(result.current.user?.avatar).toBe('data:image/png;base64,abc');
    expect(JSON.parse(localStorage.getItem('softgate_admin_user') || '{}').displayName).toBe(
      'SoftGate Admin',
    );
  });

  it('rejects login when passwordHash is set and password is wrong', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.login('admin@softgatecomic.com', 'password');
    });

    act(() => {
      result.current.updateUser({ passwordHash: hashPassword('secret123') });
    });

    act(() => {
      result.current.logout();
    });

    await expect(
      act(async () => {
        await result.current.login('admin@softgatecomic.com', 'wrong');
      }),
    ).rejects.toThrow('Invalid credentials');
  });

  it('logs out successfully', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.login('admin@test.com', 'password');
    });

    expect(result.current.isAuthenticated).toBe(true);

    act(() => {
      result.current.logout();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it('sets isLoading to false after checking localStorage', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });
});
