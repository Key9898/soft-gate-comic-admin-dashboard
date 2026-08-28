import { describe, it, expect, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { HelmetProvider } from 'react-helmet-async';
import { render, screen } from '@/test/utils';
import { AuthProvider } from '@/features/auth/useAuth';
import { DataProvider } from '@/lib/DataContext';
import {
  ROLE_BLURBS,
  SUPER_ADMIN_BLURB,
  hashPassword,
  upsertAccount,
  writeCredential,
} from '@/lib/auth';
import TeamPage from './TeamPage';

const seed = (
  role: 'super_admin' | 'admin' | 'member' | 'viewer',
  id = '1',
  email = 'admin@test.com',
) => {
  const passwordHash = hashPassword('password1');
  const account = {
    id,
    email,
    username: email.split('@')[0],
    displayName: role === 'super_admin' ? 'Owner' : 'Editor',
    role,
    createdAt: '2026-08-23',
    passwordHash,
  };
  upsertAccount(account);
  writeCredential(email, passwordHash);
  localStorage.setItem('softgate_admin_user', JSON.stringify(account));
};

const wrap = () =>
  render(
    <HelmetProvider>
      <AuthProvider>
        <DataProvider>
          <TeamPage />
        </DataProvider>
      </AuthProvider>
    </HelmetProvider>,
  );

describe('TeamPage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('shows a Roles legend for Super Admin without opening the invite modal', () => {
    seed('super_admin');
    wrap();
    expect(screen.getByRole('heading', { name: 'Roles' })).toBeInTheDocument();
    expect(screen.getByText(SUPER_ADMIN_BLURB)).toBeInTheDocument();
    expect(screen.getByText(ROLE_BLURBS.admin)).toBeInTheDocument();
    expect(screen.getByText(ROLE_BLURBS.member)).toBeInTheDocument();
    expect(screen.getByText(ROLE_BLURBS.viewer)).toBeInTheDocument();
  });

  it('shows the Roles legend for Viewer and does not offer Invite', () => {
    seed('viewer');
    wrap();
    expect(screen.getByRole('heading', { name: 'Roles' })).toBeInTheDocument();
    expect(screen.getByText(SUPER_ADMIN_BLURB)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /invite member/i })).not.toBeInTheDocument();
  });

  it('lets a Super Admin invite Admin, Member, or Viewer and does not offer Remove on Super Admin', async () => {
    const user = userEvent.setup({ delay: null });
    seed('super_admin');
    wrap();
    expect(screen.getByRole('heading', { name: 'Team' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /invite member/i })).toBeInTheDocument();
    expect(screen.getByText('Permanent')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^remove$/i })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /invite member/i }));
    const select = screen.getByLabelText('Role');
    expect(select).toHaveValue('admin');
    expect(screen.getByRole('option', { name: 'Admin' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Member' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Viewer' })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Super Admin' })).not.toBeInTheDocument();
    expect(screen.getAllByText(ROLE_BLURBS.admin)).toHaveLength(2);
  });

  it('lets Admin invite Member and Viewer only', async () => {
    const user = userEvent.setup({ delay: null });
    seed('super_admin');
    seed('admin', '2', 'editor@test.com');
    localStorage.setItem(
      'softgate_admin_user',
      JSON.stringify({
        id: '2',
        email: 'editor@test.com',
        username: 'editor',
        displayName: 'Editor',
        role: 'admin',
        createdAt: '2026-08-23',
      }),
    );
    wrap();
    expect(screen.getByRole('button', { name: /invite member/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^remove$/i })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /invite member/i }));
    expect(screen.getByLabelText('Role')).toHaveValue('member');
    expect(screen.queryByRole('option', { name: 'Admin' })).not.toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Member' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Viewer' })).toBeInTheDocument();
    expect(screen.getAllByText(ROLE_BLURBS.member)).toHaveLength(2);
  });

  it('confirms the normalized email and role on the copy-link step', async () => {
    const user = userEvent.setup({ delay: null });
    seed('super_admin');
    wrap();
    await user.click(screen.getByRole('button', { name: /invite member/i }));
    await user.type(screen.getByLabelText('Email address'), 'New.Staff@Example.COM');
    await user.click(screen.getByRole('button', { name: /^invite$/i }));
    expect(screen.getByText('Inviting new.staff@example.com as Admin.')).toBeInTheDocument();
    expect(
      screen.getByText('This demo cannot send email. Copy the link and share it.'),
    ).toBeInTheDocument();
  });
});
