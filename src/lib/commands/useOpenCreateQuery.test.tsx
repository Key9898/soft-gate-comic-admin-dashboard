import { StrictMode, useState } from 'react';
import { describe, expect, it } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { useOpenCreateQuery } from './useOpenCreateQuery';

const Probe = ({ enabled, kind }: { enabled: boolean; kind?: string }) => {
  const [opened, setOpened] = useState(false);
  useOpenCreateQuery(() => setOpened(true), enabled, kind);
  return opened ? <div data-testid="create-opened">open</div> : <div>page</div>;
};

describe('useOpenCreateQuery', () => {
  it('opens once for ?new=1 under StrictMode remount', async () => {
    render(
      <StrictMode>
        <MemoryRouter initialEntries={['/authors?new=1']}>
          <Routes>
            <Route path="/authors" element={<Probe enabled />} />
          </Routes>
        </MemoryRouter>
      </StrictMode>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('create-opened')).toBeInTheDocument();
    });
  });

  it('does not open when disabled (viewer)', async () => {
    render(
      <MemoryRouter initialEntries={['/genres?new=1']}>
        <Routes>
          <Route path="/genres" element={<Probe enabled={false} />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('page')).toBeInTheDocument();
    expect(screen.queryByTestId('create-opened')).not.toBeInTheDocument();
  });

  it('opens once for ?new=member when kind is member', async () => {
    render(
      <StrictMode>
        <MemoryRouter initialEntries={['/about?new=member']}>
          <Routes>
            <Route path="/about" element={<Probe enabled kind="member" />} />
          </Routes>
        </MemoryRouter>
      </StrictMode>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('create-opened')).toBeInTheDocument();
    });
  });

  it('does not open ?new=member when kind defaults to 1', async () => {
    render(
      <MemoryRouter initialEntries={['/about?new=member']}>
        <Routes>
          <Route path="/about" element={<Probe enabled />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('page')).toBeInTheDocument();
    expect(screen.queryByTestId('create-opened')).not.toBeInTheDocument();
  });
});
