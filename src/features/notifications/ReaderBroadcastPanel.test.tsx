import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ReaderBroadcastPanel from './ReaderBroadcastPanel';

describe('ReaderBroadcastPanel', () => {
  it('shows mock honesty for writers and hides compose for look-only staff', async () => {
    const user = userEvent.setup({ delay: null });
    const { rerender } = render(<ReaderBroadcastPanel canWrite />);

    expect(screen.getByRole('heading', { name: /send to readers/i })).toBeInTheDocument();
    expect(screen.getByText(/this mock desk cannot reach readers/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /reader broadcasts/i })).toBeInTheDocument();
    expect(screen.getByText(/broadcasts need the catalog api/i)).toBeInTheDocument();

    await user.type(screen.getByLabelText(/title \(en\)/i), 'Maintenance');
    await user.type(screen.getByLabelText(/title \(mm\)/i), 'ပြုပြင်မည်');
    await user.type(screen.getByLabelText(/message \(en\)/i), 'We will pause.');
    await user.type(screen.getByLabelText(/message \(mm\)/i), 'ရပ်နားမည်။');
    await user.click(screen.getByRole('button', { name: /preview and send/i }));
    expect(screen.getAllByText(/this mock desk cannot reach readers/i).length).toBeGreaterThan(0);

    rerender(<ReaderBroadcastPanel canWrite={false} />);
    expect(screen.queryByRole('heading', { name: /send to readers/i })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /reader broadcasts/i })).toBeInTheDocument();
  });
});
