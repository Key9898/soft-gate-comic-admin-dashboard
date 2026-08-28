import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { AuthProvider, useAuth, migrateLegacyEmail } from './useAuth';
import { hashPassword } from '@/lib/auth';

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
    expect(result.current.hasStaffAccount).toBe(false);
  });

  it('loads user from localStorage on mount', async () => {
    const storedUser = {
      id: '1',
      email: 'admin@test.com',
      username: 'admin',
      displayName: 'Admin',
      role: 'super_admin' as const,
      passwordHash: hashPassword('secret12'),
    };

    localStorage.setItem('softgate_admin_user', JSON.stringify(storedUser));

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user?.email).toBe('admin@test.com');
    expect(result.current.hasStaffAccount).toBe(true);
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
        passwordHash: hashPassword('secret12'),
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

  it('register then login sets user as super_admin', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.register({
        username: 'admin',
        displayName: 'Admin',
        email: 'admin@test.com',
        password: 'password1',
      });
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user?.role).toBe('super_admin');
    expect(result.current.user?.id).toBe('1');
    expect(result.current.hasStaffAccount).toBe(true);

    act(() => {
      result.current.logout();
    });

    await act(async () => {
      await result.current.login('admin@test.com', 'password1');
    });
    expect(result.current.user?.email).toBe('admin@test.com');
  });

  it('rejects login for unknown email', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await expect(
      act(async () => {
        await result.current.login('nobody@test.com', 'password1');
      }),
    ).rejects.toThrow('INVALID_CREDENTIALS');
  });

  it('rejects a second register', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.register({
        username: 'admin',
        displayName: 'Admin',
        email: 'admin@test.com',
        password: 'password1',
      });
    });

    act(() => {
      result.current.logout();
    });

    await expect(
      act(async () => {
        await result.current.register({
          username: 'other',
          displayName: 'Other',
          email: 'other@test.com',
          password: 'password1',
        });
      }),
    ).rejects.toThrow('STAFF_LOCKED');
  });

  it('acceptInvite creates an admin and keeps public register locked', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.register({
        username: 'admin',
        displayName: 'Admin',
        email: 'admin@test.com',
        password: 'password1',
      });
    });

    const { createInvite } = await import('@/lib/auth');
    const { rawToken } = createInvite({
      email: 'editor@test.com',
      inviterId: '1',
      actorRole: 'super_admin',
    });

    act(() => {
      result.current.logout();
    });

    await act(async () => {
      await result.current.acceptInvite(rawToken, {
        username: 'editor',
        displayName: 'Editor',
        password: 'password1',
      });
    });

    expect(result.current.user?.role).toBe('admin');
    expect(result.current.user?.email).toBe('editor@test.com');
    expect(result.current.user?.id).toBe('2');

    act(() => {
      result.current.logout();
    });

    await expect(
      act(async () => {
        await result.current.register({
          username: 'third',
          displayName: 'Third',
          email: 'third@test.com',
          password: 'password1',
        });
      }),
    ).rejects.toThrow('STAFF_LOCKED');
  });

  it('acceptInvite persists the invited role', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.register({
        username: 'admin',
        displayName: 'Admin',
        email: 'admin@test.com',
        password: 'password1',
      });
    });

    const { createInvite } = await import('@/lib/auth');
    const { rawToken } = createInvite({
      email: 'member@test.com',
      inviterId: '1',
      actorRole: 'super_admin',
      role: 'member',
    });

    act(() => {
      result.current.logout();
    });

    await act(async () => {
      await result.current.acceptInvite(rawToken, {
        username: 'member',
        displayName: 'Member',
        password: 'password1',
      });
    });

    expect(result.current.user?.role).toBe('member');
    expect(result.current.user?.email).toBe('member@test.com');
  });

  it('rejects register passwords shorter than 8 characters', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await expect(
      act(async () => {
        await result.current.register({
          username: 'admin',
          displayName: 'Admin',
          email: 'admin@test.com',
          password: 'short',
        });
      }),
    ).rejects.toThrow('PASSWORD_TOO_SHORT');
  });

  it('normalizes webpad email on login', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.register({
        username: 'admin',
        displayName: 'Admin',
        email: 'admin@webpad.com',
        password: 'password1',
      });
    });

    act(() => {
      result.current.logout();
    });

    await act(async () => {
      await result.current.login('admin@webpad.com', 'password1');
    });

    expect(result.current.user?.email).toBe('admin@softgatecomic.com');
  });

  it('rejects login when password is wrong', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.register({
        username: 'admin',
        displayName: 'Admin',
        email: 'admin@softgatecomic.com',
        password: 'secret123',
      });
    });

    act(() => {
      result.current.logout();
    });

    await expect(
      act(async () => {
        await result.current.login('admin@softgatecomic.com', 'wrongpass');
      }),
    ).rejects.toThrow('INVALID_CREDENTIALS');
  });

  it('logs out successfully', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.register({
        username: 'admin',
        displayName: 'Admin',
        email: 'admin@test.com',
        password: 'password1',
      });
    });

    act(() => {
      result.current.logout();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });
});
