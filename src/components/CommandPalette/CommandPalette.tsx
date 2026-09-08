import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useAuth } from '@/features/auth/useAuth';
import { useStaffAccess } from '@/lib/auth/staffAccess';
import { filterCommands, groupCommands, type CommandEntry } from '@/lib/commands';
import { useTheme } from '@/lib/theme';
import { useCommandPalette } from './CommandPaletteContext';

const PALETTE_FOOTER = 'Type to filter · ↑↓ to move · Enter to run · Esc to close';

const CommandPalette = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { canWriteCatalog, canManageTeam, inviteRoles } = useStaffAccess();
  const { setPreference } = useTheme();
  const { isOpen, close, focusNonce } = useCommandPalette();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  const canInvite = canManageTeam && inviteRoles.length > 0;
  const matches = useMemo(
    () => filterCommands(query, { canWriteCatalog, canInvite }),
    [query, canWriteCatalog, canInvite],
  );
  const grouped = useMemo(() => groupCommands(matches), [matches]);
  const flat = matches;

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setActiveIndex(0);
      return;
    }
    setActiveIndex(0);
    const id = window.requestAnimationFrame(() => inputRef.current?.focus());
    return () => window.cancelAnimationFrame(id);
  }, [isOpen, focusNonce]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    if (activeIndex >= flat.length) {
      setActiveIndex(Math.max(0, flat.length - 1));
    }
  }, [activeIndex, flat.length]);

  const run = (command: CommandEntry) => {
    if (command.kind === 'go' || command.kind === 'create') {
      if (command.path) navigate(command.path);
      close();
      return;
    }
    if (command.action === 'commands') {
      setQuery('');
      return;
    }
    if (command.action === 'theme.light') setPreference('light');
    if (command.action === 'theme.dark') setPreference('dark');
    if (command.action === 'theme.system') setPreference('system');
    if (command.action === 'logout') {
      logout();
      navigate('/login');
    }
    close();
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
      return;
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, Math.max(0, flat.length - 1)));
      return;
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
      return;
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      const command = flat[activeIndex];
      if (command) run(command);
    }
  };

  let cursor = -1;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      <div className="fixed inset-0 bg-black/50" onClick={close} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className="relative z-10 w-full max-w-lg overflow-hidden rounded-xl border border-line bg-surface shadow-xl"
      >
        <div className="flex items-center gap-2 border-b border-line px-3">
          <Search className="h-4 w-4 shrink-0 text-fg-muted" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search slug or name — webtoon.new, episodes…"
            aria-label="Command search"
            className="w-full bg-transparent py-3 text-sm text-fg outline-none placeholder:text-fg-muted"
          />
        </div>
        <div className="max-h-80 overflow-y-auto py-2">
          {flat.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-fg-muted">No commands found</p>
          ) : (
            grouped.map(({ group, items }) => (
              <div key={group} className="mb-1">
                <p className="px-4 py-1 text-xs font-semibold uppercase tracking-wide text-fg-muted">
                  {group}
                </p>
                {items.map((command) => {
                  cursor += 1;
                  const index = cursor;
                  const active = index === activeIndex;
                  return (
                    <button
                      key={command.slug}
                      type="button"
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => run(command)}
                      className={`flex w-full items-center justify-between px-4 py-2 text-left text-sm ${
                        active ? 'bg-sg-hover text-primary-600' : 'text-fg-secondary'
                      }`}
                    >
                      <span>{command.title}</span>
                      <span className="font-mono text-xs text-fg-muted">{command.slug}</span>
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>
        <p className="border-t border-line px-4 py-2 text-xs text-fg-muted">{PALETTE_FOOTER}</p>
      </div>
    </div>
  );
};

export default CommandPalette;
