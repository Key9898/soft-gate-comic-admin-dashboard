import { describe, it, expect } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@/test/utils';
import { AuthProvider } from '@/features/auth/useAuth';
import { DataProvider } from '@/lib/DataContext';
import { SidebarProvider } from '@/lib/SidebarContext';
import { APP_NAME } from '@/config';
import Sidebar from './Sidebar';

const wrap = () =>
  render(
    <AuthProvider>
      <DataProvider>
        <SidebarProvider>
          <Sidebar />
        </SidebarProvider>
      </DataProvider>
    </AuthProvider>,
  );

describe('Sidebar collapse toggle', () => {
  it('straddles expand/collapse with aria-expanded and hides the title span when collapsed', async () => {
    const user = userEvent.setup({ delay: null });
    wrap();

    const collapse = screen.getByRole('button', { name: 'Collapse sidebar' });
    expect(collapse).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText(APP_NAME, { selector: 'span' })).toBeInTheDocument();

    await user.click(collapse);

    const expand = screen.getByRole('button', { name: 'Expand sidebar' });
    expect(expand).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText(APP_NAME, { selector: 'span' })).not.toBeInTheDocument();

    await user.click(expand);

    expect(screen.getByRole('button', { name: 'Collapse sidebar' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    expect(screen.getByText(APP_NAME, { selector: 'span' })).toBeInTheDocument();
  });

  it('shows section labels when expanded and hides them when collapsed', async () => {
    const user = userEvent.setup({ delay: null });
    wrap();

    expect(screen.getByText('Catalog')).toBeInTheDocument();
    expect(screen.getByText('Community')).toBeInTheDocument();
    expect(screen.getByText('Business')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Collapse sidebar' }));

    expect(screen.queryByText('Catalog')).not.toBeInTheDocument();
    expect(screen.queryByText('Admin')).not.toBeInTheDocument();
  });
});
