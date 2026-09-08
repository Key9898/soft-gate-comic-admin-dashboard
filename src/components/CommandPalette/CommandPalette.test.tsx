import { describe, expect, it } from 'vitest';
import userEvent from '@testing-library/user-event';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { AuthProvider } from '@/features/auth/useAuth';
import { ThemeProvider } from '@/lib/theme';
import CommandPalette from './CommandPalette';
import { CommandPaletteProvider } from './CommandPaletteContext';

const PathProbe = () => {
  const location = useLocation();
  return <div data-testid="path">{location.pathname}</div>;
};

const wrap = () =>
  render(
    <HelmetProvider>
      <ThemeProvider>
        <MemoryRouter initialEntries={['/']}>
          <AuthProvider>
            <CommandPaletteProvider>
              <CommandPalette />
              <Routes>
                <Route path="*" element={<PathProbe />} />
              </Routes>
            </CommandPaletteProvider>
          </AuthProvider>
        </MemoryRouter>
      </ThemeProvider>
    </HelmetProvider>,
  );

describe('CommandPalette', () => {
  it('opens on Ctrl+K, navigates to webtoons on Enter, and closes on Escape', async () => {
    const user = userEvent.setup({ delay: null });
    wrap();

    await user.keyboard('{Control>}k{/Control}');
    const dialog = await screen.findByRole('dialog', { name: 'Command palette' });
    expect(dialog).toBeInTheDocument();

    await user.type(screen.getByLabelText('Command search'), 'webtoons');
    await user.keyboard('{Enter}');
    expect(screen.getByTestId('path')).toHaveTextContent('/webtoons');
    expect(screen.queryByRole('dialog', { name: 'Command palette' })).not.toBeInTheDocument();

    await user.keyboard('{Control>}k{/Control}');
    expect(await screen.findByRole('dialog', { name: 'Command palette' })).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog', { name: 'Command palette' })).not.toBeInTheDocument();
  });

  it('shows the footer and navigates to /help on the help command', async () => {
    const user = userEvent.setup({ delay: null });
    wrap();

    await user.keyboard('{Control>}k{/Control}');
    expect(
      await screen.findByText('Type to filter · ↑↓ to move · Enter to run · Esc to close'),
    ).toBeInTheDocument();

    await user.type(screen.getByLabelText('Command search'), 'help');
    await user.keyboard('{Enter}');
    expect(screen.getByTestId('path')).toHaveTextContent('/help');
  });
});
